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
const escapeXml = (value) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[character]));

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

// --- Premium "fintech" theme for the fictional Nimbus Pay source (source-nimbus-pay). ---
// Deterministic SVG string building only: no randomness, no dates, no network.
// All geometry derives from (width, height, index) so page composites and section
// crops rendered through renderSection() always agree.
const NIMBUS_SOURCE_ID = "source-nimbus-pay";
const FIN = {
  navy: "#0a1128",
  panel: "#141b3d",
  card: "#0f1740",
  inkLight: "#f1f5f9",
  mutedDark: "#8fa0c7",
  trackDark: "#2b3560",
  pageLight: "#eef2ff",
  inkDark: "#0a1128",
  mutedLight: "#c7d2fe",
  slate: "#94a3b8",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  cyan: "#22d3ee",
};

const bar = (x, y, w, h, fill, opacity = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(8, h / 2)}" fill="${fill}" opacity="${opacity}"/>`;
const premiumDefs = (uid) => `<defs><radialGradient id="g-${uid}" cx="0.3" cy="0.25" r="0.95"><stop offset="0" stop-color="${FIN.indigo}"/><stop offset="1" stop-color="${FIN.violet}"/></radialGradient><filter id="b-${uid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="60"/></filter></defs>`;

function premiumNavbar(width, height) {
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const mobile = width < 600;
  const pillY = height * 0.22;
  const pillH = height * 0.56;
  const ctaW = mobile ? 110 : 150;
  const ctaX = pad + contentWidth - ctaW - 24;
  let shapes = `<rect x="${pad}" y="${pillY}" width="${contentWidth}" height="${pillH}" rx="${pillH / 2}" fill="${FIN.panel}" stroke="${FIN.trackDark}" stroke-width="2"/>`;
  shapes += `<circle cx="${pad + 36}" cy="${height / 2}" r="12" fill="${FIN.indigo}"/>${bar(pad + 56, height / 2 - 9, mobile ? 64 : 92, 18, FIN.inkLight)}`;
  if (!mobile) {
    const linkW = 70;
    const gap = 32;
    const startX = pad + contentWidth * 0.36;
    for (let link = 0; link < 3; link += 1) {
      shapes += bar(startX + link * (linkW + gap), height / 2 - 7, linkW, 14, FIN.mutedDark, 0.8);
    }
  } else {
    shapes += bar(pad + 140, height / 2 - 7, 64, 14, FIN.mutedDark, 0.8);
  }
  shapes += `<rect x="${ctaX}" y="${height / 2 - 19}" width="${ctaW}" height="38" rx="19" fill="${FIN.indigo}"/>${bar(ctaX + ctaW * 0.25, height / 2 - 6, ctaW * 0.5, 12, "#ffffff", 0.92)}`;
  return shapes;
}

