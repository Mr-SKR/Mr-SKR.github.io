# sureshreddy.com

Source for my personal site, served from GitHub Pages at
**[sureshreddy.com](https://sureshreddy.com)**.

| Page | What it is |
| --- | --- |
| [`/`](https://sureshreddy.com) | Portfolio and e-resume |
| [`/tools.html`](https://sureshreddy.com/tools.html) | Browser-based developer tools (JSON, JWT, Base64, URL, YAML) |
| [`/games.html`](https://sureshreddy.com/games.html) | Peer-to-peer Tic-Tac-Toe over WebRTC |

Static HTML, CSS and vanilla JS with no build step: clone it and open
`index.html`, or serve the directory over HTTP to exercise the service worker.

```sh
python3 -m http.server 8000
```

Everything the tools page does runs locally in the browser; nothing is uploaded.
