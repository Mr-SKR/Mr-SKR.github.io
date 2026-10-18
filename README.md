# sureshreddy.com

Source for my personal site, served from GitHub Pages at
**[sureshreddy.com](https://sureshreddy.com)**.

| Page | What it is |
| --- | --- |
| [`/`](https://sureshreddy.com) | Portfolio and e-resume |
| [`/tools.html`](https://sureshreddy.com/tools.html) | Browser-based developer tools (JSON, JWT, Base64, URL, YAML) |
| [`/games.html`](https://sureshreddy.com/games.html) | Peer-to-peer Tic-Tac-Toe over WebRTC |
| [`/trip/`](https://sureshreddy.com/trip/) | Annapurna Base Camp trek planner (React app, see below) |

Static HTML, CSS and vanilla JS with no build step: clone it and open
`index.html`, or serve the directory over HTTP to exercise the service worker.

```sh
python3 -m http.server 8000
```

Everything the tools page does runs locally in the browser; nothing is uploaded.

### The trip app (`/trip/`)

`/trip/` is a separate React + Vite app with its own service worker, scoped to
`/trip/`, so none of it loads or caches on the other pages. Source lives in
`trip-app/`; the built files are committed to `trip/` so Pages can serve them
without a build step.

```sh
cd trip-app
npm ci
npm test         # plan totals, presets, share links, reroutes
npm run build    # typechecks, then writes ../trip/
```

The plan itself (places, days, prices, presets) is in `trip-app/src/data.ts`.
Rebuild and commit `trip/` after changing anything in `trip-app/`.
