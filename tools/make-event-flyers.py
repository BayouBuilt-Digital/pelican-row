"""
Resizes event flyers for the News & Events page.

    python tools/make-event-flyers.py <source.jpg> <slug> [blur]

Output: assets/events/<slug>.jpg, at most 900px on the long edge.

The flyers come off Facebook at around 1400px and 250-300KB each, which is
more than the page needs: they are shown at roughly 260px wide next to the
entry text and only open full size if someone clicks through to Facebook.
900px keeps them crisp on a 2x screen at that size, and well under the
weight of the original.

Nothing is cropped. A flyer is a designed composition with text on it, so
trimming it to a tidy aspect ratio would cut the dates off.

BLUR MODE builds the placeholder that stands in for a flyer we do not have
yet. It is destroyed rather than softened: the image is shrunk to 40px,
blurred, then scaled back up, so the detail is gone from the file itself.
A CSS filter would only hide it, leaving a readable flyer sitting in the
page for anyone who looked, announcing an event that has not been booked.
It also makes the file about 5KB.
"""

import os
import sys

from PIL import Image, ImageFilter

OUT_DIR = "assets/events"
LONG_EDGE = 900


def main():
    if len(sys.argv) not in (3, 4):
        print(__doc__)
        return 1

    src, slug = sys.argv[1], sys.argv[2]
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    blur = len(sys.argv) > 3 and sys.argv[3] == "blur"

    im = Image.open(src).convert("RGB")
    before = im.size
    im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)

    if blur:
        w, h = im.size
        small = max(1, round(40 * w / max(w, h))), max(1, round(40 * h / max(w, h)))
        im = (im.resize(small, Image.LANCZOS)
                .filter(ImageFilter.GaussianBlur(2))
                .resize((w, h), Image.BICUBIC))

    out = os.path.join(OUT_DIR, slug + ".jpg")
    im.save(out, "JPEG", quality=70 if blur else 82,
            optimize=True, progressive=True)

    print("wrote %-38s %dx%d -> %dx%d  %dKB" %
          (out, before[0], before[1], im.size[0], im.size[1],
           os.path.getsize(out) // 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
