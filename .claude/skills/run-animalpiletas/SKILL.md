---
name: run-animalpiletas
description: Build, run, and drive AnimalPiletas (Express API + React/Vite frontend). Use when asked to start the app, run the backend or frontend, seed tarifas, take a screenshot of the UI, or click through a CRUD flow (clientes, extras, tarifas de limpieza).
---

AnimalPiletas is a backend (Express + MongoDB, at repo root) and a
frontend (React + Vite, in `frontend/`) that run as two separate dev
servers. There's no `chromium-cli` on this machine, so the frontend is
driven via `.claude/skills/run-animalpiletas/driver.mjs` — a small
Playwright-based REPL that speaks the same command style (`nav`,
`click`, `fill`, `screenshot`) piped in over stdin.

All paths below are relative to the repo root (`AnimalPiletas/`).

## Prerequisites

Windows machine, no extra OS packages needed. Node.js + npm already
on PATH (`node --version` → v22.17.0 in this environment).

## Setup

One-time, after clone:

```bash
npm install                                      # backend deps
cd frontend && npm install && cd ..               # frontend deps
cd .claude/skills/run-animalpiletas && npm install && cd ../../..  # driver deps (playwright)
npx --prefix .claude/skills/run-animalpiletas playwright install chromium  # downloads the browser once, cached in %LOCALAPPDATA%\ms-playwright
```

Env vars — copy `.env.example` to `.env` at repo root and fill in:

```
MONGO_URI=...   # required — MongoDB Atlas connection string
PORT=3000       # optional — default 3000
```

Load the fixed tarifas catalog once (safe to re-run — it upserts):

```bash
npm run seed:tarifas
```

## Build

No separate build step for dev. (`frontend`'s `npm run build` only
matters for a production bundle, not for driving the app locally.)

## Run (agent path)

1. Start both dev servers in the background, poll until they answer:

```bash
npm start &                                        # backend → :3000
timeout 30 bash -c 'until curl -sf http://localhost:3000/api/clientes >/dev/null; do sleep 1; done'

(cd frontend && npm run dev) &                     # frontend → :5173
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

2. Drive the frontend by piping commands to the driver:

```bash
node .claude/skills/run-animalpiletas/driver.mjs <<'EOF'
nav http://localhost:5173
wait-for text=Clientes
screenshot 01-inicial
fill input[placeholder="Extra"] :: Pastillas de cloro
fill input[placeholder="Precio"] :: 1200
click h2:has-text("Clientes")
wait-for text=Pastillas de cloro
screenshot 02-creado
quit
EOF
```

Screenshots land in `.claude/skills/run-animalpiletas/screenshots/`.

Driver commands:

| command | what it does |
|---|---|
| `nav <url>` | navigate |
| `wait-for text=<text>` or `wait-for <css-selector>` | wait up to 15s for an element |
| `click <selector>` or `click <scope> :: <selector>` | click, optionally scoped to a container (use scoping whenever the plain selector would match more than one element — e.g. every row has an "Editar" button) |
| `fill <selector> :: <value>` or `fill <scope> :: <selector> :: <value>` | fill an input. `::` (with surrounding spaces) is the separator, so it never collides with selectors that contain spaces, like `input[placeholder="Precio unitario"]` |
| `screenshot [name]` | full-page PNG, saved under `screenshots/` |
| `text` | prints `document.body.textContent`, useful for asserting state without a screenshot |
| `console` / `console --errors` | dumps captured browser console messages (JSON) |
| `quit` | closes the browser and exits |

3. Stop the servers — npm doesn't forward signals to the child
   process it spawns, so killing the backgrounded shell isn't enough;
   free the ports directly:

```bash
# find PIDs listening on the two ports, then kill them
netstat -ano | grep -E ":3000 |:5173 " | grep LISTENING
# (Windows) Stop-Process -Id <pid> -Force, via the PowerShell tool
```

## Run (human path)

Two terminals:

```bash
npm run dev              # backend, with nodemon auto-reload → http://localhost:3000
```
```bash
cd frontend && npm run dev   # → http://localhost:5173, open in a browser
```

## Test

No automated test suite yet — verification so far has been manual
(curl for the API, the driver above for the UI).

---

## Gotchas

- **A stray backend process can outlive a `TaskStop`.** `npm start` /
  `npm run dev` spawn a child `node` process; stopping the tracked
  shell task does not kill it, so the old server keeps holding
  port 3000 and a fresh `npm start` silently talks to nobody while the
  *old* code keeps answering requests. Always check
  `netstat -ano | grep :3000` before concluding a restart picked up
  new code, and kill the PID directly if something's still listening.
- **Unscoped selectors that "should" be unique often aren't.** Every
  row in both the Clientes table and the Tarifas list renders an
  "Editar" button, so `tr :: button:has-text("Editar")` resolves
  to several elements and throws a strict-mode violation. Scope by content
  instead: `` tr:has-text("Cliente Prueba A") :: button:has-text("Editar") ``.
- **Attribute selectors with spaces break naive `split(" ")` parsing.**
  `input[placeholder="Precio unitario"]` contains spaces inside
  the selector itself, so `fill <selector> <value>` (splitting on the
  first space) mis-parses the selector. The driver requires ` :: ` as
  the explicit separator for exactly this reason.

## Troubleshooting

- **`Cannot GET /api/...` on a route you just added**: almost always
  the stray-old-process gotcha above, not a routing bug — check
  `netstat` before debugging `app.js`.
- **`strict mode violation: ... resolved to N elements`** from the
  driver: your selector isn't scoped enough — see Gotchas above.
