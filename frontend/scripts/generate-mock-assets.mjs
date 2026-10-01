import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(ROOT, "..", "public", "mock-assets");
const MANIFEST_PATH = path.join(ROOT, "..", "src", "mocks", "mock-manifest.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const DESKTOP_WIDTH = 1440;
const MOBILE_WIDTH = 390;
const HEIGHTS = {
  navbar: 120,
  hero: 640,
  value_proposition: 520,
  features: 920,
  logo_cloud: 360,
  stats: 420,
  testimonials: 620,
  pricing: 960,
  cta: 420,
  faq: 680,
  contact: 560,
  team: 720,
  gallery: 820,
  blog: 760,
  login: 580,
  signup: 580,
  dashboard: 880,
  checkout: 720,
  profile: 560,
  settings: 640,
  footer: 300,
};

fs.mkdirSync(ASSETS_DIR, { recursive: true });
for (const file of fs.readdirSync(ASSETS_DIR)) {
  if (file.endsWith(".svg")) fs.unlinkSync(path.join(ASSETS_DIR, file));
}

const heightFor = (type, device) => Math.round((HEIGHTS[type] ?? 560) * (device === "mobile" ? 1.35 : 1));
const widthFor = (device) => (device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH);
const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[character]));

function palette(type, index) {
  const palettes = [
    ["#f8fafc", "#0f172a", "#38bdf8", "#cbd5e1"],
    ["#fff7ed", "#431407", "#f97316", "#fed7aa"],
    ["#f0fdf4", "#052e16", "#22c55e", "#bbf7d0"],
    ["#fdf4ff", "#3b0764", "#d946ef", "#f5d0fe"],
  ];
  const selected = palettes[index % palettes.length];
  if (type === "footer") return ["#111827", "#f9fafb", "#f59e0b", "#374151"];
  return selected;
}

function wireframe(type, width, height, index) {
  const [background, ink, accent, muted] = palette(type, index);
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const line = (x, y, lineWidth, lineHeight = 16, color = muted, opacity = 1) => `<rect x="${x}" y="${y}" width="${lineWidth}" height="${lineHeight}" rx="${Math.min(8, lineHeight / 2)}" fill="${color}" opacity="${opacity}"/>`;
  let shapes = "";
  if (type === "navbar") {
    shapes = `${line(pad, height * 0.32, width * 0.18, 24, ink)}${line(width - pad - width * 0.42, height * 0.37, width * 0.1, 14)}${line(width - pad - width * 0.27, height * 0.37, width * 0.1, 14)}${line(width - pad - width * 0.12, height * 0.3, width * 0.12, 28, accent)}`;
  } else if (type === "hero") {
    shapes = `${line(pad, height * 0.24, contentWidth * 0.46, 48, ink)}${line(pad, height * 0.37, contentWidth * 0.34, 22)}${line(pad, height * 0.51, contentWidth * 0.18, 48, accent)}<rect x="${width * 0.59}" y="${height * 0.14}" width="${width * 0.3}" height="${height * 0.7}" rx="24" fill="${accent}" opacity="0.2"/><circle cx="${width * 0.74}" cy="${height * 0.48}" r="${Math.min(width, height) * 0.13}" fill="${accent}" opacity="0.55"/>`;
  } else if (type === "pricing") {
    const cardWidth = contentWidth / 3 - 20;
    shapes = [0, 1, 2].map((card) => {
      const x = pad + card * (cardWidth + 30);
      return `<rect x="${x}" y="${height * 0.16 + (card === 1 ? -20 : 0)}" width="${cardWidth}" height="${height * 0.68 + (card === 1 ? 40 : 0)}" rx="18" fill="${card === 1 ? accent : background}" stroke="${card === 1 ? accent : muted}" stroke-width="3"/>${line(x + 24, height * 0.25, cardWidth - 48, 24, ink)}${line(x + 24, height * 0.35, cardWidth * 0.55, 18)}${line(x + 24, height * 0.55, cardWidth - 48, 48, card === 1 ? ink : accent)}`;
    }).join("");
  } else if (type === "footer") {
    shapes = [0, 1, 2, 3].map((column) => {
      const x = pad + column * (contentWidth / 4);
      return `${line(x, height * 0.22, contentWidth * 0.13, 18, ink)}${line(x, height * 0.4, contentWidth * 0.1, 12, muted)}${line(x, height * 0.52, contentWidth * 0.12, 12, muted)}${line(x, height * 0.64, contentWidth * 0.08, 12, muted)}`;
    }).join("");
  } else {
    const columns = width < 600 ? 1 : 3;
    const cardWidth = (contentWidth - (columns - 1) * 24) / columns;
    shapes = Array.from({ length: columns * 2 }, (_, card) => {
      const column = card % columns;
      const row = Math.floor(card / columns);
      const x = pad + column * (cardWidth + 24);
      const y = height * 0.18 + row * Math.min(220, height * 0.28);
      return `<rect x="${x}" y="${y}" width="${cardWidth}" height="${Math.min(170, height * 0.22)}" rx="16" fill="${card % 2 ? background : muted}" opacity="${card % 2 ? 1 : 0.38}" stroke="${muted}"/>${line(x + 20, y + 24, cardWidth * 0.55, 20, ink)}${line(x + 20, y + 62, cardWidth * 0.75, 14)}${line(x + 20, y + 100, cardWidth * 0.35, 34, accent)}`;
    }).join("");
  }
  return { background, ink, shapes };
}