function premiumHero(width, height, uid) {
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const mobile = width < 600;
  let shapes = `<rect width="${width}" height="${Math.round(height * 0.72)}" fill="url(#g-${uid})" opacity="0.28"/>`;
  shapes += `<ellipse cx="${width * 0.12}" cy="${height * 0.18}" rx="${width * 0.26}" ry="${height * 0.3}" fill="${FIN.indigo}" opacity="0.5" filter="url(#b-${uid})"/>`;
  shapes += `<ellipse cx="${width * 0.88}" cy="${height * 0.85}" rx="${width * 0.3}" ry="${height * 0.35}" fill="${FIN.violet}" opacity="0.35" filter="url(#b-${uid})"/>`;
  shapes += `<ellipse cx="${width * 0.55}" cy="${height * 1.02}" rx="${width * 0.35}" ry="${height * 0.22}" fill="${FIN.cyan}" opacity="0.18" filter="url(#b-${uid})"/>`;
  if (!mobile) {
    const textW = contentWidth * 0.46;
    shapes += `<rect x="${pad}" y="${height * 0.15}" width="150" height="30" rx="15" fill="${FIN.trackDark}"/>${bar(pad + 20, height * 0.15 + 9, 110, 12, FIN.mutedDark)}`;
    shapes += bar(pad, height * 0.27, textW, 44, FIN.inkLight);
    shapes += bar(pad, height * 0.27 + 58, textW * 0.72, 44, FIN.inkLight, 0.92);
    shapes += bar(pad, height * 0.52, contentWidth * 0.4, 16, FIN.mutedDark);
    shapes += bar(pad, height * 0.52 + 26, contentWidth * 0.31, 16, FIN.mutedDark, 0.75);
    const ctaY = height * 0.66;
    shapes += `<rect x="${pad}" y="${ctaY}" width="170" height="52" rx="26" fill="url(#g-${uid})"/>${bar(pad + 45, ctaY + 19, 80, 14, "#ffffff", 0.95)}`;
    shapes += `<rect x="${pad + 190}" y="${ctaY}" width="150" height="52" rx="26" fill="none" stroke="${FIN.inkLight}" stroke-opacity="0.45" stroke-width="2"/>${bar(pad + 190 + 38, ctaY + 19, 74, 14, FIN.mutedDark)}`;
    // Dashboard mock panel on the right.
    const px = width * 0.59;
    const pw = width * 0.3;
    const py = height * 0.14;
    const ph = height * 0.7;
    shapes += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="20" fill="#f8fafc"/>`;
    shapes += `<circle cx="${px + 28}" cy="${py + 30}" r="7" fill="${FIN.indigo}"/><circle cx="${px + 48}" cy="${py + 30}" r="7" fill="${FIN.violet}" opacity="0.7"/><circle cx="${px + 68}" cy="${py + 30}" r="7" fill="${FIN.cyan}" opacity="0.6"/>`;
    shapes += bar(px + pw - 120, py + 21, 92, 18, FIN.inkDark, 0.85);
    shapes += bar(px + 24, py + 62, pw - 48, 10, FIN.mutedLight);
    shapes += bar(px + 24, py + 84, pw * 0.45, 26, FIN.inkDark);
    const fractions = [0.42, 0.65, 0.5, 0.8, 0.58, 0.9, 0.7];
    const chartBase = py + ph - 56;
    const chartTop = py + 150;
    const slotW = (pw - 48) / fractions.length;
    const barW = Math.max(14, slotW - 14);
    fractions.forEach((fraction, barIndex) => {
      const barH = (chartBase - chartTop) * fraction;
      const fill = barIndex === fractions.length - 1 ? FIN.cyan : barIndex % 2 ? FIN.violet : FIN.indigo;
      shapes += `<rect x="${px + 24 + barIndex * slotW}" y="${chartBase - barH}" width="${barW}" height="${barH}" rx="6" fill="${fill}" opacity="0.9"/>`;
    });
    const linePoints = fractions.map((fraction, barIndex) => `${px + 24 + barIndex * slotW + barW / 2},${py + 132 - fraction * 22}`).join(" ");
    shapes += `<polyline points="${linePoints}" fill="none" stroke="${FIN.indigo}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    shapes += `<rect x="${pad}" y="${height * 0.09}" width="120" height="26" rx="13" fill="${FIN.trackDark}"/>`;
    shapes += bar(pad, height * 0.16, contentWidth * 0.85, 34, FIN.inkLight);
    shapes += bar(pad, height * 0.16 + 44, contentWidth * 0.6, 34, FIN.inkLight, 0.92);
    shapes += bar(pad, height * 0.3, contentWidth * 0.75, 14, FIN.mutedDark);
    shapes += `<rect x="${pad}" y="${height * 0.36}" width="140" height="46" rx="23" fill="url(#g-${uid})"/>`;
    shapes += `<rect x="${pad + 152}" y="${height * 0.36}" width="120" height="46" rx="23" fill="none" stroke="${FIN.inkLight}" stroke-opacity="0.45" stroke-width="2"/>`;
    const px = pad;
    const pw = contentWidth;
    const py = height * 0.5;
    const ph = height * 0.42;
    shapes += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="18" fill="#f8fafc"/>`;
    shapes += bar(px + 20, py + 20, pw * 0.4, 20, FIN.inkDark);
    shapes += bar(px + 20, py + 52, pw - 40, 10, FIN.mutedLight);
    const fractions = [0.5, 0.75, 0.6, 0.9, 0.66];
    const chartBase = py + ph - 36;
    const slotW = (pw - 40) / fractions.length;
    fractions.forEach((fraction, barIndex) => {
      const barH = (ph * 0.42) * fraction;
      shapes += `<rect x="${px + 20 + barIndex * slotW}" y="${chartBase - barH}" width="${Math.max(16, slotW - 12)}" height="${barH}" rx="6" fill="${barIndex % 2 ? FIN.violet : FIN.indigo}" opacity="0.9"/>`;
    });
  }
  return shapes;
}

function premiumFeatures(width, height, index) {
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const mobile = width < 600;
  const titleW = Math.min(420, contentWidth * 0.5);
  let shapes = bar((width - titleW) / 2, height * 0.06, titleW, 30, FIN.inkDark);
  shapes += bar((width - contentWidth * 0.32) / 2, height * 0.06 + 44, contentWidth * 0.32, 14, FIN.slate);
  const gap = mobile ? 14 : 20;
  const y0 = height * 0.2;
  const gridH = height - y0 - pad;
  const cardAt = (x, y, w, h, card) => {
    let cardShapes = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${FIN.card}" stroke="${FIN.trackDark}" stroke-width="2"/>`;
    const chip = mobile ? 32 : 44;
    cardShapes += `<rect x="${x + 22}" y="${y + 22}" width="${chip}" height="${chip}" rx="12" fill="${FIN.indigo}" opacity="0.9"/>`;
    cardShapes += `<circle cx="${x + 22 + chip / 2}" cy="${y + 22 + chip / 2}" r="${chip * 0.2}" fill="#ffffff" opacity="0.9"/>`;
    cardShapes += bar(x + 22, y + 22 + chip + 14, Math.min(w * 0.52, 190), mobile ? 16 : 18, FIN.inkLight);
    if (!mobile) cardShapes += bar(x + 22, y + 22 + chip + 42, Math.min(w * 0.72, 280), 13, FIN.mutedDark, 0.85);
    if (w > contentWidth * 0.4 && !mobile) {
      const mini = [0.55, 0.8, 0.66, 0.92];
      mini.forEach((fraction, miniIndex) => {
        const bw = Math.min(56, (w - 44) / mini.length - 10);
        const bh = (h * 0.24) * fraction;
        const base = y + h - 26;
        cardShapes += `<rect x="${x + 22 + miniIndex * ((w - 44) / mini.length)}" y="${base - bh}" width="${bw}" height="${bh}" rx="5" fill="${miniIndex % 2 ? FIN.violet : FIN.cyan}" opacity="0.85"/>`;
      });
    } else if (!mobile) {
      cardShapes += `<rect x="${x + 22}" y="${y + h - 52}" width="96" height="28" rx="14" fill="none" stroke="${FIN.mutedDark}" stroke-opacity="0.5" stroke-width="2"/>`;
    }
    return cardShapes;
  };
  if (!mobile) {
    const colW = (contentWidth - gap * 2) / 3;
    const rowH = (gridH - gap * 2) / 3;
    const colX = (col) => pad + col * (colW + gap);
    const rowY = (row) => y0 + row * (rowH + gap);
    const spanW = (span) => span * colW + (span - 1) * gap;
    const cells = [
      { c: 0, s: 2, r: 0 },
      { c: 2, s: 1, r: 0 },
      { c: 0, s: 1, r: 1 },
      { c: 1, s: 2, r: 1 },
      { c: "half-0", s: 0, r: 2 },
      { c: "half-1", s: 0, r: 2 },
    ];
    cells.forEach((cell, card) => {
      let x;
      let w;
      if (cell.c === "half-0") {
        x = pad;
        w = (contentWidth - gap) / 2;
      } else if (cell.c === "half-1") {
        x = pad + (contentWidth - gap) / 2 + gap;
        w = (contentWidth - gap) / 2;
      } else {
        x = colX(cell.c);
        w = spanW(cell.s);
      }
      shapes += cardAt(x, rowY(cell.r), w, rowH, card + index);
    });
  } else {
    const rowH = (gridH - gap * 5) / 6;
    for (let card = 0; card < 6; card += 1) {
      shapes += cardAt(pad, y0 + card * (rowH + gap), contentWidth, rowH, card + index);
    }
  }
  return shapes;
}

