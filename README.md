# Denman Place Mall - HTML & Config Backup

Extracted from DashNex PowerTech on 2026-05-11T21:58:21.198Z

## Contents
- `pages/` — 41 HTML files (one per custom page)
- `vercel.json` — Vercel-format redirects
- `_redirects.txt` — Plain text redirect list
- `manifest.json` — Full metadata
- `robots.txt` — Robots file
- `global-scripts.html` — Global header/footer scripts

## IMPORTANT: Combine with assets zip
This zip contains HTML pages and metadata. To get the complete site, extract the
companion zip `denmanmall-assets.zip` into the SAME folder. After extraction
you should have:
  ```
  ./pages/*.html
  ./assets/image-63.png
  ./assets/css/tailwind/*.css
  ./assets/images/*.webp .avif
  ./assets/images/slider-bg/*.webp
  ./vercel.json
  ./_redirects.txt
  ...
  ```

## Redirects (8)
- /maps → https://maps.app.goo.gl/u1XnMwUVHSuPKNBJ6 (301)
- /instagram → https://www.instagram.com/thedenmanmall/ (301)
- /facebook → https://www.facebook.com/thedenmanplacemall/ (301)
- /x → https://x.com/thedenmanmall (301)
- /terms-of-use → https://denmanmall.com/terms/ (301)
- /twitter → https://x.com/thedenmanmall (301)
- /nofrills → https://denmanmall.com/no-frills (301)
- /safety → https://denmanmall.com/safety-updates/ (301)

## Vercel migration
1. Place `pages/index.html` at your project root (or configure routing).
2. Place `assets/` at your project root.
3. Use `vercel.json` for redirects.
