# InternLog

Browser-based **OJT hours tracker** (single-page app). Data stays in your browser (`localStorage`). It can be installed as a PWA when served over **http://** or **https://**.

## Requirements

- A modern browser (Chrome, Edge, Firefox, Safari).
- **Internet** on first load (fonts, QR library, optional OCR use Tesseract from a CDN).
- For the **service worker** and installable PWA behavior, open the app from a **local web server**, not as a `file://` URL.

## Run locally (recommended)

From this folder in a terminal:

**Node.js** (if installed):

```bash
npx --yes serve .
```

Then open the URL it prints (usually `http://localhost:3000`).

**Python 3**:

```bash
python -m http.server 8080
```

Then open [http://localhost:8080/](http://localhost:8080/).

**PowerShell with minimal .NET** (Windows):

```powershell
Start-Process "http://localhost:8080/"
python -m http.server 8080
```

(If `python` is not on your PATH, use the Node option or install Python.)

Point the browser at the server root so `index.html` loads as `/` or `/index.html`, and `sw.js` is available at `/sw.js`.

## Quick open (limited)

Double-click **`index.html`** or drag it into a browser. The UI works for basic use, but **service worker registration** may fail on `file://`, so offline caching and some PWA features might not apply.

## Project files

| File        | Role                                      |
| ----------- | ----------------------------------------- |
| `index.html` | App UI, logic, inline manifest            |
| `sw.js`     | Service worker (cache + share target)     |

No `npm install` or build step is required.
