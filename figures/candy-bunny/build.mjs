// Fig: a plush-bunny candy blaster. The bunny wears a tied film bag full of
// candy on its head and blue sunglasses, and holds a blue toy pistol that is a
// real dispenser: pull the trigger and one candy leaves the barrel and drops
// into the dish in front. A window in the grip shows the candies left.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../.claude/skills/anatomy/kit/tube.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 520;
const AZIMUTH = 50;

// ---- the model ----
const MAG = 6; // candies in a full magazine
const CR = 2.5; // dispenser candy radius
const HEAD = { c: 86, R: 30 };
const BAG_CR = 3.8; // candies in the head bag

// The bunny faces 22° left of the camera so it reads in three-quarter view.
const FACE = ((AZIMUTH - 22) * Math.PI) / 180;
const f = [Math.cos(FACE), Math.sin(FACE), 0]; // forward
const r = [Math.sin(FACE), -Math.cos(FACE), 0]; // bunny's left-to-right
const z = [0, 0, 1];
const W = (a, b, c) => [a * r[0] + b * f[0], a * r[1] + b * f[1], c];
const add = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const scale3 = (p, s) => [p[0] * s, p[1] * s, p[2] * s];
const unit = (p) => scale3(p, 1 / Math.hypot(...p));
const cross = G.cross3;

const BASE_C = W(0, 16, 0);
const BASE_R = 66;
const DISH = W(0, 62, 0);

const P = k.fitProjection(
  [
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => add(BASE_C, [BASE_R * Math.cos((i * Math.PI) / 4), BASE_R * Math.sin((i * Math.PI) / 4), -12])),
    W(0, 0, 172), W(-66, 0, 112), W(66, 0, 112),
  ],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: AZIMUTH },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const NEAR = Math.sign(G.dot3(r, V)) || 1; // which side of the bunny faces us

const at = (p) => k.iso(p, P);
const C = (paths, colour, style = {}) => k.solidSvg(paths, { tone: "hi", crease: "lo", ...style, className: `cz c-${colour}${style.extra ? " " + style.extra : ""}` });
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const path = (points, closed = false) => "M" + points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + (closed ? "Z" : "");
const ink = (points, colour, extra = "") => `<path class="ink c-${colour}"${extra} d="${path(points, true)}"/>`;
const depth = (p) => G.dot3(p, V);
const byDepth = (list, of) => [...list].sort((a, b) => depth(of(a)) - depth(of(b)));
const ellipse = (cx, cy, rx, ry, n = 24) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)]);
const rounded = (cx, cy, w, h, rad, n = 5) => {
  const out = [];
  const corners = [[cx + w / 2 - rad, cy + h / 2 - rad, 0], [cx - w / 2 + rad, cy + h / 2 - rad, 90], [cx - w / 2 + rad, cy - h / 2 + rad, 180], [cx + w / 2 - rad, cy - h / 2 + rad, 270]];
  for (const [x, y, start] of corners) for (let i = 0; i <= n; i++) { const t = ((start + (i / n) * 90) * Math.PI) / 180; out.push([x + rad * Math.cos(t), y + rad * Math.sin(t)]); }
  return out;
};
const FZ = G.frameOf([0, 0, 0], z, r, f); // vertical axis through the bunny
const zf = (o) => G.frameOf(o, z, r, f);

// A point on the front of the head sphere at lateral a, height c (relative to its centre).
const HC = W(0, 0, HEAD.c);
const onHead = (a, c, lift = 0.12) => add(HC, W(a, Math.sqrt(Math.max(0, (HEAD.R + lift) ** 2 - a * a - c * c)), c));

// ---------------------------------------------------------------- base and dish
function base() {
  const F = zf(add(BASE_C, [0, 0, -12]));
  const out = [`<path class="iso-halo" d="${G.disc(0, 12, BASE_R, F, P).fill}"/>`];
  out.push(C(G.disc(0, 9, BASE_R, F, P, { bevel: 1.2 }), "base", { tone: "mid", inner: L(G.arcOf(F, 3.5, BASE_R, P), { tone: "faint" }) }));
  out.push(C(G.disc(9, 12, BASE_R - 4, F, P, { bevel: 0.8 }), "base", { tone: "mid" }));
  out.push(L(G.circleOf(F, 12, BASE_R - 9, P, 160), { tone: "faint" }));
  // four screws on a bolt circle and a small brand plate at the back
  out.push(D(G.dotsOf(F, 12, BASE_R - 6.5, 8, P, { all: true, phase: Math.PI / 8 }), { size: 0.5 }));
  return out.join("");
}

