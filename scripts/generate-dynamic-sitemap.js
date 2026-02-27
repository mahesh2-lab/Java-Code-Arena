// Dynamic sitemap generator for frontend public directory
// Requirements: See user prompt above

const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  baseDomain:
    process.env.SITEMAP_BASE_DOMAIN || "https://javarena.hostmyidea.me",
  publicDir: path.resolve(__dirname, "../frontend/public"),
  outputFile: path.resolve(__dirname, "../frontend/public/sitemap.xml"),
  pageExtensions: [".html"], // Add more if needed
  ignorePatterns: [
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "manifest.json",
    "site.webmanifest",
    ".DS_Store",
    "thumbs.db",
    "logo.png",
    "*.js",
    "*.css",
    "*.json",
    "*.jpg",
    "*.jpeg",
    "*.png",
    "*.gif",
    "*.svg",
    "*.webp",
    "*.mp3",
    "*.mp4",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
    "*.otf",
    "*.ico",
    "*.pdf",
    "*.zip",
    "*.tar",
    "*.gz",
    "*.rar",
    "*.7z",
  ],
};

// Utility: Check if file matches ignore patterns
function isIgnored(file) {
  return CONFIG.ignorePatterns.some((pattern) => {
    if (pattern.startsWith("*")) {
      return file.endsWith(pattern.slice(1));
    }
    return file === pattern;
  });
}

// Utility: Recursively scan directory for page files
function scanPages(dir) {
  let pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages = pages.concat(scanPages(fullPath));
    } else if (
      CONFIG.pageExtensions.includes(path.extname(entry.name)) &&
      !isIgnored(entry.name)
    ) {
      pages.push(fullPath);
    }
  }
  return pages;
}

// Utility: Convert file path to URL path
function filePathToUrl(filePath) {
  // Remove publicDir prefix
  let rel = path.relative(CONFIG.publicDir, filePath);
  rel = rel.replace(/\\/g, "/"); // Windows to URL
  // Remove .html extension
  rel = rel.replace(/\.html$/, "");
  // index.html → parent folder or root
  if (rel.endsWith("/index")) rel = rel.slice(0, -6);
  if (rel === "index") rel = "";
  return `/${rel}`;
}

// Utility: Get last modification date in ISO format
function getLastMod(filePath) {
  const stats = fs.statSync(filePath);
  return stats.mtime.toISOString().split("T")[0];
}

// Main: Generate sitemap
function generateSitemap() {
  const pages = scanPages(CONFIG.publicDir);
  const urls = pages.map((file) => {
    const urlPath = filePathToUrl(file);
    const loc = `${CONFIG.baseDomain}${urlPath}`;
    const lastmod = getLastMod(file);
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(CONFIG.outputFile, xml);
  console.log(`Sitemap generated with ${urls.length} routes.`);
}

// Run generator
if (require.main === module) {
  generateSitemap();
}

// Export for testing or integration
module.exports = {
  generateSitemap,
  scanPages,
  filePathToUrl,
  getLastMod,
  CONFIG,
};

/*
Mapping explanation:
- Files in public/index.html → /
- Files in public/about/index.html → /about
- Files in public/blog/post-1.html → /blog/post-1
- Nested folders are handled recursively.
- Only .html files are considered pages (configurable).
- Non-page assets and ignored files are excluded.
- <loc> is the absolute URL, <lastmod> is the file's last modification date.
*/
