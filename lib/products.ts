export type CollectionId = "soiree" | "riviera";
export type Fabric = "silk" | "cotton" | "jersey" | "wool" | "brocade" | "leather";
export type ColourFamily = "black" | "neutral" | "pink" | "red" | "blue" | "green" | "purple" | "yellow";

/** A colourway. The first one on each product is the piece as photographed (its original texture). */
export type Colour = { id: string; name: string; hex: string; family: ColourFamily };

/** A fabric note pinned to the garment. x and y are fractions of the piece's height from its centre (front view). */
export type Hotspot = { x: number; y: number; title: string; note: string };

export type Product = {
  slug: string;
  name: string;
  /** Fabric + colour line under the name */
  material: string;
  price: number;
  collection: CollectionId;
  /** Soft backdrop tint used behind the piece */
  tint: string;
  blurb: string;
  details: string[];
  fabric: Fabric;
  colours: Colour[];
  /** Keep grey/silver parts of the texture (hardware, lace) out of the recolour. */
  protectNeutrals?: boolean;
  hotspots: Hotspot[];
  /** Corsetry is fitted to the waist; everything else to the bust. */
  fit?: "waist";
  /** Original 3D model, licensed CC BY 4.0 */
  credit: { title: string; author: string; uid: string };
};

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const FABRICS: Record<Fabric, string> = {
  silk: "Silk",
  cotton: "Cotton",
  jersey: "Jersey",
  wool: "Wool tweed",
  brocade: "Brocade",
  leather: "Leather",
};

export const COLOUR_FAMILIES: Record<ColourFamily, { label: string; hex: string }> = {
  black: { label: "Black", hex: "#1d1b1a" },
  neutral: { label: "Neutral", hex: "#e3d9c8" },
  pink: { label: "Pink", hex: "#e2a9ad" },
  red: { label: "Red", hex: "#9e2430" },
  blue: { label: "Blue", hex: "#4a64a0" },
  green: { label: "Green", hex: "#3f7a60" },
  purple: { label: "Lilac", hex: "#b9a3d4" },
  yellow: { label: "Butter", hex: "#e8d58e" },
};