function dish() {
  const F = zf(DISH);
  const out = [];
  out.push(C(G.disc(0, 1.4, 19.4, F, P), "yellow", { tone: "hi" }));
  out.push(C(G.ringBand(0, 4.2, 18.6, 21.6, F, P, { bevel: 0.4 }), "yellow", { tone: "hi", inner: L(G.arcOf(F, 2.1, 21.6, P), { tone: "faint" }) }));
  out.push(L(G.circleOf(F, 1.42, 12, P, 64), { tone: "faint" }));
  return out.join("");
}

// ---------------------------------------------------------------- ears
// An ear is a thin convex prism: an oval with its root at u = 0, thickness along a.
function ear({ root, long, face, length, width, thick, colour, inner }) {
  const a = unit(face);
  const u = unit(long);
  const v = cross(a, u);
  const F = G.frameOf(root, a, u, v);
  const oval = ellipse(length / 2, 0, length / 2, width / 2, 28);
  const out = [C(G.prismOf(F, oval, -thick / 2, thick / 2, P), colour)];
  const front = G.dot3(a, V) > 0 ? thick / 2 + 0.06 : -thick / 2 - 0.06;
  const pink = ellipse(length * 0.56, 0, length * 0.36, width * 0.3, 24).map(([x, y]) => at(add(root, add(add(scale3(a, front), scale3(u, x)), scale3(v, y)))));
  out.push(ink(pink, inner));
  // a seam round the pink lining: plush stitching
  return { at: add(root, scale3(u, length / 2)), svg: out.join("") };
}
const EARS = [-1, 1].flatMap((side) => [
  ear({ root: W(side * 22, -6, HEAD.c + 16), long: W(side * 0.92, -0.05, 0.38), face: W(side * 0.1, 1, 0.25), length: 44, width: 22, thick: 6, colour: "fur", inner: "pink" }),
  ear({ root: W(side * 27, -8, HEAD.c + 4), long: W(side * 0.42, 0.08, -0.9), face: W(side * 0.7, 0.65, 0.1), length: 56, width: 24, thick: 7, colour: "grey", inner: "pink" }),
]);

// ---------------------------------------------------------------- body
function body() {
  const out = [];
  const profile = [[2, 22], [8, 26.5, 1], [22, 28, 1], [38, 25, 1], [50, 20, 1], [58, 15]];
  out.push(C(G.solidOf(profile, FZ, P, { rims: "none" }), "fur", { crease: "none" }));
  return out.join("");
}
function feet() {
  return byDepth([-1, 1], (s) => W(s * 13, 22, 7)).map((s) => C(G.sphereOf(W(s * 13, 22, 7), 9, P), "fur", { crease: "none" })).join("");
}

// ---------------------------------------------------------------- head and face
function head() {
  const out = [C(G.sphereOf(HC, HEAD.R, P, { steps: 96 }), "fur", { crease: "none" })];
  // blush
  for (const s of [-1, 1]) out.push(ink(ellipse(s * 17, -8, 6.5, 3.8).map(([a, c]) => at(onHead(a, c))), "blush"));
  // eyes, under the lenses
  for (const s of [-1, 1]) {
    const eye = onHead(s * 11.5, 4, -3.4);
    out.push(C(G.sphereOf(eye, 4.6, P), "ink", { crease: "none" }));
    const glint = at(add(eye, W(-1.4, 3.6, 1.6)));
    out.push(`<circle class="gloss" cx="${glint[0].toFixed(2)}" cy="${glint[1].toFixed(2)}" r="${(1.1 * KS).toFixed(2)}"/>`);
  }
  // brows peeking over the frame
  for (const s of [-1, 1]) {
    const brow = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return at(onHead(s * (6.5 + t * 8), 18 + Math.sin(t * Math.PI) * 1.6)); });
    out.push(L(path(brow), { tone: "hi", free: true }));
  }
  // nose and stitched mouth
  out.push(C(G.sphereOf(onHead(0, -8.6, -1.6), 2.8, P), "pink", { crease: "none" }));
  for (const s of [-1, 1]) {
    const mouth = Array.from({ length: 10 }, (_, i) => { const t = i / 9; return at(onHead(s * 4.2 * Math.sin(t * Math.PI * 0.9), -11.6 - 2.4 * Math.sin(t * Math.PI))); });
    out.push(L(path(mouth), { tone: "mid", free: true }));
  }
  // whiskers: nylon, out into the air
  for (const s of [-1, 1]) for (const [c0, c1] of [[-9, -6], [-11, -11.5]]) {
    const from = at(onHead(s * 14, c0));
    const to = at(add(onHead(s * 14, c0), W(s * 22, -4, c1 - c0)));
    out.push(k.fadeLineSvg([from, to], { tone: "mid", fade: [0, 14] }));
    out.push(D([from], { size: 0.45, tone: "mid" }));
  }
  return out.join("");
}

