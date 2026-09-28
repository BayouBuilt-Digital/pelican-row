"""
Builds the printable return-policy sign for the register.

    python print/make-return-policy-sign.py

Output: print/return-policy-sign.pdf
  Page 1 - full letter sheet, for the wall or a stand behind the counter.
  Page 2 - two half-sheet cards on one page, cut in half, for the counter
           itself or the far end of the register.

WHY THIS EXISTS: Louisiana requires a retailer's return policy to be disclosed
conspicuously at the POINT OF PURCHASE. The website page does not satisfy that
for someone standing at the register. This sheet is the version that governs.

KEEP IN STEP: the wording below must match return-policy.html. If the policy
changes, change both, and update EFFECTIVE.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

OUT = "print/return-policy-sign.pdf"

# Palette lifted from the site (styles.css)
INK = HexColor("#33271f")
INK_SOFT = HexColor("#6d5c4e")
BRICK = HexColor("#9a4e30")
LINE = HexColor("#d8d0c4")

EFFECTIVE = "Effective September 2026"
ADDRESS = "6413 Johnston St, Ste 400  ·  Lafayette, LA 70503  ·  337.915.9602"

HEADLINE = "ALL SALES ARE FINAL"
STATEMENT = "Items are sold as-is. We do not accept returns."

POINTS = [
    "Almost everything here is secondhand or an estate piece, sold in the "
    "condition it is in today, including the wear and marks that come with age.",
    "This applies to items sold by our vendors as well as our own.",
    "Please take your time before you buy. Look a piece over, and ask us "
    "anything you would like to know. We are glad to help.",
]


def tracked(c, text, font, size, cx, y, color, space=0):
    """Centred text with optional letter-spacing.

    Letter-spacing lives on the text object, not the canvas, in this
    version of reportlab, so the width has to be measured by hand to
    centre it.
    """
    width = c.stringWidth(text, font, size) + space * max(len(text) - 1, 0)
    t = c.beginText(cx - width / 2, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(space)
    t.textOut(text)
    c.drawText(t)


def fit(c, text, font, start_size, max_w, track=0.024):
    """Largest size at which `text` (with tracking) fits max_w."""
    size = start_size
    while size > 8:
        w = c.stringWidth(text, font, size) + size * track * max(len(text) - 1, 0)
        if w <= max_w:
            break
        size -= 0.5
    return size


def wrap(c, text, font, size, max_w):
    c.setFont(font, size)
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def wordmark(c, cx, y, scale=1.0):
    """The site's wordmark: name, rule, subtitle."""
    tracked(c, "PELICAN ROW", "Times-Roman", 19 * scale, cx, y, INK, space=3.4 * scale)
    w = c.stringWidth("PELICAN ROW", "Times-Roman", 19 * scale) + 3.4 * scale * 10
    c.setStrokeColor(BRICK)
    c.setLineWidth(0.7)
    c.line(cx - w / 2, y - 6 * scale, cx + w / 2, y - 6 * scale)
    tracked(c, "ESTATE & MARKET", "Helvetica", 7 * scale, cx, y - 16 * scale,
            INK_SOFT, space=2.6 * scale)


def sign(c, x, y, w, h, scale=1.0):
    """Draw one sign inside the given box.

    The block is measured before it is drawn so it sits optically centred
    between the frame and the footer, whatever length the wording is. Edit
    the text at the top of this file and the layout still balances.
    """
    cx = x + w / 2
    # Body text gets a narrower measure than the headline: long lines are
    # hard to read, and on the half-size cards a full-width measure ran
    # almost edge to edge.
    body_w = w * 0.70
    head_w = w - 1.15 * inch * scale

    # Type sizes
    s_eyebrow, s_stmt, s_point = 10 * scale, 23 * scale, 14 * scale
    # The headline is the one thing that must never wrap or overrun the
    # frame, so it sizes itself to the width available.
    s_head = fit(c, HEADLINE, "Times-Bold", 50 * scale, head_w)
    lead_stmt, lead_point = 31 * scale, 20 * scale

    # Gaps
    g_mark, g_eyebrow, g_head, g_rule, g_para = (
        48 * scale, 42 * scale, 32 * scale, 34 * scale, 15 * scale)

    stmt_lines = wrap(c, STATEMENT, "Times-Roman", s_stmt, body_w)
    point_lines = [wrap(c, p, "Helvetica", s_point, body_w) for p in POINTS]

    # Measure the whole block
    total = (30 * scale + g_mark + s_eyebrow + g_eyebrow + s_head * 0.72
             + g_head + len(stmt_lines) * lead_stmt + g_rule + 1 + g_rule)
    for lines in point_lines:
        total += len(lines) * lead_point + g_para
    total -= g_para

    # Frame
    c.setStrokeColor(BRICK)
    c.setLineWidth(2.2 * scale)
    c.rect(x + 0.45 * inch * scale, y + 0.45 * inch * scale,
           w - 0.9 * inch * scale, h - 0.9 * inch * scale, stroke=1, fill=0)

    # Centre the block between the top of the frame and the footer
    top_limit = y + h - 0.95 * inch * scale
    foot_top = y + 1.25 * inch * scale
    yy = foot_top + (top_limit - foot_top + total) / 2

    wordmark(c, cx, yy, scale)
    yy -= 30 * scale + g_mark

    tracked(c, "RETURN POLICY", "Helvetica-Bold", s_eyebrow, cx, yy, BRICK,
            space=3.4 * scale)
    yy -= s_eyebrow + g_eyebrow

    tracked(c, HEADLINE, "Times-Bold", s_head, cx, yy, INK, space=s_head * 0.024)
    yy -= s_head * 0.72 + g_head

    for ln in stmt_lines:
        tracked(c, ln, "Times-Roman", s_stmt, cx, yy, INK)
        yy -= lead_stmt

    yy -= g_rule
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.line(cx - body_w / 4, yy, cx + body_w / 4, yy)
    yy -= g_rule

    for lines in point_lines:
        for ln in lines:
            c.setFont("Helvetica", s_point)
            c.setFillColor(INK_SOFT)
            c.drawCentredString(cx, yy, ln)
            yy -= lead_point
        yy -= g_para

    # Footer
    foot = y + 0.82 * inch * scale
    tracked(c, EFFECTIVE, "Helvetica-Bold", 9 * scale, cx, foot + 15 * scale,
            INK_SOFT, space=1.6 * scale)
    tracked(c, ADDRESS, "Helvetica", 9 * scale, cx, foot, INK_SOFT)


def main():
    W, H = letter
    c = canvas.Canvas(OUT, pagesize=letter)
    c.setTitle("Pelican Row Estate & Market - Return Policy")
    c.setAuthor("Pelican Row Estate & Market")
    c.setSubject("Return policy for display at the point of purchase")

    # Page 1: full sheet
    sign(c, 0, 0, W, H, scale=1.0)
    c.showPage()

    # Page 2: two half-sheet cards, cut along the dashed line
    half = H / 2
    sign(c, 0, half, W, half, scale=0.62)
    sign(c, 0, 0, W, half, scale=0.62)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.setDash(3, 3)
    c.line(0.3 * inch, half, W - 0.3 * inch, half)
    c.setDash()
    c.setFont("Helvetica", 6.5)
    c.setFillColor(LINE)
    c.drawCentredString(W / 2, half - 8, "cut here")
    c.showPage()

    c.save()
    print("wrote " + OUT)


if __name__ == "__main__":
    main()
