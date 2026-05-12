#!/usr/bin/env node
/**
 * Partial sync. Edit _partials/nav.html or _partials/footer.html, then run:
 *   node _build.js
 *
 * Each HTML page is wrapped (on first run) with marker comments. Subsequent
 * runs replace the content between the markers with the current partial.
 */
const fs = require('fs');
const path = require('path');

const NAV = fs.readFileSync(path.join(__dirname, '_partials/nav.html'), 'utf8').replace(/\s+$/, '');
const FOOTER = fs.readFileSync(path.join(__dirname, '_partials/footer.html'), 'utf8').replace(/\s+$/, '');

const NAV_PATTERN = '<section x-data="{ mobileNavOpen: false }"';
const FOOTER_PATTERN = '<section class="py-12 md:py-20 bg-black">';

/** Find a <section> region by its opening tag pattern, balanced by <section>/</section>. */
function findSection(html, startPattern) {
  const startIdx = html.indexOf(startPattern);
  if (startIdx === -1) return null;
  let i = startIdx;
  let depth = 0;
  while (i < html.length) {
    const open = html.indexOf('<section', i);
    const close = html.indexOf('</section>', i);
    if (close === -1) return null;
    if (open !== -1 && open < close) {
      depth++;
      i = open + '<section'.length;
    } else {
      depth--;
      i = close + '</section>'.length;
      if (depth === 0) return { start: startIdx, end: i };
    }
  }
  return null;
}

function wrap(name, content) {
  return `<!--PARTIAL:${name}-->\n${content}\n<!--/PARTIAL:${name}-->`;
}

function syncPartial(html, name, partialContent, startPattern) {
  const markerRe = new RegExp(`<!--PARTIAL:${name}-->[\\s\\S]*?<!--/PARTIAL:${name}-->`);
  if (markerRe.test(html)) {
    return { html: html.replace(markerRe, wrap(name, partialContent)), changed: true };
  }
  const loc = findSection(html, startPattern);
  if (!loc) return { html, changed: false };
  return {
    html: html.slice(0, loc.start) + wrap(name, partialContent) + html.slice(loc.end),
    changed: true,
  };
}

function processFile(file) {
  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  let touched = false;
  const a = syncPartial(html, 'nav', NAV, NAV_PATTERN); html = a.html; touched = touched || a.changed;
  const b = syncPartial(html, 'footer', FOOTER, FOOTER_PATTERN); html = b.html; touched = touched || b.changed;
  if (html !== before) {
    fs.writeFileSync(file, html);
    return 'updated';
  }
  return touched ? 'unchanged' : 'skipped';
}

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let updated = 0, skipped = 0;
for (const f of files) {
  const result = processFile(path.join(__dirname, f));
  if (result === 'updated') updated++;
  else if (result === 'skipped') skipped++;
  console.log(`  ${result.padEnd(10)} ${f}`);
}
console.log(`\nDone. ${updated} updated, ${skipped} skipped (no matching pattern).`);