// The sunglasses: a moulded front with two dark lenses, a bridge and arms.
function glasses() {
  const o = W(0, 31.2, HEAD.c + 5);
  const F = G.frameOf(o, f, r, z);
  const out = [];
  // arms run back over the cheeks to the ears
  for (const s of byDepth([-1, 1], (s) => add(o, W(s * 21, -8, 0)))) out.push(C(G.prismOf(F, rounded(s * 21.6, 2.6, 2, 3.2, 0.8, 2), -17, 0.4, P), "blue"));
  for (const s of [-1, 1]) out.push(C(G.prismOf(F, rounded(s * 11.6, 0, 19, 16, 6), 0, 2.6, P), "blue"));
  out.push(C(G.prismOf(F, rounded(0, 3.2, 6, 3.4, 1.2, 2), 0.4, 2.4, P), "blue"));
  for (const s of [-1, 1]) {
    out.push(C(G.prismOf(F, rounded(s * 11.6, 0, 14.6, 11.6, 4.4), 2.6, 2.9, P), "lens", { crease: "none", tone: "lo", extra: "lens" }));
    // a reflection across each lens, edge to edge
    const p = (x, y) => at(G.pointOf(F, 2.95, 0, 0).map((v, i) => v + r[i] * x + z[i] * y));
    out.push(L(path([p(s * 11.6 - 4.8, 5.6), p(s * 11.6 + 3.2, -5.6)]), { tone: "faint", className: "shine" }));
  }
  // hinges: two screws at the outer corners
  out.push(D([-1, 1].map((s) => at(G.pointOf(F, 2.62, 0, 0).map((v, i) => v + r[i] * s * 19.6 + z[i] * 4.6))), { size: 0.5, tone: "hi" }));
  return out.join("");
}

// ---------------------------------------------------------------- the candy bag
const BAG = [[58, 31.5], [66, 34, 1], [84, 34.6, 1], [102, 32.6, 1], [116, 29.5, 1], [128, 25, 1], [138, 17, 1], [145, 8, 1], [148.5, 4.2]];
const bagR = (s) => {
  for (let i = 0; i < BAG.length - 1; i++) if (s >= BAG[i][0] && s <= BAG[i + 1][0]) { const t = (s - BAG[i][0]) / (BAG[i + 1][0] - BAG[i][0]); return BAG[i][1] + (BAG[i + 1][1] - BAG[i][1]) * t; }
  return 0;
};
const COLOURS = ["red", "orange", "yellow", "mint", "sky", "violet", "pink"];
function packBag() {
  const placed = [];
  const cands = [];
  for (let c = 110; c <= 145; c += 0.7) for (let a = -26; a <= 26; a += 0.9) for (let b = -26; b <= 26; b += 0.9) cands.push([a, b, c]);
  cands.sort((p, q) => p[2] - q[2] || Math.hypot(p[0], p[1]) - Math.hypot(q[0], q[1]));
  for (const [a, b, c] of cands) {
    if (Math.hypot(a, b) > bagR(c) - BAG_CR - 0.9) continue;
    if (Math.hypot(a, b, c - HEAD.c) < HEAD.R + BAG_CR + 0.2) continue;
    if (placed.some((p) => Math.hypot(p[0] - a, p[1] - b, p[2] - c) < BAG_CR * 2 - 0.1)) continue;
    placed.push([a, b, c]);
    if (placed.length >= 60) break;
  }
  return placed.map(([a, b, c], i) => ({ at: W(a, b, c), colour: COLOURS[(i * 5) % COLOURS.length] }));
}
const BAG_CANDIES = packBag();

function candy(p, rad, colour) {
  const g = at(add(p, [0, 0, rad * 0.5]).map((v, i) => v - V[i] * 0 + (i === 0 ? -rad * 0.25 : 0)));
  return C(G.sphereOf(p, rad, P), colour, { crease: "none" }) + `<ellipse class="gloss" cx="${g[0].toFixed(2)}" cy="${g[1].toFixed(2)}" rx="${(rad * 0.26 * KS).toFixed(2)}" ry="${(rad * 0.17 * KS).toFixed(2)}"/>`;
}

