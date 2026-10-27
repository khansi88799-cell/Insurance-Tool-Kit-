/* Build-time renderer: turns every route into a static HTML page, plus the sitemap, robots.txt and 404 page. Run by scripts/prerender.mjs. */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { RouterProvider } from "./router";
import { OG_IMAGE, SITE_NAME, SITE_URL, allPaths, parseRoute, routeMeta } from "./routes";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "/" → index.html, "/learn/motor" → learn/motor.html (served at /learn/motor without the extension) */
const fileFor = (path: string) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);

function renderPage(template: string, path: string): string {
  const route = parseRoute(path);
  const meta = routeMeta(route, path);
  const found = route.tab !== "notfound";
  const url = SITE_URL + meta.canonical;
  const body = renderToString(
    <StrictMode>
      <RouterProvider initial={{ pathname: path, search: "", hash: "" }}>
        <App />
      </RouterProvider>
    </StrictMode>,
  );
  const head = [
    found ? `<link rel="canonical" href="${esc(url)}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${SITE_URL}${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${SITE_NAME}: Indian insurance guide, from beginner to pro" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (path === "/")
    head.push(
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: meta.description,
        inLanguage: "en-GB",
      })}</script>`,
    );
  // Replacer functions, so "$" in the content is never read as a replacement pattern
  return template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, () => `<meta name="description" content="${esc(meta.description)}" />`)
    .replace("</head>", () => `  ${head.join("\n    ")}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
}

/** Every file to write into dist/, given the built index.html and today's date (YYYY-MM-DD) */
export function buildFiles(template: string, today: string): { file: string; content: string }[] {
  const pages = allPaths();
  const indexed = pages.filter((p) => routeMeta(parseRoute(p), p).canonical === p);
  const sitemap = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...indexed.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`),
    `</urlset>`,
    ``,
  ].join("\n");
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  return [
    ...pages.map((p) => ({ file: fileFor(p), content: renderPage(template, p) })),
    { file: "404.html", content: renderPage(template, "/404") },
    { file: "sitemap.xml", content: sitemap },
    { file: "robots.txt", content: robots },
  ];
}
