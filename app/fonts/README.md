# Deshi Sans Bengali

The website uses `deshi-sans-bengali-var.woff2`. The TTF contains the same font,
uncompressed for Pango in the offline social-image renderer; it is not imported by
the website. Pango/fontconfig cannot reliably load WOFF2 and can silently fall back
to a system font. Both files use the adjacent OFL licence.

If the web font changes, regenerate its TTF with FontTools and Brotli support:

```python
from fontTools.ttLib import TTFont

font = TTFont("app/fonts/deshi-sans-bengali-var.woff2")
font.flavor = None
font.save("app/fonts/deshi-sans-bengali-var.ttf")
```