function bag() {
  const out = [];
  const film = G.solidOf(BAG, FZ, P, { rims: "none" });
  out.push(k.solidSvg(film, { tone: "hi", crease: "none", className: "film" }));
  // folds run from the gathered neck down to the hem, wavering like film does
  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 2 + 0.11 * Math.sin(i * 2.3);
    const pts = [];
    for (let s = 60; s <= 147; s += 2.5) {
      const wob = 0.06 * Math.sin(s * 0.21 + i * 1.7) + 0.035 * Math.sin(s * 0.5 + i);
      const rr = bagR(s) + 0.15;
      const ang = angle + wob;
      const n = G.radialOf(FZ, ang);
      const slope = (bagR(s + 0.5) - bagR(s - 0.5));
      const facing = G.dot3(n, V) - slope * 0.5 * G.dot3(z, V);
      pts.push(facing > 0.08 ? at(G.pointOf(FZ, s, rr, ang)) : null);
    }
    // keep only the run that faces us
    let run = [];
    const runs = [];
    for (const p of pts) { if (p) run.push(p); else if (run.length) { runs.push(run); run = []; } }
    if (run.length) runs.push(run);
    for (const one of runs) if (one.length > 3) out.push(L(path(one), { tone: "faint", className: i % 3 ? "fold" : "fold hi", free: true }));
  }
  // the hem, gathered under the chin
  out.push(L(G.arcOf(FZ, 58.4, 31.6, P, { slope: 0.3 }), { tone: "mid", className: "fold-hem" }));
  // a long highlight on the film's shoulder
  const glint = Array.from({ length: 16 }, (_, i) => { const s = 70 + i * 3.3; return at(G.pointOf(FZ, s, bagR(s) + 0.2, G.angleToward(FZ, V) + 0.55)); });
  out.push(`<path class="film-glint" d="${path(glint)}"/>`);
  return out.join("");
}

function knot() {
  const out = [];
  const top = W(0, 0, 150.5);
  // two flaps of film fanned up out of the knot, like a second pair of ears
  for (const s of byDepth([-1, 1], (s) => add(top, W(s * 8, 0, 8)))) {
    const long = W(s * 0.62, 0.1, 0.78);
    const a = unit(W(s * 0.15, 1, -0.1));
    const u = unit(long);
    const v = cross(a, u);
    const F = G.frameOf(top, a, u, v);
    const leaf = [[0, -2], [6, -5.6], [15, -6.4], [19.5, -3], [20.5, 1.5], [14, 4.6], [5, 3.4], [0, 2]];
    out.push(k.solidSvg(G.prismOf(F, leaf, -0.5, 0.5, P), { tone: "hi", crease: "none", className: "film flap" }));
    out.push(k.fadeLineSvg([[0.5, 0], [8, -0.4], [18.5, 0.8]].map(([x, y]) => at(G.pointOf(F, 0.55, 0, 0).map((q, i) => q + u[i] * x + v[i] * y))), { tone: "faint", fade: [0, 8], className: "fold" }));
  }
  out.push(C(G.sphereOf(top, 4.6, P), "knot", { crease: "none" }));
  // the twist: three turns of film round the knot
  const KF = zf(top);
  out.push(L([-1.8, 0, 1.8].map((s) => G.arcOf(KF, s, Math.sqrt(4.6 ** 2 - s * s), P, { slope: -s / Math.sqrt(4.6 ** 2 - s * s) })).join(""), { tone: "faint" }));
  return out.join("");
}

// ---------------------------------------------------------------- the candy pistol
const GUN = { b0: 19, b1: 50, c0: 44, c1: 56, half: 6 };
const MUZZLE = W(0, GUN.b1 + 4.4, (GUN.c0 + GUN.c1) / 2 + 0.6);
const GRIP_AXIS = unit(W(0, -0.32, -0.95));
const GRIP_O = W(0, GUN.b0 + 6, GUN.c0 + 0.4);
const GRIP_U = r;
const GRIP_V = cross(GRIP_AXIS, GRIP_U);
const GRIP_F = G.frameOf(GRIP_O, GRIP_AXIS, GRIP_U, GRIP_V);
const GRIP_LEN = 22;

