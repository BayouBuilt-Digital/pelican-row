"""
Builds banner slideshow images.

    python tools/make-shop-slides.py <source-dir> <out-dir> <first> <last> [fit]

Reads <first>.jpg .. <last>.jpg from the source directory and writes
<out-dir>/01.jpg, 02.jpg ... at 1400x788 (16:9).

Used for both banners so far:
    assets/shop           Our Vendors
    assets/banner-events  News & Events

WHY CROP: the sources are landscape but not 16:9 (1.29 to 1.50 against
the banner's 1.78), so they still need trimming. object-fit: cover would
do it anyway, at whatever size the browser felt like, and would download
the full frame to throw part of it away. Cropping here means the file is
only the part that is ever visible.

The crop is taken from slightly above centre. These are shop interiors:
the middle holds the shelves and the goods, the bottom is mostly floor.

WHY 1400 WIDE: the banner is about 1440px at its widest and these sit
under a dark scrim with text over them, so detail beyond this is spent on
something nobody can see. Ten images at full size would be 4MB; this is
around a tenth of that, and only the first one loads up front.

FIT MODE is for photos with a subject that must survive whole: a sign, a
storefront, a printed banner. The default crop makes a 16:9 file, and the
browser then crops that again to fill a banner nearer 3:1, so about 40% of
what is left disappears. Under half the original photo survives.

Fit mode inverts it. The whole photo is placed inside a 2.6:1 canvas with
nothing trimmed, and the space either side is filled with a blurred,
darkened copy of the same photo. The browser still crops to fill the
banner, but now it eats the blurred filler instead of the subject. The
trick is the one video players use for portrait clips, and it reads as
deliberate rather than as a mistake.
"""

import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

OUT_W, OUT_H = 1400, 788           # 16:9
BIAS = 0.42                        # 0.5 is dead centre; lower looks higher up


def main():
    if len(sys.argv) not in (5, 6):
        print(__doc__)
        return 1
    src_dir, OUT_DIR = sys.argv[1], sys.argv[2]
    first, last = int(sys.argv[3]), int(sys.argv[4])
    fit = len(sys.argv) > 5 and sys.argv[5] == "fit"
    out_w, out_h = (1820, 700) if fit else (OUT_W, OUT_H)

    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    total = 0
    for i, n in enumerate(range(first, last + 1), start=1):
        src = os.path.join(src_dir, "%d.jpg" % n)
        im = Image.open(src).convert("RGB")
        w, h = im.size

        out_path = os.path.join(OUT_DIR, "%02d.jpg" % i)

        if fit:
            # Blurred, darkened copy of the photo fills the canvas ...
            canvas = ImageOps.fit(im, (out_w, out_h), Image.LANCZOS)
            canvas = canvas.filter(ImageFilter.GaussianBlur(30))
            canvas = ImageEnhance.Brightness(canvas).enhance(0.75)
            # ... and the whole photo sits on top of it, nothing trimmed.
            photo = im.copy()
            photo.thumbnail((out_w, out_h), Image.LANCZOS)
            canvas.paste(photo, ((out_w - photo.width) // 2,
                                 (out_h - photo.height) // 2))
            result = canvas
        else:
            band = min(round(w * OUT_H / OUT_W), h)   # 16:9 band at full width
            top = int((h - band) * BIAS)
            result = im.crop((0, top, w, top + band)).resize((out_w, out_h), Image.LANCZOS)

        result.save(out_path, "JPEG", quality=76, optimize=True, progressive=True)

        size = os.path.getsize(out_path)
        total += size
        print("%-26s %dx%d -> %dx%d  %3dKB" %
              (out_path, w, h, out_w, out_h, size // 1024))

    print("total %dKB across %d slides" % (total // 1024, last - first + 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
