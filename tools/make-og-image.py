"""
Builds the social sharing image from the storefront photo.

    python tools/make-og-image.py

Source:  assets/building.jpg   (960x720, the hero photo)
Output:  assets/og-image.jpg   (1200x630)

WHY A SEPARATE FILE: the hero photo is 4:3. Facebook, iMessage, Slack and
X all want roughly 1.91:1, so sharing the 4:3 one lets each of them pick
its own crop, and they tend to cut the sign off. Cropping it here means
the sign and the doors are always both in frame.

The crop band starts below the sky and ends above the parking lot, so it
keeps the two things that identify the place: the sign and the entrance.

Note this upscales 960 -> 1200. The source is the largest we have, and a
slightly soft 1200x630 beats a sharp image that platforms crop badly. If
a higher-resolution original of the storefront turns up, drop it in and
re-run this.
"""

from PIL import Image

SRC = "assets/building.jpg"
OUT = "assets/og-image.jpg"

TARGET = (1200, 630)
CROP_TOP = 120           # chosen by eye: sign at ~160-300, doors at ~400-650


def main():
    im = Image.open(SRC).convert("RGB")
    w, h = im.size

    band = round(w * TARGET[1] / TARGET[0])     # 504 at a 960 width
    top = max(0, min(CROP_TOP, h - band))

    out = im.crop((0, top, w, top + band)).resize(TARGET, Image.LANCZOS)
    out.save(OUT, "JPEG", quality=82, optimize=True, progressive=True)

    print("wrote %s  %dx%d  from y=%d..%d" % (OUT, TARGET[0], TARGET[1], top, top + band))


if __name__ == "__main__":
    main()