export const COLLECTIONS: { id: CollectionId; title: string; season: string; note: string }[] = [
  { id: "soiree", title: "Soirée", season: "Evening", note: "Structure, shine and deep colour for after dark." },
  {
    id: "riviera",
    title: "Riviera",
    season: "Colour",
    note: "Saturated colour, rich print and shine, made for summer nights.",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "tweed-belted-jacket",
    name: "Tweed Belted Jacket",
    material: "Wool tweed · Taupe",
    price: 1650,
    collection: "soiree",
    tint: "#ece4da",
    blurb: "A stand-collar jacket in herringbone wool tweed, cinched with a wide leather belt.",
    details: ["Wool tweed, satin lining", "Stand collar", "Detachable leather belt", "Dry clean only"],
    fabric: "wool",
    colours: [
      { id: "taupe", name: "Taupe", hex: "#b7a48f", family: "neutral" },
      { id: "ecru", name: "Ecru", hex: "#e3d9c6", family: "neutral" },
      { id: "charcoal", name: "Charcoal", hex: "#363433", family: "black" },
    ],
    hotspots: [
      { x: 0, y: 0.36, title: "Stand collar", note: "Interlined so it stands without wilting." },
      { x: 0.1, y: 0.1, title: "Herringbone tweed", note: "Woven in Scotland from a lambswool blend." },
      { x: 0, y: -0.08, title: "Leather belt", note: "Vegetable-tanned calf. Detaches for a straighter line." },
    ],
    credit: {
      title: "Women's woolen jacket and leather belt",
      author: "aymanalkady",
      uid: "cbd406d01c8d45a3ab2bc66855f8c955",
    },
  },
  {
    slug: "rouge-wrap-top",
    name: "Rouge Wrap Top",
    material: "Silk charmeuse · Crimson",
    price: 780,
    collection: "soiree",
    tint: "#efdcdc",
    blurb: "Crimson charmeuse folded into a high wrap collar and tied at the waist with a soft sash.",
    details: ["100% silk charmeuse", "Wrap front with tie sash", "Cap shoulders", "Dry clean only"],
    fabric: "silk",
    colours: [
      { id: "crimson", name: "Crimson", hex: "#a3222b", family: "red" },
      { id: "emerald", name: "Emerald", hex: "#1f6b52", family: "green" },
      { id: "midnight", name: "Midnight", hex: "#202b4b", family: "blue" },
      { id: "champagne", name: "Champagne", hex: "#e1c89f", family: "neutral" },
    ],
    hotspots: [
      { x: 0, y: 0.3, title: "Wrap collar", note: "Two layers of charmeuse folded high at the throat." },
      { x: 0.05, y: -0.1, title: "Tie sash", note: "Ties at the side or the back. An inner button holds the wrap." },
    ],
    credit: { title: "Women Top with belt", author: "LIU_CG", uid: "9b0d33a10d8345e682d2e642703210f7" },
  },
  {
    slug: "midnight-brocade-corset",
    name: "Midnight Brocade Corset",
    material: "Jacquard brocade · Navy",
    price: 1250,
    collection: "soiree",
    tint: "#e1e2ea",
    blurb: "A boned corset in navy brocade with silver hardware and buckled front straps.",
    details: ["Woven jacquard brocade", "Spiral steel boning", "Buckle straps and front busk", "Specialist clean"],
    fabric: "brocade",
    colours: [
      { id: "navy", name: "Navy", hex: "#2b3561", family: "blue" },
      { id: "bordeaux", name: "Bordeaux", hex: "#5e1b27", family: "red" },
      { id: "emerald", name: "Emerald", hex: "#1f5a45", family: "green" },
      { id: "black", name: "Black", hex: "#1e1c21", family: "black" },
    ],
    protectNeutrals: true,
    fit: "waist",
    hotspots: [
      { x: 0, y: 0.22, title: "Jacquard brocade", note: "A tonal floral woven into the cloth, not printed on it." },
      { x: 0.08, y: -0.05, title: "Buckled straps", note: "Silver-tone hardware, cast and polished by hand." },
      { x: -0.06, y: -0.3, title: "Spiral boning", note: "Twelve steel bones that bend with you." },
    ],
    credit: { title: "Medieval Corset 001", author: "MarbleBallStudio", uid: "7c8c94ed8c324cb6a7dfe6ce9fc084ca" },
  },
  {
    slug: "noir-leather-bustier",
    name: "Noir Leather Bustier",
    material: "Patent leather · Black",
    price: 1480,
    collection: "soiree",
    tint: "#e6e2dd",
    blurb: "High-shine patent leather, studded and laced through the front. Made for the last hours of the night.",
    details: ["Patent lambskin", "Front lacing with metal eyelets", "Fully lined", "Specialist leather clean"],
    fabric: "leather",
    colours: [
      { id: "black", name: "Black", hex: "#161414", family: "black" },
      { id: "oxblood", name: "Oxblood", hex: "#4f151a", family: "red" },
      { id: "bottle", name: "Bottle green", hex: "#1c3a2d", family: "green" },
    ],
    fit: "waist",
    hotspots: [
      { x: 0, y: 0.2, title: "Patent lambskin", note: "Mirror-finish leather, soft enough to sit in all evening." },
      { x: 0, y: -0.1, title: "Front lacing", note: "Laced through metal eyelets. Adjusts by a full size." },
    ],
    credit: { title: "Leather Suit With Straps", author: "BarbatosStudios", uid: "17ecd53718774ca287fb3a56b6d4ed5c" },
  },
  {
    slug: "scarlet-moto-jacket",
    name: "Scarlet Moto Jacket",
    material: "Nappa leather · Scarlet",
    price: 1390,
    collection: "riviera",
    tint: "#f0dcd8",
    blurb: "A cropped biker jacket in glossy scarlet nappa, with an asymmetric zip and a snapped collar.",
    details: [
      "Lambskin nappa, silk lining",
      "Asymmetric front zip",
      "Snap collar and zipped cuffs",
      "Specialist leather clean",
    ],
    fabric: "leather",
    colours: [
      { id: "scarlet", name: "Scarlet", hex: "#8e1f24", family: "red" },
      { id: "cobalt", name: "Cobalt", hex: "#2e4a9a", family: "blue" },
      { id: "emerald", name: "Emerald", hex: "#1f6b52", family: "green" },
      { id: "black", name: "Black", hex: "#1a1818", family: "black" },
    ],
    protectNeutrals: true,
    hotspots: [
      { x: 0.03, y: 0.2, title: "Snap collar", note: "Wide lapels held flat with polished snaps." },
      { x: 0.08, y: -0.05, title: "Nappa leather", note: "Soft, glossy lambskin that shapes to you with wear." },
      { x: -0.06, y: -0.3, title: "Belted hem", note: "A short buckled band sits right on the waist." },
    ],
    credit: { title: "Women's cropped Leather Jacket", author: "srgallimore", uid: "cbea02f813454fdb88ddf695dad0ba95" },
  },
  {
    slug: "patchwork-bomber",
    name: "Patchwork Bomber",
    material: "Pieced cotton · Multicolour",
    price: 1890,
    collection: "riviera",
    tint: "#f1e6d8",
    blurb:
      "Hundreds of narrow strips of printed cotton, pieced by hand into a full, gathered jacket with balloon sleeves.",
    details: ["Hand-pieced cotton patchwork", "Gathered yoke", "Balloon sleeves with banded cuffs", "Dry clean only"],
    fabric: "cotton",
    colours: [{ id: "carnival", name: "Carnival", hex: "#c8503c", family: "red" }],
    hotspots: [
      { x: 0, y: 0.36, title: "Gathered yoke", note: "Hand-gathered so the body falls full from the shoulders." },
      {
        x: 0.08,
        y: 0,
        title: "Hand-pieced patchwork",
        note: "Each band is sewn strip by strip. No two jackets match.",
      },
      { x: -0.42, y: -0.15, title: "Balloon sleeves", note: "Cut full and gathered into a narrow cuff." },
    ],
    credit: { title: "Seminole Patchwork Shirt", author: "katiewolfe", uid: "113c0c3948e64ac181285059369816c9" },
  },
  {
    slug: "fuchsia-puff-top",
    name: "Fuchsia Puff Top",
    material: "Silk taffeta · Fuchsia",
    price: 720,
    collection: "riviera",
    tint: "#f3dde6",
    blurb: "A fitted taffeta top with a square neckline and sculpted puff sleeves gathered at the elbow.",
    details: ["100% silk taffeta", "Square neckline", "Structured puff sleeves", "Dry clean only"],
    fabric: "silk",
    colours: [
      { id: "fuchsia", name: "Fuchsia", hex: "#b8235f", family: "pink" },
      { id: "marigold", name: "Marigold", hex: "#e0a12a", family: "yellow" },
      { id: "emerald", name: "Emerald", hex: "#1f6b52", family: "green" },
      { id: "lilac", name: "Lilac", hex: "#b9a3d4", family: "purple" },
    ],
    hotspots: [
      { x: 0, y: 0.22, title: "Square neckline", note: "Faced and boned at the corners so it holds its line." },
      { x: 0.62, y: 0.08, title: "Puff sleeves", note: "Lined with organza to keep their shape all night." },
      { x: 0.04, y: -0.25, title: "Silk taffeta", note: "Crisp, with a soft rustle and a high sheen." },
    ],
    credit: { title: "top and shorts", author: "ZahraAmini", uid: "601380b7fde84bd09748383a38199106" },
  },
  {
    slug: "azure-silk-blouse",
    name: "Azure Silk Blouse",
    material: "Printed silk crêpe · Azure",
    price: 640,
    collection: "riviera",
    tint: "#dfe9f3",
    blurb: "A long-line blouse in silk crêpe, hand-painted with a white baroque scroll across the yoke.",
    details: ["100% silk crêpe de chine", "Hand-painted yoke", "Long sleeves", "Dry clean only"],
    fabric: "silk",
    colours: [
      { id: "azure", name: "Azure", hex: "#4a90d9", family: "blue" },
      { id: "jade", name: "Jade", hex: "#3f8f75", family: "green" },
      { id: "coral", name: "Coral", hex: "#e0705a", family: "red" },
      { id: "violet", name: "Violet", hex: "#7c5bb5", family: "purple" },
    ],
    protectNeutrals: true,
    hotspots: [
      { x: 0, y: 0.3, title: "Painted yoke", note: "A baroque scroll painted by hand onto the silk." },
      { x: 0.06, y: -0.15, title: "Silk crêpe de chine", note: "Matte, fluid and light. Moves with every step." },
    ],
    credit: { title: "WOMEN BLOUSE SHIRT", author: "eeelabvisual", uid: "f33be76e670f4b99893f586245a49456" },
  },
];

export const modelPath = (slug: string) => `/models/tops/${slug}.glb`;
export const posterPath = (slug: string) => `/images/tops/${slug}.webp`;
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsIn = (c: CollectionId) => PRODUCTS.filter((p) => p.collection === c);
export const getColour = (p: Product, id?: string | null) => p.colours.find((c) => c.id === id) ?? p.colours[0];
export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