function premiumStats(width, height) {
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const mobile = width < 600;
  let shapes = `<rect width="${width}" height="6" fill="${FIN.indigo}"/>`;
  const eyebrowW = Math.min(220, contentWidth * 0.4);
  shapes += bar((width - eyebrowW) / 2, height * 0.14, eyebrowW, 14, FIN.mutedDark, 0.9);
  const statAt = (x, y, w, stat) => {
    const numW = Math.min(w * 0.55, 150);
    let statShapes = bar(x + (w - numW) / 2, y, numW, 44, FIN.inkLight);
    statShapes += `<rect x="${x + (w - 54) / 2}" y="${y + 60}" width="54" height="6" rx="3" fill="${stat % 2 ? FIN.violet : FIN.cyan}"/>`;
    statShapes += bar(x + (w - w * 0.5) / 2, y + 82, w * 0.5, 14, FIN.mutedDark, 0.85);
    return statShapes;
  };
  if (!mobile) {
    const colW = contentWidth / 4;
    for (let stat = 0; stat < 4; stat += 1) {
      shapes += statAt(pad + stat * colW, height * 0.34, colW, stat);
    }
  } else {
    const colW = contentWidth / 2;
    const rowH = height * 0.3;
    for (let stat = 0; stat < 4; stat += 1) {
      const col = stat % 2;
      const row = Math.floor(stat / 2);
      shapes += statAt(pad + col * colW, height * 0.26 + row * rowH, colW, stat);
    }
  }
  return shapes;
}