function slide() {
  const F = G.frameOf(W(0, 0, 0), f, r, z);
  const out = [];
  out.push(C(G.prismOf(F, rounded(0, (GUN.c0 + GUN.c1) / 2, GUN.half * 2, GUN.c1 - GUN.c0, 2.4), GUN.b0, GUN.b1, P), "gun"));
  // the slide is a separate moulding on top, with serrations at the back
  out.push(C(G.prismOf(F, rounded(0, GUN.c1 + 0.9, GUN.half * 2 - 2, 2.2, 0.9, 2), GUN.b0 + 1, GUN.b1 - 1, P), "gun"));
  out.push(C(G.prismOf(F, rounded(0, GUN.c1 + 2.6, 1.8, 1.6, 0.5, 2), GUN.b1 - 4, GUN.b1 - 1.6, P), "gun"));
  const side = NEAR * (GUN.half + 0.06);
  const serr = [];
  for (let i = 0; i < 6; i++) { const b = GUN.b0 + 2 + i * 1.3; serr.push(k.segment(W(side, b, GUN.c0 + 3), W(side, b, GUN.c1 - 2.2), P)); }
  out.push(L(serr.join(""), { tone: "lo" }));
  // parting lines along the side (the serrations run between them), and two pins
  out.push(L(k.segment(W(side, GUN.b0, GUN.c0 + 3), W(side, GUN.b1, GUN.c0 + 3), P) + k.segment(W(side, GUN.b0, GUN.c1 - 2.2), W(side, GUN.b1, GUN.c1 - 2.2), P), { tone: "lo" }));
  out.push(D([W(side, GUN.b0 + 13, GUN.c0 + 1.6), W(side, GUN.b1 - 4, GUN.c0 + 1.6)].map(at), { size: 0.6, tone: "hi" }));
  // the barrel: a round nozzle with a darker bore
  const BF = G.frameOf(W(0, GUN.b1, (GUN.c0 + GUN.c1) / 2 + 0.6), f, r, z);
  out.push(C(G.disc(0, 3.2, 5, BF, P, { bevel: 0.3 }), "gun-dark"));
  out.push(C(G.disc(3.2, 4.4, 4.4, BF, P, { bevel: 0.3 }), "gun-dark"));
  out.push(`<path class="bore" d="${G.circleOf(BF, 4.42, CR + 0.15, P, 48)}"/>`);
  out.push(L(G.circleOf(BF, 4.42, CR + 0.15, P, 48), { tone: "hi" }));
  out.push(L(G.arcOf(BF, 1.6, 5, P), { tone: "lo" }));
  return out.join("");
}

// The magazine: a clear tube along the top of the slide, candies in a row.
const HOP = { b0: GUN.b0 + 1.2, b1: GUN.b1 - 5.4, c: GUN.c1 + 2.2 + 3.2, r: 3.2 };
const MAG_AT = Array.from({ length: MAG }, (_, i) => W(0, HOP.b0 + 2.9 + i * ((HOP.b1 - HOP.b0 - 5.8) / (MAG - 1)), HOP.c));
function hopper() {
  const F = G.frameOf(W(0, 0, HOP.c), f, r, z);
  const out = [];
  // a saddle strip that holds the tube to the slide
  out.push(C(G.prismOf(G.frameOf(W(0, 0, 0), f, r, z), rounded(0, GUN.c1 + 2.6, 4, 2.4, 0.6, 2), HOP.b0 + 2, HOP.b1 - 2, P), "gun-dark"));
  out.push(`<path class="hop-back" d="${G.disc(HOP.b0, HOP.b1, HOP.r, F, P).fill}"/>`);
  byDepth(MAG_AT.map((p, i) => ({ p, i })), (m) => m.p).forEach(({ p, i }) => out.push(`<g data-mag="${i}" class="mag">${candy(p, CR, COLOURS[i % COLOURS.length])}</g>`));
  out.push(k.solidSvg(G.disc(HOP.b0, HOP.b1, HOP.r, F, P), { tone: "hi", crease: "none", className: "clear" }));
  out.push(L(path([HOP.b0 + 0.6, HOP.b1 - 0.6].map((b) => at(G.pointOf(F, 0, 0, 0).map((q, j) => q + f[j] * b + scale3(unit(add(scale3(z, 1), scale3(r, -0.6 * NEAR))), HOP.r * 0.8)[j])))), { className: "shine" }));
  // end caps
  out.push(C(G.ringBand(HOP.b0 - 1.6, HOP.b0, HOP.r - 0.6, HOP.r + 0.6, F, P), "gun-dark"));
  out.push(C(G.ringBand(HOP.b1, HOP.b1 + 1.6, HOP.r - 0.6, HOP.r + 0.6, F, P), "gun-dark"));
  return out.join("");
}

function grip() {
  const out = [];
  out.push(C(G.prismOf(GRIP_F, rounded(0, 0, 10.4, 12, 3.4), 0, GRIP_LEN, P), "gun"));
  out.push(C(G.prismOf(GRIP_F, rounded(0, 0, 11, 12.6, 3.6), GRIP_LEN, GRIP_LEN + 2.4, P), "gun-dark"));
  // grip panel: a stippled pad on the near side, framed by a groove
  const side = NEAR * 5.26;
  const p = (s, v) => at(add(GRIP_O, add(add(scale3(GRIP_AXIS, s), scale3(GRIP_U, side)), scale3(GRIP_V, v))));
  out.push(L(path([p(5, -3.6), p(5, 3.6), p(19, 3.6), p(19, -3.6)], true), { tone: "lo" }));
  const stipple = [];
  for (let s = 6.6; s < 18; s += 1.6) for (let v = -2.4; v <= 2.5; v += 1.6) stipple.push(p(s, v + ((s * 10) % 2 ? 0.8 : 0)));
  out.push(D(stipple, { size: 0.32, tone: "lo" }));
  // grip texture: a stippled panel above the window
  return out.join("");
}

