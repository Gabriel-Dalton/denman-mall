# Partials

Shared markup (nav + footer) that used to be duplicated across all 41 content pages now lives in this directory. Each HTML page contains marker comments around the nav and footer regions, and `_build.js` syncs them from these source files.

## Workflow

1. Edit `_partials/nav.html` or `_partials/footer.html`.
2. From the repo root, run:
   ```
   node _build.js
   ```
3. All HTML pages with the matching markers will be updated.

The build is **idempotent** — re-running it with no changes produces no file writes.

## Markers

The build inserts and looks for HTML comments like:

```html
<!--PARTIAL:nav-->
  ...nav content...
<!--/PARTIAL:nav-->

<!--PARTIAL:footer-->
  ...footer content...
<!--/PARTIAL:footer-->
```

On the first run, the build finds the existing nav/footer `<section>` blocks by their distinguishing attributes (`x-data="{ mobileNavOpen: false }"` for the nav, `class="py-12 md:py-20 bg-black"` for the footer) and wraps them with markers. Subsequent runs only need the markers — pattern-matching is the fallback for fresh pages.

## Adding a new HTML page

Just include the standard nav and footer `<section>` blocks (copy from any existing page) and run `node _build.js`. The build will detect them by pattern and add the markers.

## Pages that don't participate

- `update-in-progress.html` — placeholder page with a different layout
- `global-scripts.html` — fragment template, not a real page

These are skipped automatically.