function writeSvg(id, width, height, type, label, index, extra = "") {
  const { background, ink, shapes } = wireframe(type, width, height, index);
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="${background}"/>${shapes}<text x="${width / 2}" y="${Math.min(height - 28, 42)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(14, Math.round(width / 65))}" fill="${ink}" opacity="0.72">${escapeXml(label)}</text>${extra}<rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${ink}" stroke-opacity="0.12"/></svg>`;
  fs.writeFileSync(path.join(ASSETS_DIR, `${id}.svg`), svg);
}

let generated = 0;
manifest.pages.forEach((page, pageIndex) => {
  page.devices.forEach((device) => {
    const width = widthFor(device);
    const sectionHeights = page.sections.map((section) => heightFor(section.type, device));
    const pageHeight = sectionHeights.reduce((total, height) => total + height, 0);
    let y = 0;
    const pageShapes = page.sections.map((section, sectionIndex) => {
      const height = sectionHeights[sectionIndex];
      const { shapes } = wireframe(section.type, width, height, pageIndex + sectionIndex);
      const label = escapeXml(section.title);
      const group = `<g transform="translate(0 ${y})">${shapes}<text x="${width / 2}" y="${Math.min(height - 28, 42)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(14, Math.round(width / 65))}" fill="#0f172a" opacity="0.72">${label}</text></g>`;
      y += height;
      return group;
    }).join("");
    const pageId = `page-${page.id}-${device}`;
    const pageSvg = `<svg width="${width}" height="${pageHeight}" viewBox="0 0 ${width} ${pageHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${pageHeight}" fill="#f8fafc"/>${pageShapes}<rect x="1" y="1" width="${width - 2}" height="${pageHeight - 2}" fill="none" stroke="#0f172a" stroke-opacity="0.12"/></svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, `${pageId}.svg`), pageSvg);
    generated += 1;

    page.sections.forEach((section, sectionIndex) => {
      const sectionId = `section-${page.id}-${sectionIndex + 1}`;
      const cropId = `crop-${sectionId}-${device}`;
      writeSvg(cropId, width, sectionHeights[sectionIndex], section.type, section.title, pageIndex + sectionIndex);
      generated += 1;
    });
  });
});

console.log(`Generated ${generated} deterministic SVG assets in ${ASSETS_DIR}`);
