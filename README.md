# Maison Orvelle

*Eight tops on marble plinths, turning slowly under a brass arch.*

Maison Orvelle is a small 3D boutique for women's tops. There are no product
photos here: every piece is a real 3D model that turns live in WebGL. The home
page stands the collection on a ring of plinths, the shop gives each piece its
own little turntable, and on a product page you can drag a piece around and
change its colourway, which re-dyes the fabric itself. Your bag is kept in
`localStorage`.

It is front-end only. The catalogue is static data, so there is no backend, no
keys and no database. All pieces and prices are fictional.

## Run

You will need Node.js 20 or newer and a browser with WebGL 2.

```bash
npm install
npm run dev
```

Then open http://localhost:3000 and let the ring turn.