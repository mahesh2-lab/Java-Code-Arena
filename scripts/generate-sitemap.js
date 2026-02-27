const fs = require("fs");
const path = require("path");

const blogDir = path.join(__dirname, "../frontend/public/blog");
const sitemapPath = path.join(__dirname, "../frontend/public/sitemap.xml");
const siteUrl = "https://javarena.hostmyidea.me";

const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));

const urls = [
  `<url>\n  <loc>${siteUrl}/</loc>\n  <changefreq>daily</changefreq>\n  <priority>1.0</priority>\n</url>`,
];

for (const file of blogFiles) {
  const slug = file.replace(/\.md$/, "");
  urls.push(
    `<url>\n  <loc>${siteUrl}/blog/${slug}</loc>\n  <changefreq>weekly</changefreq>\n  <priority>0.8</priority>\n</url>`,
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

fs.writeFileSync(sitemapPath, xml);
console.log("Sitemap updated with blog slugs.");
