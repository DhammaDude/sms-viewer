# WJC & Co. Orrery Chronometer

An astronomically accurate orrery for all nine planets (Mercury–Pluto), styled as
an antique brass/steel pocket watch. Runs entirely client-side in a single HTML
file — no build step, no server.

**Live app:** `orrery.html` ([GitHub Pages](https://dhammadude.github.io/sms-viewer/orrery.html) once enabled)

## Features

- Real Keplerian orbital mechanics (Standish/JPL approximate elements) for all
  9 planets, with an adjustable simulation date and playback speed.
- Complications mounted on an integrated shield plate: Moon Phase, Day-Date,
  and Metonic Cycle (19-year lunar/solar calendar sync).
- An outer analog clock ring (hour/minute/second hands) tracking real local time.
- Solar and lunar eclipse prediction, with quick-jump buttons to the next
  new moon, full moon, solar eclipse, lunar eclipse, or a selected planet's
  retrograde window.
- Brass/steel theme toggle, compact (dial-only) view, and JSON export/import
  for snapshot or date-range data analysis.
- Installable as a PWA (offline-capable via a service worker) on desktop and
  mobile.

## Running locally

Just open `orrery.html` in a browser — everything is self-contained. Serving
it over `http(s)` (rather than `file://`) is required for the service worker
and PWA install prompt to work, e.g.:

```
python3 -m http.server 8000
# then visit http://localhost:8000/orrery.html
```

## Repository layout

- `orrery.html` — the orrery app (all HTML/CSS/JS in one file).
- `manifest.json`, `sw.js`, `icons/` — PWA support.
- `index.html`, `server.js`, `start.bat` — the separate SMS-viewer tool this
  repo started as; unrelated to the orrery.

## Accuracy notes

Orbital elements and their secular rates come from the standard low-precision
Keplerian approximations (valid for roughly 1800–2050). Eclipse prediction
uses mean lunar node regression and angular season thresholds, so it flags
*likely* eclipse windows rather than computing exact saros-level circumstances.
