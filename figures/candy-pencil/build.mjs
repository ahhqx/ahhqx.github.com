// Fig: a pencil-shaped candy toy. A real wax crayon at the front, a hexagonal
// candy chamber in the middle (clear window, printed shrink sleeves), and a
// screw cap with an O-ring at the back. Hover to unscrew the cap.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 640;
const HEIGHT = 340;

// ---- the model: every number the figure shows comes from here ----
const ZA = 31; // pencil axis height above the tray top
const R = 14.4; // sleeve hex circumradius
const AP = R * Math.cos(Math.PI / 6); // sleeve hex apothem (flat-to-centre)
const RG = 13.8; // clear window hex circumradius
const PITCH = 2; // thread pitch, world units per turn
const THREAD_TURNS = 4; // engaged turns before the cap comes free
const CAP_TRAVEL = 40; // how far the cap moves to sit beside the neck
const ENGAGED = PITCH * THREAD_TURNS;

const X = {
  tip: -134, crayon: -110, collar0: -106, collar1: -101, nose1: -79, hex0: -77,
  win0: -22, win1: 32, hex1: 72, neck1: 88, cap0: 74.2, cap1: 87, capEnd: 97.5,
};
const CRADLES = [-56, 50];
const CRADLE_HALF = 7;

const TRAY = { x: -180, y: -30, w: 334, d: 96, r: 10 };
const TRAY_H = 8;
const FOOT_H = 3;

const F = G.frameOf([0, 0, ZA], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const hex = (r) => [90, 150, 210, 270, 330, 30].map((deg) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)]);
const vertex = (r, deg) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];

const P = k.fitProjection(
  [...k.boxCorners(TRAY, -TRAY_H - FOOT_H, 0), [X.tip, 0, ZA], [X.capEnd + CAP_TRAVEL, 0, ZA + 13], [X.hex0, 0, ZA + R], [X.hex1, 0, ZA + R]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 60 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const C = (paths, colour, style = {}) => k.solidSvg(paths, { tone: "hi", crease: "lo", ...style, className: `cz c-${colour}` });
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (points) => "M" + points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
const ink = (d, colour, extra = "") => `<path class="ink c-${colour}" d="${d}"${extra}/>`;
const byDepth = (list, of) => [...list].sort((a, b) => k.depthOf(of(a), P) - k.depthOf(of(b), P));

// A point printed on a face of the sleeve hex, between vertices deg1 and deg2:
// s along the pencil, w across the face (0..1), lifted 0.06 so it sits on top.
function facePoint(s, w, deg1, deg2, r = R) {
  const a = vertex(r + 0.08, deg1);
  const b = vertex(r + 0.08, deg2);
  return at([s, a[0] + (b[0] - a[0]) * w, ZA + a[1] + (b[1] - a[1]) * w]);
}
const FRONT = [-30, 30]; // the vertical face toward the viewer (y = +AP)
const UPPER = [30, 90]; // the upper face toward the viewer
const printDot = (s, w, rad, face, colour) => {
  const width = R; // both faces are R wide
  const points = Array.from({ length: 14 }, (_, i) => {
    const t = (i / 14) * Math.PI * 2;
    return facePoint(s + Math.cos(t) * rad, w + (Math.sin(t) * rad) / width, face[0], face[1]);
  });
  return ink(poly(points), colour);
};
const printStar = (s, w, rad, face, colour) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const t = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rr = i % 2 ? rad * 0.45 : rad;
    return facePoint(s + Math.cos(t) * rr, w + (Math.sin(t) * rr) / R, face[0], face[1]);
  });
  return ink(poly(points), colour);
};

