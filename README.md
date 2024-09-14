# Maison Orvelle

*A salon of turning silk and tweed, lit like a studio shoot.*

![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=nextdotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?logo=threedotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9_+_drei_10-1b1714)
![Backend](https://img.shields.io/badge/backend-none_needed-a8875a)

Maison Orvelle is a 3D boutique for women's tops. Every piece turns live in
WebGL, on a ring of plinths in a Parisian salon and on its own product stage,
with colourways, fabric notes, a bag and a demo checkout.

## The experience

You arrive in an atelier. The current collection stands on a ring of stone
plinths with brass rods, on a polished marble floor in front of a panelled
salon wall, beneath a brass arch. The front piece turns slowly on its own.
Every few seconds the ring eases round to bring the next piece forward, and
after the last one the atelier moves on to the other collection.

A warm light follows your mouse through the room, so satin and marble catch
the glow. Click a piece to bring it forward; click it again and the camera
glides up to it before an ivory veil falls and its page opens. On a phone,
swipe left and right, and one piece fills the arch.

Nothing here is a photograph. Each top is a real 3D model lit like a studio
shoot, and the salon itself, down to the gilded cornice and the veined marble,
is drawn in Three.js. The palette is five quiet tokens, ivory `#f4efe8`, stone
`#e7e0d6`, ink `#1b1714`, muted `#7a6f64` and gold `#a8875a`, set in Cormorant
for titles and Jost for text. Reduced motion stops the autoplay and the camera
glide.

A short visit, if you like: let the ring turn once, switch to **Riviera** with
the button under the collection title, open a piece, drag it round, tap a gold
dot, try another colourway and a size, then add it to the bag and walk through
the checkout. Nothing is charged and nothing is sent.

## Collections & shop

Eight tops in two collections:

| Collection | Mood | Fabrics |
| --- | --- | --- |
| **Soirée** | Evening | Tweed, satin, brocade, patent leather |
| **Riviera** | Colour | Nappa leather, patchwork, taffeta, painted silk |

**The shop.** Every card is a small turntable against its own tint, turning
faster when you hover it. Search ignores accents, so "soiree" finds Soirée,
and matches names, fabrics, colourways and details. Filters cover collection,
fabric, colour family and price band, and only offer options that match at
least one piece. Each card has a saved-piece heart and a quick add to bag.

**The product page.** The piece gets the whole page, with a floating purchase
panel beside it. Drag to turn it. Gold dots sit on the garment itself; tap
one, or its chip below, for a fabric note, and the piece turns to face you.
Colourways re-dye the real fabric texture, so weave, print and shine stay
intact. A size guide opens a measurement chart, with the waist column
highlighted for corsetry, and "Complete the look" suggests pieces from the
same collection.

**Bag, saved pieces and checkout.** The bag slides in from the right over a
blurred page, keeps one line per piece, size and colourway, and survives
reloads. Saved pieces have their own page. The checkout has contact and
shipping fields, an order summary with shipping and estimated tax, and a clear
notice that it is a demo. No payment details are asked for and no order is
sent anywhere.

**And the small things.** An Info page holds shipping, returns, privacy and
the 3D model credits. Quiet ambient sound fades in on your first interaction,
with a mute toggle that is remembered. Pages change under an ivory veil, a
loading skeleton waits while models arrive, and even the 404 is dressed for
the occasion.

All products and prices are fictional and in USD.

## Under the hood

- **One canvas, many views.** A single fixed WebGL canvas lives in the root
  layout; pages place drei `<View>`s into it, so eight shop cards share one
  context.
- **Colourways in a shader.** `makeRecolorable` keeps each pixel's brightness
  and swaps its hue, normalised by the cloth's average brightness. Silver
  buckles, lace and metal parts are left undyed.
- **Per-instance materials.** The same piece can be dyed on its page and keep
  its own colour on the ring and in the bag.
- **A ring that takes the short way.** `easing.dampAngle` from maath eases
  every turn.
- **Hotspots pinned to the cloth.** A ray finds the garment's surface at load,
  so each gold dot sits just proud of the fabric.
- **A marble floor with no image.** Painted on a canvas at run time with a
  seeded generator.
- **Light models.** Eight Draco-compressed glTF garments in about 3 MB, with a
  self-hosted decoder.
- **Patient autoplay.** It pauses on hover and in hidden tabs, and waits
  longer after a manual choice.
- **Loading without a spinner.** A small store counts suspended views, and the
  page keeps its skeleton until every model and texture is ready.
- **No backend.** The catalogue is typed static data in `lib/products.ts`; the
  bag and saved pieces live in `localStorage`.

The ring itself is one line of easing, run every frame:

```ts
// components/three/AtelierScene.tsx
useFrame((_, delta) => {
  if (ring.current) easing.dampAngle(ring.current.rotation, "y", -(active / count) * Math.PI * 2, 0.45, delta);
  // ...then the camera eases to its resting place, or glides up to the chosen piece
});
```

Built with Next.js 15.5, React 19.1, TypeScript 5, Three.js 0.180, React Three
Fiber 9, drei 10, GSAP 3.13 and Tailwind CSS 4.

## Run locally

You will need Node.js 20 or newer and a browser with WebGL 2.

```bash
git clone <repository-url> maison-orvelle
cd maison-orvelle
npm install
npm run dev
```

Then open http://localhost:3000. No environment variables, keys or database
are needed.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

Where the pieces live:

```text
app/
  page.tsx                 the atelier
  shop/ · product/[slug]/ · wishlist/ · checkout/ · info/
components/
  three/AtelierScene.tsx   salon wall, arch, marble floor and the ring
  three/ProductStage.tsx   product stage with hotspots
  three/CardStage.tsx      small turntable for shop cards
  three/Studio.tsx         TopModel, studio lights, recolour shader
  ViewCanvas.tsx           the single shared WebGL canvas
lib/
  products.ts              pieces, colourways, hotspots, credits
  cart.tsx · wishlist.tsx  bag and saved pieces
public/models/tops/        eight Draco-compressed glTF garments
```

Models, the Draco decoder, fonts and audio are all served from `public/`, so
it deploys to Vercel or any Node host with no external CDN.

## Credits

The garments are based on 3D models shared under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each model's title
and author are listed on the Info page and in `lib/products.ts`; the models
were compressed for the web and renamed for this store.
