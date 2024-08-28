import * as THREE from "three";

/** Small seeded RNG so the marble looks the same on every visit. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let marble: THREE.CanvasTexture | null = null;

/**
 * Polished marble, painted once on a canvas: warm cloudy ground, soft and sharp veins,
 * and fine joints between four tiles. Repeats seamlessly enough at floor scale.
 */
export function marbleTexture() {
  if (marble) return marble;
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = rng(7);

  ctx.fillStyle = "#ece6dd";
  ctx.fillRect(0, 0, size, size);

  // Cloudy ground.
  for (let i = 0; i < 70; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 60 + r() * 260;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const light = r() > 0.5;
    g.addColorStop(0, light ? "rgba(255,252,246,0.35)" : "rgba(196,184,168,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Veins: a blurred halo under a fine line.
  const vein = (width: number, alpha: number, blur: number) => {
    let x = r() * size;
    let y = r() * size;
    const angle = r() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 9; s++) {
      const step = 60 + r() * 90;
      const a = angle + (r() - 0.5) * 1.1;
      const nx = x + Math.cos(a) * step;
      const ny = y + Math.sin(a) * step;
      ctx.quadraticCurveTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 80, nx, ny);
      x = nx;
      y = ny;
    }
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.strokeStyle = `rgba(122,106,90,${alpha})`;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) vein(7 + r() * 8, 0.09, 6);
  for (let i = 0; i < 16; i++) vein(0.7 + r() * 1.6, 0.32 + r() * 0.2, 0);
  ctx.filter = "none";

  // Tile joints (2 × 2 tiles per texture).
  ctx.strokeStyle = "rgba(96,82,68,0.38)";
  ctx.lineWidth = 2;
  for (const p of [1, size / 2]) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  marble = new THREE.CanvasTexture(canvas);
  marble.colorSpace = THREE.SRGBColorSpace;
  marble.wrapS = marble.wrapT = THREE.RepeatWrapping;
  marble.anisotropy = 8;
  return marble;
}
