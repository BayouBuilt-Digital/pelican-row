"""
Downloads each vendor's Facebook profile picture and saves a square copy.

    python tools/fetch-vendor-avatars.py

Output: assets/vendors/<slug>.jpg, 144x144 (72px on screen at 2x)

WHY SELF-HOST: Facebook's image URLs are signed and expire. The `oh=` and
`oe=` parameters are a signature and an expiry timestamp, so a URL copied
into the HTML today serves a broken image in a few weeks. Hotlinking also
hands Facebook a record of everyone who loads our vendor page, and the same
blockers that kill the feed embed on the home page would leave holes in
these cards.

TO REFRESH ONE: open the vendor's Facebook page, copy the profile image URL
out of the page source, paste it below and re-run. The URLs rot, so expect
to re-copy them rather than re-running this unchanged.

These are the vendors' own brand images, used to identify them on a page
that exists to send customers to them. If a vendor asks us not to use
theirs, drop the file and remove the <img> from their card; the layout
already handles a card with no avatar.
"""

import io
import os
import urllib.request

from PIL import Image

SIZE = 144
OUT_DIR = "assets/vendors"

# slug -> profile image URL, read from each page on 2026-09-28
VENDORS = {
    "adams-trading-post": "https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-1/724086998_122389373948062197_8231350440077258197_n.jpg?stp=dst-jpg_tt6&cstp=mx1254x1254&ctp=s200x200&_nc_cat=106&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=PpfT8YIfXdUQ7kNvwHmHvbQ&_nc_oc=AdqZRIOKimT8COZTz_dB3l5t95Or4Kd5FQLcBQAkLolRBhjbzVLcQA0WNmUDLoplUAM&_nc_zt=24&_nc_ht=scontent-atl3-1.xx&_nc_gid=_KTzxygYA1IQmWZ7ioqmpg&_nc_ss=79289&oh=00_AQO1RQdJGnQItdWEKzvhGzyj_Acyq4SAN7xq8w6Ab0JdwA&oe=6AC0058C",
    "bayou-rouge": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-1/560272081_122126339588968163_3557071464492612399_n.jpg?stp=dst-jpg_tt6&cstp=mx960x960&ctp=s200x200&_nc_cat=102&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=CumTuRjxatIQ7kNvwGuJIan&_nc_oc=Ado36HWo95SouLLETzxq75fZ7MeLRaPChhyvY9yeQLrogyfKciKFj6A8cLDPPxCo98c&_nc_zt=24&_nc_ht=scontent-atl3-2.xx&_nc_gid=m_8VN8m8Xi-Pma-mwORw1g&_nc_ss=79289&oh=00_AQM5DLEs5ffEHD8NI3VIZRxLL0OtGSXab0ta4TqcZm7iZA&oe=6ABFE4B8",
    "the-ravens-nest": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-1/810118545_989021187538424_3066034566975416422_n.jpg?stp=dst-jpg_tt6&cstp=mx1254x1254&ctp=s200x200&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=6DCPX33khngQ7kNvwHo1X_2&_nc_oc=Adp3brc_OK-Mvf9ve7gMMF8No7CsDeYlZvqutLgw_ZOAXFYDQ3cLOtn6U4ETF6raVYM&_nc_zt=24&_nc_ht=scontent-atl3-2.xx&_nc_gid=yZknIc2xj2pRNupHKnqyyg&_nc_ss=79289&oh=00_AQO-6pBkBLF6RkunKPm3JnRmPgsD-p5ZBz_mpKHnfLtYuA&oe=6ABFFB91",
    "tooties-thrift": "https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-1/726527180_10230171009569079_7057195842896946414_n.jpg?stp=dst-jpg_tt6&cstp=mx2000x2000&ctp=s200x200&_nc_cat=109&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=Od86r5hOu7cQ7kNvwGhZCpb&_nc_oc=Adq3aDmRauyNy2P1-kYdYvTJcP8ks6OZVXPZvD7dtSVBrPubkS0DKyOyFDIlMsb9FO0&_nc_zt=24&_nc_ht=scontent-atl3-1.xx&_nc_gid=0waqinRUInOj-KOwGKk5Zg&_nc_ss=79289&oh=00_AQNUJk0VCJ1PC_rXS5xvqZu2aOj2-EmAPQP3Ys5QiWInhw&oe=6AC0036D",
}


def square(im):
    """Centre crop to a square, so nothing is squashed."""
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return im.crop((left, top, left + side, top + side))


def main():
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    for slug, url in VENDORS.items():
        out = os.path.join(OUT_DIR, slug + ".jpg")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
        except Exception as e:
            print("FAILED %-22s %s" % (slug, e))
            continue

        im = Image.open(io.BytesIO(data)).convert("RGB")
        src_size = im.size
        square(im).resize((SIZE, SIZE), Image.LANCZOS).save(
            out, "JPEG", quality=84, optimize=True)
        print("wrote %-34s from %dx%d" % (out, src_size[0], src_size[1]))


if __name__ == "__main__":
    main()