function premiumTinted(type, width, height) {
  // Checkout / profile / contact: keep the generic wireframe geometry,
  // tinted to the fintech palette.
  const background = FIN.pageLight;
  const ink = FIN.inkDark;
  const accent = FIN.indigo;
  const muted = FIN.mutedLight;
  const pad = Math.max(24, Math.round(width * 0.07));
  const contentWidth = width - pad * 2;
  const columns = width < 600 ? 1 : 3;
  const cardWidth = (contentWidth - (columns - 1) * 24) / columns;
  const shapes = Array.from({ length: columns * 2 }, (_, card) => {
    const column = card % columns;
    const row = Math.floor(card / columns);
    const x = pad + column * (cardWidth + 24);
    const y = height * 0.18 + row * Math.min(220, height * 0.28);
    return `<rect x="${x}" y="${y}" width="${cardWidth}" height="${Math.min(170, height * 0.22)}" rx="16" fill="${card % 2 ? background : muted}" opacity="${card % 2 ? 1 : 0.38}" stroke="${muted}"/>${bar(x + 20, y + 24, cardWidth * 0.55, 20, ink)}${bar(x + 20, y + 62, cardWidth * 0.75, 14)}${bar(x + 20, y + 100, cardWidth * 0.35, 34, accent)}`;
  }).join("");
  return { background, ink, shapes, defs: "", labelFill: "#0a1128" };
}

function premiumWireframe(type, width, height, index, uid) {
  if (type === "navbar") {
    return { background: FIN.navy, ink: FIN.inkLight, shapes: premiumNavbar(width, height), defs: "", labelFill: FIN.inkLight };
  }
  if (type === "hero") {
    return { background: FIN.navy, ink: FIN.inkLight, shapes: premiumHero(width, height, uid), defs: premiumDefs(uid), labelFill: FIN.inkLight };
  }
  if (type === "features") {
    return { background: FIN.pageLight, ink: FIN.inkDark, shapes: premiumFeatures(width, height, index), defs: "", labelFill: FIN.inkDark };
  }
  if (type === "stats") {
    return { background: FIN.navy, ink: FIN.inkLight, shapes: premiumStats(width, height), defs: "", labelFill: FIN.inkLight };
  }
  if (type === "checkout" || type === "profile" || type === "contact") {
    return premiumTinted(type, width, height);
  }
  if (type === "footer") {
    const { background, ink, shapes } = wireframe(type, width, height, index);
    return { background, ink, shapes, defs: "", labelFill: "#0f172a" };
  }
  return null;
}

function renderSection(sourceId, type, width, height, index, uid) {
  if (sourceId === NIMBUS_SOURCE_ID) {
    const premium = premiumWireframe(type, width, height, index, uid);
    if (premium) return premium;
  }
  const { background, ink, shapes } = wireframe(type, width, height, index);
  return { background, ink, shapes, defs: "", labelFill: "#0f172a" };
}

function writeSvg(id, width, height, type, label, index, sourceId, uid) {
  const { background, ink, shapes, defs } = renderSection(sourceId, type, width, height, index, uid);
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="${background}"/>${defs}${shapes}<text x="${width / 2}" y="${Math.min(height - 28, 42)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(14, Math.round(width / 65))}" fill="${ink}" opacity="0.72">${escapeXml(label)}</text><rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${ink}" stroke-opacity="0.12"/></svg>`;
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
      const uid = `p-${page.id}-${device}-${sectionIndex}`;
      const { background, shapes, defs, labelFill } = renderSection(page.sourceId, section.type, width, height, pageIndex + sectionIndex, uid);
      const label = escapeXml(section.title);
      // Only premium (Nimbus Pay) sections paint their own background band;
      // every other page keeps the exact legacy markup (page-level backdrop only).
      const band = page.sourceId === NIMBUS_SOURCE_ID ? `<rect width="${width}" height="${height}" fill="${background}"/>${defs}` : "";
      const group = `<g transform="translate(0 ${y})">${band}${shapes}<text x="${width / 2}" y="${Math.min(height - 28, 42)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(14, Math.round(width / 65))}" fill="${page.sourceId === NIMBUS_SOURCE_ID ? labelFill : "#0f172a"}" opacity="0.72">${label}</text></g>`;
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
      const uid = `c-${sectionId}-${device}`;
      writeSvg(cropId, width, sectionHeights[sectionIndex], section.type, section.title, pageIndex + sectionIndex, page.sourceId, uid);
      generated += 1;
    });
  });
});

console.log(`Generated ${generated} deterministic SVG assets in ${ASSETS_DIR}`);