function guard() {
  // the trigger guard is a moulded loop: a tube from the frame front back to the grip
  const pts = [W(0, GUN.b0 + 17, GUN.c0 + 0.4), W(0, GUN.b0 + 17, GUN.c0 - 5.2), W(0, GUN.b0 + 13, GUN.c0 - 7.4), W(0, GUN.b0 + 7.4, GUN.c0 - 7.4), W(0, GUN.b0 + 5.4, GUN.c0 - 5.6)];
  const route = G.fillet(pts, 2.6, 7);
  return tubePieces(route, 1.1, P, { maxLength: 400 }).map((piece) => `<g class="cz c-gun">${tubeSvg(piece, { tone: "hi" })}</g>`).join("");
}

function trigger() {
  const F = G.frameOf(W(0, 0, 0), f, r, z);
  const blade = [[-0.8, 0], [0.8, 0], [0.9, -1.6], [0.3, -4.6], [-0.6, -5.2], [-0.9, -2]];
  const placed = blade.map(([y, c]) => [y, c]);
  // drawn as a thin prism across the gun, swept back when pulled
  const TF = G.frameOf(W(0, GUN.b0 + 12.6, GUN.c0), r, f, z);
  return C(G.prismOf(TF, placed, -1.2, 1.2, P), "gun-dark", { crease: "none" });
}

// ---------------------------------------------------------------- arms and paws
function arm(side) {
  // a plush sleeve: a capsule from the shoulder seam down to the paw
  const from = W(side * 17.5, 9, 46);
  const to = W(side * 8.2, GUN.b0 + 7, 37);
  const len = Math.hypot(...G.sub3(to, from));
  const F = G.frameAlong(from, G.sub3(to, from));
  const capsule = [[-6, 0.4, 1], [-5, 4.6, 1], [-2.6, 7.6, 1], [0, 8.8, 1], [len * 0.55, 8.2, 1], [len - 2, 7.4, 1], [len, 6.2]];
  return C(G.solidOf(capsule, F, P, { rims: "none" }), "fur", { crease: "none" });
}
function paw(side) {
  const c = W(side * 8.2, GUN.b0 + 7, 37);
  const out = [C(G.sphereOf(c, 8.2, P), "fur", { crease: "none" })];
  // three toe seams
  const F = G.frameOf(c, unit(W(0, 1, 0.15)), r, z);
  out.push(L([-2.6, 0, 2.6].map((x) => path(Array.from({ length: 6 }, (_, i) => at(G.pointOf(F, Math.sqrt(8.2 ** 2 - x * x - (i - 2.5) ** 2) + 0.1, 0, 0).map((q, j) => q + r[j] * x + z[j] * (i - 2.5) * 1.1))))).join(""), { tone: "faint", free: true }));
  return out.join("");
}

// ---------------------------------------------------------------- shots
const SPOTS = (() => {
  const list = [[0, 0]];
  for (let i = 0; i < 7; i++) list.push([9.2 * Math.cos((i / 7) * Math.PI * 2 + 0.3), 9.2 * Math.sin((i / 7) * Math.PI * 2 + 0.3)]);
  return list.map(([a, b], i) => ({ at: add(DISH, W(a, b, 1.4 + CR)), index: i }));
})();
function landed() {
  return byDepth(SPOTS, (s) => s.at)
    .map((s) => `<g data-spot="${s.index}" class="spot" style="opacity:0">${candy(s.at, CR, COLOURS[s.index % COLOURS.length])}</g>`)
    .join("");
}

// ---------------------------------------------------------------- assemble
const earsBack = byDepth(EARS, (e) => e.at);
const nearSide = NEAR;
const body_ = [
  base(),
  `<path class="iso-halo" d="${G.disc(0, 0.2, 30, zf(W(0, 4, 0.5)), P).fill}" style="opacity:.5"/>`,
  ...earsBack.slice(0, 2).map((e) => e.svg),
  body(),
  feet(),
  ...earsBack.slice(2, 3).map((e) => e.svg),
  head(),
  glasses(),
  ...byDepth(BAG_CANDIES, (c) => c.at).map((c) => candy(c.at, BAG_CR, c.colour)),
  bag(),
  knot(),
  ...earsBack.slice(3).map((e) => e.svg),
  arm(-nearSide),
  paw(-nearSide),
  grip(),
  `<g data-part="trigger">${trigger()}</g>`,
  guard(),
  slide(),
  hopper(),
  arm(nearSide),
  paw(nearSide),
  dish(),
  landed(),
  `<g data-part="shot" style="opacity:0">${candy(MUZZLE, CR, "red")}</g>`,
];