// ---------------------------------------------------------------- tray
function tray() {
  const out = [`<path class="iso-halo" d="${k.haloOf(TRAY, -TRAY_H - FOOT_H, TRAY_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(TRAY, 18), ([x, y]) => [x, y, 0])) {
    out.push(S(k.cylinder(x, y, 6, -TRAY_H - FOOT_H, FOOT_H, P, 24), { tone: "lo" }));
  }
  out.push(C(k.slabOf(TRAY, -TRAY_H, TRAY_H, P, 8, 1.4), "tray", { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(TRAY, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(TRAY, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

  // ruler strip along the front edge: the toy is 23.1 cm long
  const strip = { x: -96, y: TRAY.y + TRAY.d - 14, w: 236, d: 6.5, r: 1 };
  out.push(C(k.slabOf(strip, 0, 0.6, P, 3), "cream", { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.6, strip.y + 3.2, 0.6]), at([strip.x + strip.w - 1.6, strip.y + 3.2, 0.6])], { size: 0.45 }));

  // label plate with three rule lines (printed text)
  const plate = { x: 112, y: 26, w: 30, d: 20, r: 1.5 };
  out.push(C(k.slabOf(plate, 0, 0.8, P, 3, 0.3), "silver", { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P, 3), { tone: "lo" }));
  for (const [y, len] of [[19, 18], [23.5, 14], [28, 20]]) out.push(L(k.lineOnTop([plate.x + 5, plate.y + y - 14], [plate.x + 5 + len, plate.y + y - 14], 0.8, P), { tone: "mid", free: true }));
  out.push(D(k.corners(plate, 2.2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return out.join("");
}

// A sheet of paper the crayon has already drawn on.
function paper() {
  const sheet = { x: -172, y: 4, w: 64, d: 50, r: 0.6 };
  const out = [C(k.slabOf(sheet, 0, 0.35, P, 2), "cream", { tone: "lo", crease: "none" })];
  for (let y = sheet.y + 8; y < sheet.y + sheet.d - 3; y += 6) out.push(L(k.lineOnTop([sheet.x, y], [sheet.x + sheet.w, y], 0.35, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([sheet.x + 9, sheet.y], [sheet.x + 9, sheet.y + sheet.d], 0.35, P), { tone: "faint", className: "rule-red" }));
  // the crayon strokes: waxy, a little broken
  const wave = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    return [sheet.x + 15 + t * 42, sheet.y + 18 + Math.sin(t * Math.PI * 4.2) * 6 + t * 4];
  });
  const loop = Array.from({ length: 70 }, (_, i) => {
    const t = (i / 69) * Math.PI * 2 * 2.3;
    return [sheet.x + 22 + t * 2.6 + Math.cos(t) * 5, sheet.y + 36 + Math.sin(t) * 5];
  });
  out.push(`<path class="wax c-red" data-free="" d="${k.onTop(wave, 0.36, P)}"/>`);
  out.push(`<path class="wax c-violet" data-free="" d="${k.onTop(loop, 0.36, P)}"/>`);
  return out.join("");
}

// ---------------------------------------------------------------- cradles
const cheekPolygon = (side) => {
  const pts = [[0, -R - 3], [18, -R - 3], [18, -R / 2 + 2.2], [AP, -R / 2], [0, -R]];
  return pts.map(([y, z]) => [y * side, z]);
};
function cradleBase(cx) {
  const out = [];
  const foot = { x: cx - 10, y: -20, w: 20, d: 40, r: 2.5 };
  out.push(`<path class="iso-halo" d="${k.haloOf(foot, 0, 0.1, P)}" style="filter:blur(4px)"/>`);
  out.push(C(k.slabOf(foot, 0, 3, P, 3, 0.5), "violet", { tone: "hi" }));
  const post = { x: cx - 7, y: -18, w: 14, d: 36, r: 1.5 };
  out.push(C(k.slabOf(post, 3, ZA - R - 3 - 3, P, 3, 0.4), "violet", { tone: "hi" }));
  out.push(D([at([cx - 6.5, 16, 3]), at([cx + 6.5, 16, 3]), at([cx + 6.5, -16, 3])], { size: 0.45 }));
  out.push(C(G.prismOf(F, cheekPolygon(-1), cx - CRADLE_HALF, cx + CRADLE_HALF, P), "violet", { tone: "hi" }));
  return out.join("");
}
function cradleFront(cx) {
  const out = [C(G.prismOf(F, cheekPolygon(1), cx - CRADLE_HALF, cx + CRADLE_HALF, P), "violet", { tone: "hi" })];
  // a felt pad line where the pencil rests, and a screw on the cheek face
  out.push(D([at([cx, 18.05, ZA - R / 2 - 3.6])], { size: 0.55, tone: "hi" }));
  return out.join("");
}

// ---------------------------------------------------------------- pencil, front to back
function crayon() {
  const out = [];
  // the wax head: a sharpened cone with a worn, rounded point
  const head = [[X.tip, 0.9, 1], [X.tip + 1.2, 1.9, 1], [X.tip + 4, 2.6], [X.crayon, 5.6], [X.collar0, 5.6]];
  out.push(C(G.solidOf(head, F, P, { rims: "last" }), "red", { inner: L(G.arcOf(F, X.crayon, 5.6, P), { tone: "faint" }) }));
  // wax shavings ridges where it was sharpened
  out.push(k.fadedSvg(G.ribsOf(F, X.tip + 5, X.crayon - 0.5, 2.95, 9, P, { r1: 5.5, fade: [0.15, 0.6], seams: "first" }), { tone: "faint" }));
  // the steel collar that grips the crayon
  out.push(C(G.disc(X.collar0, X.collar1, 6.8, F, P, { bevel: 0.3 }), "silver", { inner: L([X.collar0 + 1.6, X.collar1 - 1.6].map((s) => G.arcOf(F, s, 6.8, P)).join(""), { tone: "lo" }) }));
  // the nose cone, like a sharpened pencil's wood, in yellow plastic
  const nose = [[X.collar1, 6.4], [X.collar1 + 6, 8.1, 1], [X.nose1 - 4, 11.3, 1], [X.nose1, 12]];
  out.push(C(G.solidOf(nose, F, P, { rims: "last" }), "yellow"));
  out.push(C(G.disc(X.nose1, X.hex0, 12.6, F, P), "cream", { tone: "hi" }));
  return out.join("");
}

// Sleeve bands: printed shrink film over the tube. Colours alternate; the
// sleeve is 0.6 proud of the clear window, so its ends show as a small lip.
const SLEEVE_A = [[-77, -72, "yellow"], [-72, -49, "pink"], [-49, -45, "mint"], [-45, -26, "pink"], [-26, -22, "yellow"]];
const SLEEVE_B = [[32, 36, "orange"], [36, 57, "sky"], [57, 61, "yellow"], [61, 72, "sky"]];

function sleeveBand([s0, s1, colour]) {
  const out = [C(G.prismOf(F, hex(R), s0, s1, P), colour)];
  return out.join("");
}

function printsA() {
  const out = [];
  // polka dots on the pink bands
  const dots = [
    [-68, 0.3, 1.5, UPPER, "yellow"], [-63, 0.7, 1.1, UPPER, "sky"], [-58, 0.35, 1.3, UPPER, "mint"], [-53, 0.72, 1.4, UPPER, "white"],
    [-41, 0.3, 1.2, UPPER, "sky"], [-36, 0.68, 1.5, UPPER, "yellow"], [-31, 0.32, 1.1, UPPER, "white"],
    [-67, 0.25, 1.2, FRONT, "white"], [-61, 0.72, 1.5, FRONT, "yellow"], [-53, 0.3, 1.1, FRONT, "sky"],
  ];
  for (const [s, w, r, face, colour] of dots) out.push(printDot(s, w, r, face, colour));
  // the brand on the side, as printed on the film
  out.push(`<g class="print c-white">${k.faceTextSvg(k.sideMatrix([-44.2, AP + 0.1], ZA - 2.2, P, "left"), "CANDY", { size: 5.4, tone: "hi" })}</g>`);
  return out.join("");
}

function printsB() {
  const out = [];
  // a yellow wave ribbon running round the sky band
  const top = Array.from({ length: 30 }, (_, i) => [37 + (i / 29) * 19, 0.5 + 0.12 * Math.sin((i / 29) * Math.PI * 3)]);
  const ribbon = [...top.map(([s, w]) => facePoint(s, w - 0.08, ...FRONT)), ...top.reverse().map(([s, w]) => facePoint(s, w + 0.08, ...FRONT))];
  out.push(ink(poly(ribbon), "yellow"));
  for (const [s, w, r, colour] of [[40, 0.35, 2.2, "white"], [46.5, 0.66, 1.8, "pink"], [53, 0.32, 2.3, "yellow"]]) out.push(printStar(s, w, r, UPPER, colour));
  for (const [s, w, r, colour] of [[39, 0.78, 1.1, "white"], [50, 0.24, 1.2, "pink"], [55, 0.8, 1, "white"]]) out.push(printDot(s, w, r, UPPER, colour));
  out.push(`<g class="print c-white">${k.faceTextSvg(k.sideMatrix([62.4, AP + 0.1], ZA - 2.1, P, "left"), "POP!", { size: 4.6, tone: "hi" })}</g>`);
  out.push(printStar(66.5, 0.4, 1.8, UPPER, "yellow"));
  return out.join("");
}

// Candies packed into the chamber by gravity: a greedy fill from the bottom.
const CANDY_R = 4.3;
const CANDY_COLOURS = ["red", "orange", "yellow", "mint", "sky", "violet", "pink"];
function packCandies(s0, s1, inner, topZ) {
  const placed = [];
  const candidates = [];
  for (let z = -inner; z <= topZ; z += 0.6)
    for (let y = -inner; y <= inner; y += 0.9)
      for (let s = s0 + CANDY_R; s <= s1 - CANDY_R; s += 1.1) candidates.push([s, y, z]);
  candidates.sort((a, b) => a[2] - b[2] || Math.abs(a[1]) - Math.abs(b[1]) || a[0] - b[0]);
  for (const [s, y, z] of candidates) {
    if (Math.hypot(y, z) > inner - CANDY_R) continue;
    if (placed.some((p) => Math.hypot(p[0] - s, p[1] - y, p[2] - z) < CANDY_R * 2 - 0.15)) continue;
    placed.push([s, y, z]);
  }
  return placed.map(([s, y, z], i) => ({ at: [s, y, ZA + z], colour: CANDY_COLOURS[(i * 3) % CANDY_COLOURS.length] }));
}
const CANDIES = packCandies(X.win0 + 0.6, X.win1 - 0.6, RG * Math.cos(Math.PI / 6) - 0.9, 3.5);

function candySvg({ at: c, colour }, r = CANDY_R) {
  const paths = G.sphereOf(c, r, P);
  const gloss = at([c[0] - r * 0.2, c[1] - r * 0.25, c[2] + r * 0.55]);
  return C(paths, colour, { crease: "none" }) + `<ellipse class="gloss" cx="${gloss[0].toFixed(2)}" cy="${gloss[1].toFixed(2)}" rx="${(r * 0.24 * G.scaleOf(P)).toFixed(2)}" ry="${(r * 0.15 * G.scaleOf(P)).toFixed(2)}"/>`;
}

function windowChamber() {
  const out = [];
  const glass = G.prismOf(F, hex(RG), X.win0, X.win1, P);
  out.push(`<path class="glass-back" d="${glass.fill}"/>`);
  // the far edges of the hex tube, seen through the clear wall
  const far = [150, 210, 270].map((deg) => {
    const [y, z] = vertex(RG, deg);
    return k.segment([X.win0, y, ZA + z], [X.win1, y, ZA + z], P);
  });
  out.push(L(far.join(""), { tone: "faint" }));
  for (const candy of byDepth(CANDIES, (c) => c.at)) out.push(candySvg(candy));
  out.push(S(glass, { tone: "hi", crease: "faint", className: "glass" }));
  // two reflections along the upper face, ending on the sleeve lips
  for (const w of [0.28, 0.4]) {
    out.push(`<path class="iso-line glint" d="M${facePoint(X.win0 + 0.4, w, UPPER[0], UPPER[1], RG).join(" ")}L${facePoint(X.win1 - 0.4, w, UPPER[0], UPPER[1], RG).join(" ")}"/>`);
  }
  return out.join("");
}

// The neck: the hex shoulder, an O-ring, and a threaded round neck with an
// opening at its end; candies wait just inside.
function neck() {
  const out = [];
  // the O-ring that makes the cap seal tight, seated against the shoulder
  out.push(C(G.lathe([[X.hex1, 10.4], [X.hex1 + 0.5, 12.1, 1], [X.hex1 + 1.6, 12.1, 1], [X.hex1 + 2.1, 10.4]], F, P), "mint", { crease: "none" }));
  out.push(C(G.solidOf([[X.hex1, 10.8], [X.neck1 - 0.8, 10.8], [X.neck1, 10.2]], F, P, { rims: "last" }), "cream", {
    inner: L([76, 78.5, 81, 83.5, 86].map((s) => G.arcOf(F, s, 10.8, P)).join(""), { tone: "lo" }),
  }));
  // the opening, with a candy right behind it
  const hole = G.circleOf(F, X.neck1 + 0.02, 8.2, P, 64);
  out.push(`<clipPath id="cp-mouth"><path d="${hole}"/></clipPath><path class="mouth" d="${hole}"/>`);
  out.push(`<g clip-path="url(#cp-mouth)">${candySvg({ at: [X.neck1 - 3.2, -1.2, ZA - 2.6], colour: "mint" })}${candySvg({ at: [X.neck1 - 4.5, 3.5, ZA + 2.4], colour: "pink" })}</g>`);
  out.push(L(hole, { tone: "hi" }));
  return out.join("");
}

// The cap: a knurled band and a domed end, like a pencil's eraser.
function cap() {
  const out = [];
  out.push(C(G.disc(X.cap0, X.cap1, 13.4, F, P, { rims: "first" }), "silver", {
    inner: k.fadedSvg(G.ribsOf(F, X.cap0 + 2, X.cap1 - 2, 13.4, 64, P, { fade: [0.12, 0.55], seams: true }), { tone: "lo" }),
  }));
  // the dome is half an ellipse, shaded from its analytic profile
  const DL = X.capEnd - X.cap1, DR = 13;
  const domeR = (s) => DR * Math.sqrt(Math.max(0, 1 - ((s - X.cap1) / DL) ** 2));
  const domeSlope = (s) => { const t = (s - X.cap1) / DL; return -DR * t / (DL * Math.sqrt(Math.max(1e-4, 1 - t * t))); };
  const knots = Array.from({ length: 24 }, (_, i) => { const s = X.cap1 + DL * 0.93 * Math.sin((i / 23) * Math.PI / 2); return [s, domeR(s), 1]; });
  out.push(C(G.solidOf(knots, F, P, { smooth: { slope: domeSlope, radius: domeR } }), "eraser", { crease: "none", inner: L(G.arcOf(F, X.cap1 + 2.2, domeR(X.cap1 + 2.2), P, { slope: domeSlope(X.cap1 + 2.2) }), { tone: "faint" }) }));
  return out.join("");
}

// Wrapped candies spilled on the tray.
function looseCandies() {
  const out = [];
  const list = [
    { at: [-8, 34, 4.3], colour: "orange" },
    { at: [9, 27, 4.3], colour: "sky" },
    { at: [20, 39, 4.3], colour: "pink" },
  ];
  for (const candy of byDepth(list, (c) => c.at)) {
    const [x, y] = candy.at;
    out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 4, y: y - 4, w: 8, d: 8, r: 4 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
    // twisted wrapper ends, along x
    const WF = G.frameOf([x, y, 4.3], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(C(G.solidOf([[-9, 3.2], [-7.4, 2.4, 1], [-5.6, 1.1], [-3.6, 1.6]], WF, P), candy.colour, { crease: "none" }));
    out.push(candySvg(candy));
    out.push(C(G.solidOf([[3.6, 1.6], [5.6, 1.1], [7.4, 2.4, 1], [9, 3.2]], WF, P), candy.colour, { crease: "none" }));
  }
  return out.join("");
}

// ---------------------------------------------------------------- assemble
const pencilHalo = `<path class="iso-halo" d="${k.haloOf({ x: X.tip + 10, y: -10, w: X.capEnd - X.tip - 10, d: 20, r: 10 }, 0, 0.1, P)}" style="opacity:.55"/>`;

const body = [
  tray(),
  paper(),
  pencilHalo,
  ...CRADLES.map(cradleBase),
  crayon(),
  ...SLEEVE_A.slice(0, 2).map(sleeveBand),
  cradleFront(CRADLES[0]),
  ...SLEEVE_A.slice(2).map(sleeveBand),
  printsA(),
  windowChamber(),
  ...SLEEVE_B.slice(0, 2).map(sleeveBand),
  cradleFront(CRADLES[1]),
  ...SLEEVE_B.slice(2).map(sleeveBand),
  printsB(),
  looseCandies(),
  neck(),
  `<g data-part="cap">${cap()}</g>`,
];

const CSS = `<style>
.iso{--k-pink:#d9578f;--k-yellow:#d6a91a;--k-mint:#2fa57c;--k-sky:#2f86cc;--k-violet:#7c5fd6;--k-orange:#d9741a;--k-red:#c9302c;--k-silver:#8a9099;--k-cream:#3a3830;--k-white:#f4f1e8;--k-eraser:#c86d7e;--k-tray:#2a2723;--glass-in:#141c22;--glass-face:#bfe6ff;--glass-a:.07;--mouth:#0a0a0a}
.iso[data-theme="light"]{--k-pink:#ff7eb6;--k-yellow:#ffd23f;--k-mint:#5fd3a8;--k-sky:#5ab8ff;--k-violet:#a68cff;--k-orange:#ff9a3c;--k-red:#e8423f;--k-silver:#d3d8df;--k-cream:#fffcf0;--k-white:#ffffff;--k-eraser:#ff9fb0;--k-tray:#f1ece2;--glass-in:#eef7fb;--glass-face:#ffffff;--glass-a:.22;--mouth:#3b2e2a}
.c-pink{--c:var(--k-pink)}.c-yellow{--c:var(--k-yellow)}.c-mint{--c:var(--k-mint)}.c-sky{--c:var(--k-sky)}.c-violet{--c:var(--k-violet)}.c-orange{--c:var(--k-orange)}.c-red{--c:var(--k-red)}.c-silver{--c:var(--k-silver)}.c-cream{--c:var(--k-cream)}.c-white{--c:var(--k-white)}.c-eraser{--c:var(--k-eraser)}.c-tray{--c:var(--k-tray)}
.cz{--anatomy-paper:var(--c);--anatomy-face:var(--c);--anatomy-top:color-mix(in oklab,var(--c) 70%,white);--anatomy-shade-3:var(--c);--anatomy-shade-2:color-mix(in oklab,var(--c) 90%,black);--anatomy-shade-1:color-mix(in oklab,var(--c) 81%,black);--anatomy-shade-0:color-mix(in oklab,var(--c) 72%,black)}
.iso:not([data-theme="light"]) .cz{--anatomy-top:color-mix(in oklab,var(--c) 84%,white)}
.ink{fill:var(--c);stroke:none}
.print .iso-face-text{fill:var(--c);font-weight:700;letter-spacing:.08em}
.wax{fill:none;stroke:var(--c);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:6 .7 2.5 .5;opacity:.92}
.rule-red{stroke:color-mix(in oklab,var(--k-red) 45%,transparent)!important}
.glass-back{fill:var(--glass-in);stroke:none}
.glass>.iso-fill{fill:none}
.glass>.iso-shade,.glass>.iso-top{fill:var(--glass-face);opacity:var(--glass-a)}
.glass>.iso-top{opacity:calc(var(--glass-a) * 1.6)}
.glint{stroke:var(--glass-face);stroke-width:1.1;opacity:.55}
.gloss{fill:#fff;opacity:.75}
.mouth{fill:var(--mouth)}
</style>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A pencil-shaped candy toy lying in two cradles on a tray. Its front is a real wax crayon in a steel collar and a yellow nose cone; the hexagonal body is wrapped in printed shrink film with a clear window full of candies; the back is a knurled screw cap with an O-ring. Unscrewing the cap opens the neck, where more candies wait.",
  body,
});

const live = `
const P = ${JSON.stringify(P)};
const PITCH = ${PITCH}, ENGAGED = ${ENGAGED}, TRAVEL = ${CAP_TRAVEL}, DROP = ${(ZA - 13.4).toFixed(2)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const capPart = svg.querySelector('[data-part="cap"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let open = 0, target = 0, frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;
function say() {
  const d = open * TRAVEL;
  const turns = Math.min(d, ENGAGED) / PITCH;
  const text = d < 0.15 ? "cap sealed · 0.0 turns" : d < ENGAGED ? "unscrewing · " + turns.toFixed(1) + " of ${THREAD_TURNS} turns" : d < TRAVEL - 0.5 ? "cap free · sliding off" : "cap off · candy ready";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(open * 100)));
  stage.setAttribute("aria-valuetext", text);
}
function draw() {
  // threaded: the cap creeps out one pitch per turn, then slides free
  // once clear of the neck it is set down on its side on the tray
  const d = open * TRAVEL;
  const t = Math.min(1, Math.max(0, (d - ENGAGED - 14) / (TRAVEL - ENGAGED - 14)));
  const lower = DROP * t * t * (3 - 2 * t);
  capPart.setAttribute("transform", translateAlong(P, [d, 0, -lower]));
  say();
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; target = Math.floor(clock / 3.2) % 2 ? 1 : 0; }
  // slow while the thread is engaged (a turning hand), quicker once free
  const engaged = open * TRAVEL < ENGAGED;
  const tau = engaged ? 0.9 : 0.35;
  open = still.matches ? target : open + (target - open) * (1 - Math.exp(-dt / tau));
  if (Math.abs(target - open) < 0.0008) open = target;
  draw();
  const settled = !touring && open === target;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, 0, 1); clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.3) / 0.5, 0, 1));
});
stage.addEventListener("pointerleave", () => steer(target));
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = target + 0.1;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = target - 0.1;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = 1;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
`;

const page = k.plateHtml({
  fig: "Fig 1",
  title: "Crayon candy pencil",
  hint: "Hover right to unscrew the cap",
  readout: "cap sealed · 0.0 turns",
  keys: [
    { mark: "raised", label: "Wax crayon head: it really draws" },
    { mark: "flat", label: "Printed shrink sleeves and a clear candy window" },
    { mark: "edge", label: `Screw cap: ${THREAD_TURNS} turns of ${PITCH} mm thread over an O-ring` },
  ],
  caption:
    "A candy toy shaped like a pencil. The crayon tip draws on paper; the hexagonal chamber holds about " +
    CANDIES.length +
    " candies behind a clear window between printed shrink sleeves; the cap needs four turns to clear its thread, and the O-ring under it keeps the candies sealed.",
  body: `${CSS}<div class="iso-stage" tabindex="0" role="slider" aria-label="Candy pencil: arrow keys unscrew the cap" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${svg}</div>`,
});

const name = theme === "light" ? "candy-pencil-light.html" : "candy-pencil.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Crayon candy pencil", theme, body: page, script: kitScript() + live }));
console.log("wrote", name, "·", CANDIES.length, "candies");
