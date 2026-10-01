"""
Builds a banner image whose subject sits clear of the heading plate.

    python tools/make-offset-banner.py <source.jpg> <out.jpg> [left|right]
                                       [scale:0.9] [margin:20]
                                       [fill:blur|#rrggbb|auto] [feather:300]

scale shrinks the photo against the canvas height, which pushes its contents
further from the plate; margin is the gap at the photo's outer edge. The run
prints where the photo lands as a percentage, so you can aim it rather than
guess: the plate covers about the left 64%.

FILL is what sits behind the plate:

    blur        a blurred, darkened copy of the photo. Busy, and on a photo
                with a plain background it reads as a smear rather than a
                background — which is what it looked like on the sign.
    auto        a flat tone sampled from the photo's own edges (default).
                With feather, the photo dissolves into it and there is no
                seam to notice at all.
    #rrggbb     that exact colour, for matching the page behind it.

FEATHER is how many pixels the photo's edge dissolves over. It applies to
every edge except the one the photo is pushed against, so a scaled photo
does not leave a hard line at the top and bottom either.

Output: a 2160x700 banner (3.09:1, the shape the banner actually renders at
on a desktop) with the photo placed against one side and the rest filled
with a blurred, darkened copy of itself.

WHY THIS EXISTS, AND WHEN NOT TO USE IT

make-shop-slides.py crops to 16:9 and lets the browser crop again to fill
the band. That is right for a room: whatever survives is still a room.

It is wrong for a photograph with ONE subject that has to stay readable --
a carved sign, a storefront, a printed notice. The heading plate is
left-aligned and up to 46rem wide, so it covers roughly the left 64% of the
banner. A centred subject lands underneath it and the words go dim.

This places the photo against the opposite side instead, so the subject
clears the plate, and fills the space behind the plate with a blurred copy
rather than a flat colour -- the same trick a video player uses for a
portrait clip, which reads as deliberate instead of as a mistake.

THE PHONE CAVEAT: on a narrow screen the plate spans nearly the whole width
and the browser crops hard to the middle, so no composition keeps a subject
clear there. This buys a good desktop and tablet banner; on a phone the
photo is texture behind the words, as it is on every other page.
"""

import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

OUT_W, OUT_H = 2160, 700           # 3.09:1, the desktop banner's own shape


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    src, out = sys.argv[1], sys.argv[2]
    side, scale, margin, fill, feather = "right", 1.0, 70, "auto", 300
    for arg in sys.argv[3:]:
        if arg in ("left", "right"):
            side = arg
        elif arg.startswith("scale:"):
            scale = float(arg.split(":", 1)[1])
        elif arg.startswith("margin:"):
            margin = int(arg.split(":", 1)[1])
        elif arg.startswith("fill:"):
            fill = arg.split(":", 1)[1]
        elif arg.startswith("feather:"):
            feather = int(arg.split(":", 1)[1])
        else:
            print(__doc__)
            return 1

    im = Image.open(src).convert("RGB")
    before = im.size

    # ── what sits behind the plate ──
    if fill == "blur":
        canvas = ImageOps.fit(im, (OUT_W, OUT_H), Image.LANCZOS)
        canvas = canvas.filter(ImageFilter.GaussianBlur(34))
        canvas = ImageEnhance.Brightness(canvas).enhance(0.72)
    else:
        if fill == "auto":
            # The photo's own surround, averaged from its edges, so the
            # flat area and the photo are the same colour to begin with.
            w, h = im.size
            pts = [(30, 30), (30, h // 2), (30, h - 30), (w - 30, 30),
                   (w - 30, h // 2), (w // 2, 20), (w // 2, h - 20)]
            cols = [im.getpixel(pt) for pt in pts]
            tone = tuple(round(sum(c[i] for c in cols) / len(cols))
                         for i in range(3))
        else:
            hexval = fill.lstrip("#")
            tone = tuple(int(hexval[i:i + 2], 16) for i in (0, 2, 4))
        canvas = Image.new("RGB", (OUT_W, OUT_H), tone)

    # ── the photo itself, nothing trimmed off its sides ──
    photo = im.copy()
    photo.thumbnail((round(OUT_W * scale), round(OUT_H * scale)), Image.LANCZOS)
    x = OUT_W - photo.width - margin if side == "right" else margin
    y = (OUT_H - photo.height) // 2

    if fill == "blur" or feather <= 0:
        canvas.paste(photo, (x, y))
    else:
        # An alpha mask that ramps from transparent to opaque across the
        # feather, on every edge except the one the photo is pushed against.
        # Built as a greyscale image and used as the paste mask, so the photo
        # dissolves into the flat tone instead of ending on a line.
        mask = Image.new("L", photo.size, 255)
        px = mask.load()
        for col in range(photo.width):
            left = col / feather if side == "right" else 1.0
            right = (photo.width - 1 - col) / feather if side == "left" else 1.0
            edge = min(1.0, left, right)
            if edge >= 1.0:
                continue
            for row in range(photo.height):
                px[col, row] = min(px[col, row], round(255 * edge))
        for row in range(photo.height):
            edge = min(1.0, row / feather, (photo.height - 1 - row) / feather)
            if edge >= 1.0:
                continue
            for col in range(photo.width):
                px[col, row] = min(px[col, row], round(255 * edge))
        canvas.paste(photo, (x, y), mask)

    d = os.path.dirname(out)
    if d and not os.path.isdir(d):
        os.makedirs(d)
    canvas.save(out, "JPEG", quality=78, optimize=True, progressive=True)

    print("wrote %-34s %dx%d -> %dx%d  %dKB" %
          (out, before[0], before[1], OUT_W, OUT_H,
           os.path.getsize(out) // 1024))
    print("photo spans %.0f%%-%.0f%% across, centred at %.0f%%; "
          "the plate covers about the left 64%%" %
          (x / OUT_W * 100, (x + photo.width) / OUT_W * 100,
           (x + photo.width / 2) / OUT_W * 100))
    return 0


if __name__ == "__main__":
    sys.exit(main())