const CSS = `<style>
.iso{--k-fur:#d8d2c9;--k-grey:#7d736b;--k-pink:#c47c8c;--k-blush:#c46a7c;--k-blue:#4f8fd6;--k-lens:#16243a;--k-ink:#0d0d0f;--k-gun:#4e8bd1;--k-gun-dark:#3a6fb4;--k-knot:#3f86d6;--k-base:#2b2824;--k-yellow:#d6a91a;--k-orange:#d9741a;--k-red:#c9302c;--k-mint:#2fa57c;--k-sky:#2f86cc;--k-violet:#7c5fd6;--film:#8cc4f5;--film-a:.12;--window:#0e1622;--bore:#0a1424}
.iso[data-theme="light"]{--k-fur:#fbf8f3;--k-grey:#b8ada3;--k-pink:#f7b9c6;--k-blush:#f49aac;--k-blue:#8cc2f3;--k-lens:#24395c;--k-ink:#141418;--k-gun:#86bcf2;--k-gun-dark:#5d9be0;--k-knot:#6aabef;--k-base:#f1ebe0;--k-yellow:#ffd23f;--k-orange:#ff9a3c;--k-red:#e8423f;--k-mint:#5fd3a8;--k-sky:#5ab8ff;--k-violet:#a68cff;--film:#8fc6f7;--film-a:.2;--window:#dfeefa;--bore:#1d3150}
.c-fur{--c:var(--k-fur)}.c-grey{--c:var(--k-grey)}.c-pink{--c:var(--k-pink)}.c-blush{--c:var(--k-blush)}.c-blue{--c:var(--k-blue)}.c-lens{--c:var(--k-lens)}.c-ink{--c:var(--k-ink)}.c-gun{--c:var(--k-gun)}.c-gun-dark{--c:var(--k-gun-dark)}.c-knot{--c:var(--k-knot)}.c-base{--c:var(--k-base)}.c-yellow{--c:var(--k-yellow)}.c-orange{--c:var(--k-orange)}.c-red{--c:var(--k-red)}.c-mint{--c:var(--k-mint)}.c-sky{--c:var(--k-sky)}.c-violet{--c:var(--k-violet)}
.cz{--anatomy-paper:var(--c);--anatomy-face:var(--c);--anatomy-top:color-mix(in oklab,var(--c) 72%,white);--anatomy-shade-3:var(--c);--anatomy-shade-2:color-mix(in oklab,var(--c) 92%,black);--anatomy-shade-1:color-mix(in oklab,var(--c) 84%,black);--anatomy-shade-0:color-mix(in oklab,var(--c) 75%,black)}
.iso:not([data-theme="light"]) .cz{--anatomy-top:color-mix(in oklab,var(--c) 86%,white)}
.cz .tb-body{fill:var(--anatomy-shade-2)}.cz .tb-shine{fill:var(--anatomy-top)}.cz .tb-shade{fill:var(--anatomy-shade-0)}
.ink{fill:var(--c);stroke:none}
.c-blush.ink{opacity:.55}
.lens>.iso-fill,.lens>.iso-shade,.lens>.iso-top{opacity:.72}
.shine{stroke:#fff!important;opacity:.35;stroke-width:1.2}
.gloss{fill:#fff;opacity:.78}
.film>.iso-fill{fill:var(--film);opacity:calc(var(--film-a) * .55)}
.film>.iso-shade,.film>.iso-top{fill:var(--film);opacity:calc(var(--film-a) * .6)}
.film>.iso-shade[data-shade="0"]{opacity:calc(var(--film-a) * 1.5)}
.film>.iso-edge{stroke:color-mix(in oklab,var(--film) 70%,var(--anatomy-hi))}
.film.flap>.iso-fill{opacity:calc(var(--film-a) * 1.3)}
.fold{stroke:var(--film)!important;opacity:.55}
.fold.hi{stroke:#fff!important;opacity:.4}
.fold-hem{stroke:var(--film)!important}
.film-glint{fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;opacity:.5}
.window{fill:var(--window);stroke:none}
.mag{transition:opacity .25s}
.hop-back{fill:var(--window)}
.clear>.iso-fill{fill:none}.clear>.iso-shade,.clear>.iso-top{fill:var(--film);opacity:calc(var(--film-a) * .8)}
.bore{fill:var(--bore)}
</style>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A plush bunny candy toy on a round base. A clear blue film bag full of candy is tied over its head with a knot that fans up like a second pair of ears; it wears blue sunglasses and holds a blue toy pistol that dispenses candy. Pulling the trigger fires one candy from the barrel into a yellow dish in front, and a clear magazine on top of the gun shows how many are left.",
  body: body_,
});

const live = `
const P = ${JSON.stringify(P)};
const MAG = ${MAG};
const MUZZLE = ${JSON.stringify(MUZZLE)};
const SPOTS = ${JSON.stringify(SPOTS.map((s) => s.at))};
const COLOURS = ${JSON.stringify(COLOURS)};
const BACK = ${JSON.stringify(scale3(f, -2.2))};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const shot = svg.querySelector('[data-part="shot"]');
const shotBall = shot.querySelector(".cz");
const trig = svg.querySelector('[data-part="trigger"]');
const mags = [...svg.querySelectorAll("[data-mag]")].sort((a, b) => a.dataset.mag - b.dataset.mag);
const spots = [...svg.querySelectorAll("[data-spot]")].sort((a, b) => a.dataset.spot - b.dataset.spot);
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let left = MAG, fired = 0, flight = null, pull = 0, frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function say() {
  const text = left === 0 && !flight ? "magazine empty · click to reload" : "magazine " + left + " / " + MAG + " · " + fired + " in the dish";
  if (readout.textContent !== text) readout.textContent = text;
}
function fire() {
  if (flight) return;
  if (left === 0) { // reload: tip the dish back into the magazine
    left = MAG; fired = 0;
    spots.forEach((s) => (s.style.opacity = 0));
    mags.forEach((m) => (m.style.opacity = 1));
    say(); return;
  }
  const n = MAG - left;
  left -= 1;
  mags[MAG - 1 - n].style.opacity = 0;
  shotBall.setAttribute("class", "iso-solid cz c-" + COLOURS[n % COLOURS.length]);
  flight = { t: 0, n, to: SPOTS[n] };
  pull = 1;
  say();
}
function place(t) {
  // straight out of the barrel, then dropping under gravity into the dish
  const p = lerp(MUZZLE, flight.to, t);
  p[2] = MUZZLE[2] + (flight.to[2] - MUZZLE[2]) * t * t + 7 * t * (1 - t);
  shot.setAttribute("transform", translateAlong(P, [p[0] - MUZZLE[0], p[1] - MUZZLE[1], p[2] - MUZZLE[2]]));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; if (clock > 1.6) { clock = 0; fire(); } }
  if (flight) {
    flight.t += dt / (still.matches ? 0.001 : 0.62);
    shot.style.opacity = 1;
    if (flight.t >= 1) { spots[flight.n].style.opacity = 1; shot.style.opacity = 0; fired += 1; flight = null; say(); }
    else place(flight.t);
  }
  pull = Math.max(0, pull - dt / 0.28);
  const e = pull * pull;
  trig.setAttribute("transform", translateAlong(P, BACK.map((v) => v * e)));
  const busy = touring || flight || pull > 0;
  frame = visible && busy ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 5000); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("click", () => { hold(); fire(); run(); });
