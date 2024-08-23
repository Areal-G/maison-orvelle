# Maison Orvelle

*A salon of turning silk and tweed, lit like a studio shoot.*

Maison Orvelle is a 3D boutique for women's tops. It sells eight pieces in two
collections, Soirée and Riviera, and every one of them is a real 3D model
rendered live in WebGL rather than a photograph. What follows is mostly a walk
through how that rendering works, because that is where most of the work went.

## Rendering notes

Everything starts with a single canvas. The root layout mounts one fixed
`<Canvas>` from React Three Fiber, and each page places drei `<View>`s that
render into it inside their own rectangles. This matters more than it sounds:
the shop shows all eight pieces at once, each on its own small turntable
against its own tint, and with one canvas per card the browser would have to
open eight WebGL contexts. With views, the eight cards share one. A small
`ClearEachFrame` pass wipes the canvas before the views draw, so nothing
smears behind when you scroll the shop, where pieces also turn faster when you
hover them and every card carries a saved-piece heart and a quick add to bag.

```tsx
<Canvas
  style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
>
  <ClearEachFrame />
  <AssetsPreload />
  <Suspense fallback={<SuspenseSignal />}>
    <View.Port />
  </Suspense>
</Canvas>
```

The models themselves are glTF files with Draco compression, eight garments in
about 3 MB, decoded by a self-hosted decoder so nothing depends on a
third-party CDN. The garments are based on 3D models shared under CC BY 4.0;
each model's title and author are listed on the Info page and in
`lib/products.ts`, and the models were compressed for the web and renamed for
the store. Loading is handled by a tiny external store that counts suspended
views through a `SuspenseSignal` inside the canvas, and the page shows a
skeleton until every model and texture is ready, rather than dropping a
spinner on top of a half-built scene.

The home page is the atelier, and it is built entirely in Three.js. There is a
plaster wall with panel mouldings, pilasters, a dado rail and a gilded
cornice, a brass arch, and stone plinths with gold rings standing on a
polished marble floor. The marble is not an image: `marbleTexture()` paints
cloudy ground, soft and sharp veins and tile joints onto a canvas with a
seeded random generator, so the floor looks the same on every visit and costs
no download at all. Lighting comes from a shared room environment map,
generated locally with no HDR download, plus a warm key light, with contact
shadows under each stand. A warm light also follows the mouse through the
room, so satin and marble catch the glow.

The collection stands on a ring of four plinths. The ring eases to `-(active /
count) · 2π` with `easing.dampAngle`, which means it always takes the short
way round, and only the front piece turns on its own turntable while the
others ease back to face forward. Autoplay moves the ring every 5.5 seconds
and moves on to the next collection after the last piece. It waits longer
after a manual choice, pauses while a piece is hovered or the tab is hidden,
and is switched off entirely with reduced motion. There are previous and next
buttons, a progress dash that fills while a piece waits its turn, swipe on
touch screens, and a custom cursor ring that reads "Select" or "View" over the
pieces. Clicking a piece brings it forward; clicking again glides the camera
up to it before an ivory veil falls and the product page loads.

The product page gives each piece a full stage with drag to turn, using
PresentationControls. Fabric notes are gold dots on the garment itself. They
are stored as fractions of the piece's height, and at load `ProductStage`
casts a ray at the front of the garment and keeps the first surface it hits,
so each dot sits just proud of the cloth whatever shape the model is. Tapping
a dot, or its chip below the piece for keyboard and touch, opens the note,
turns the piece with `dampAngle` until that dot faces the camera, and moves
the camera in. There is also size selection with a nudge if you forget, a size
guide with the waist column highlighted for corsetry, a details list and a
"Complete the look" row from the same collection.

Colourways are the part I am fondest of. `makeRecolorable` patches each
garment material's fragment shader through `onBeforeCompile`. It keeps every
pixel's brightness, swaps its hue for the chosen colour and normalises by the
cloth's average brightness, measured once from a 24×24 downsample, so a pale
tweed and a dark brocade both dye to a true colour while weave, print and
shine stay intact. With `protectNeutrals`, low-saturation pixels such as
silver buckles and lace keep their original colour, and solid metal parts are
detected and never dyed at all. `TopModel` clones each model's materials per
instance, so the same piece can be dyed coral on its product page while it
keeps its own colour in the bag thumbnail and on the ring.

Around all of this sit the ordinary parts of a shop. Search ignores accents,
so "soiree" finds Soirée, and matches names, fabrics, colourways and details;
filters cover collection, fabric, colour family and price band and only show
options that match at least one piece, with sorting by price and an empty
state that clears the filters. The bag slides in from the right over a blurred
page and keeps one line per piece, size and colourway; saved pieces have their
own page; both live in `localStorage` as `orvelle-bag` and `orvelle-saved`.
The demo checkout has contact and shipping fields, an order summary with
shipping and estimated tax, and says plainly that it is a demo. There is also
an Info page for shipping, returns, privacy and model credits, quiet ambient
sound with a remembered mute toggle, and a custom 404.

On phones the camera pulls back so one piece fills the arch, the controls
stack underneath and swiping turns the ring. The palette is five tokens, ivory
`#f4efe8`, stone `#e7e0d6`, ink `#1b1714`, muted `#7a6f64` and gold `#a8875a`,
with Cormorant for display titles and Jost for body text. There is no dark
mode.

The stack is Next.js 15.5 with Turbopack, React 19.1, TypeScript 5, Three.js
0.180, React Three Fiber 9, drei 10, maath, GSAP 3.13 and Tailwind CSS 4.

## Run

You will need Node.js 20 or newer and a browser with WebGL 2.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. `npm run build` and `npm start` for
production, `npm run lint` for ESLint. No environment variables, keys or
database are needed.