# Denman Place Mall - Assets

Downloaded from the live denmanmall.com site on 2026-05-11T21:57:08.358Z.

## Folder structure (mirrors the live site)
- `assets/image-63.png` - Root asset
- `assets/css/tailwind/` - CSS files (home.css, min.css, tailwind.min.css)
- `assets/images/` - All image files (.webp, .avif)
- `assets/images/slider-bg/` - 5 hero slider background images

## Merging with HTML pages
Extract this zip alongside the HTML zip (`denmanmall-dashnex-export.zip`).
The HTML files reference assets via paths like `/assets/images/Foo.webp` which
will resolve correctly when both are deployed together.