stage.addEventListener("keydown", (event) => {
  if (event.key !== " " && event.key !== "Enter") return;
  event.preventDefault(); hold(); fire(); run();
});
say();
`;

const page = k.plateHtml({
  fig: "Fig 2",
  title: "Bunny candy blaster",
  hint: "Click to pull the trigger",
  readout: `magazine ${MAG} / ${MAG} · 0 in the dish`,
  keys: [
    { mark: "raised", label: "Plush bunny shell with sunglasses" },
    { mark: "flat", label: `Film bag tied over the head: ${BAG_CANDIES.length} candies` },
    { mark: "edge", label: `Pistol dispenser: a clear ${MAG}-candy magazine on the slide` },
  ],
  caption:
    "A plush bunny candy toy. The blue film bag tied over its head carries a hat of candy; the pistol in its paws is the dispenser. Each pull of the trigger sends one candy out of the barrel into the dish, and the magazine on the slide holds one fewer.",
  body: `${CSS}<div class="iso-stage" tabindex="0" role="button" aria-label="Bunny candy blaster: press Space or click to fire a candy">${svg}</div>`,
});

const name = theme === "light" ? "candy-bunny-light.html" : "candy-bunny.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Bunny candy blaster", theme, body: page, script: kitScript() + live, width: 620 }));
console.log("wrote", name, "·", BAG_CANDIES.length, "bag candies · near side", NEAR);
