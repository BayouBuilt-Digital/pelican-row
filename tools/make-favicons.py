"""
Builds the site icons from the Pelican Row logo.

    python tools/make-favicons.py

Source:  assets/logo.png      (the full mark, squared, white background)
Outputs: assets/favicon.ico          16 / 32 / 48, for browser tabs
         assets/apple-touch-icon.png 180, for iOS home screens
         assets/logo-72.png          the small avatar in the Facebook panel

WHY TWO CROPS: the full mark is a whole scene (pelican, sun, water, pilings).
At 16px that turns to mush, so the tab icon uses a tighter crop on the bird
where the beak and body still read. Anything 72px and up uses the full mark.
Zooming out as the icon gets bigger is normal practice for detailed logos.
"""

from PIL import Image

SRC = "assets/logo.png"
TIGHT = (70, 35, 445, 410)        # bird only; chosen by eye at 16px


def square(im):
    """Pad to a square on white so nothing is distorted."""
    w, h = im.size
    side = max(w, h)
    out = Image.new("RGB", (side, side), (255, 255, 255))
    out.paste(im, ((side - w) // 2, (side - h) // 2))
    return out


def main():
    logo = Image.open(SRC).convert("RGB")
    tight = square(logo.crop(TIGHT))

    # Tab icon: pre-resize each size with a good filter rather than letting
    # the ICO writer do it, then pack them into one file.
    frames = [tight.resize((s, s), Image.LANCZOS) for s in (48, 32, 16)]
    try:
        frames[0].save("assets/favicon.ico", format="ICO",
                       sizes=[(48, 48), (32, 32), (16, 16)],
                       append_images=frames[1:])
    except TypeError:                     # older Pillow, no append_images
        tight.save("assets/favicon.ico", format="ICO",
                   sizes=[(48, 48), (32, 32), (16, 16)])

    logo.resize((180, 180), Image.LANCZOS).save("assets/apple-touch-icon.png")
    logo.resize((72, 72), Image.LANCZOS).save("assets/logo-72.png")
    print("wrote assets/favicon.ico, apple-touch-icon.png, logo-72.png")


if __name__ == "__main__":
    main()
