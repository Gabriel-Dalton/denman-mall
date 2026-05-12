// Run inside Playwright page context. Visits every local HTML page, collects all <a href>,
// classifies internal/external, and HEAD-checks each unique URL.
(async () => {
  const base = 'http://localhost:8765/';
  const pages = PAGES; // injected
  const linkOrigins = new Map(); // url -> Set(pages)
  const fetchPage = async (p) => {
    const r = await fetch(base + p);
    const html = await r.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('a[href]').forEach(a => {
      let href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      // Resolve relative
      let abs;
      try { abs = new URL(href, base + p).href; } catch { return; }
      if (!linkOrigins.has(abs)) linkOrigins.set(abs, new Set());
      linkOrigins.get(abs).add(p);
    });
  };
  for (const p of pages) await fetchPage(p);

  const results = [];
  const entries = [...linkOrigins.entries()];
  // Check each URL. For external, HEAD with no-cors fallback; for internal HTTP server, GET.
  for (const [url, origins] of entries) {
    let status = null, ok = false, err = null;
    const isLocal = url.startsWith(base);
    try {
      const opts = isLocal ? { method: 'GET' } : { method: 'HEAD', redirect: 'follow', mode: 'cors' };
      const resp = await fetch(url, opts);
      status = resp.status;
      ok = resp.ok;
    } catch (e) {
      // CORS failures common for cross-origin HEAD; retry no-cors to confirm reachability
      try {
        const r = await fetch(url, { method: 'GET', mode: 'no-cors' });
        // opaque response — treat as reachable
        status = 'opaque';
        ok = true;
      } catch (e2) {
        err = String(e2);
      }
    }
    results.push({ url, status, ok, err, origins: [...origins] });
  }
  return results.filter(r => !r.ok);
})();
