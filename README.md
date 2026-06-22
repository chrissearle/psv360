# psv360

A self-hosted 360° panorama viewer built with [Nuxt 4](https://nuxt.com) and [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/). Drop in a folder of equirectangular images and a JSON config, and you get a browsable, linkable, embeddable virtual tour.

## Features

- **Gallery** — entry page lists all available panoramas, newest first
- **Viewer** — full-screen 360° viewer with hotspot navigation between scenes
- **Deep links** — `/pano/<id>` links directly to any scene; the address bar and page title update as you navigate between scenes via hotspots, so every scene stays bookmarkable and shareable
- **Embeds** — `/embed/<id>` is an HTML preview page suitable for `<iframe>`; `/thumb/<id>` serves the thumbnail image directly for use as `<img src>` on external sites
- **Metrics** — Prometheus metrics exposed at `/metrics`

## Setup

```bash
pnpm install
```

## Local development

1. Create a `data/` directory (git-ignored) and organise your panoramas under `data/YYYY/MM/DD/<name>/` (see [Directory structure](#directory-structure) below).
2. Run the config generator to create `data/config.json`:

```bash
pnpm generate:config
```

3. Start the dev server:

```bash
pnpm dev
```

The app reads images from `./data` by default. Override with:

```bash
PANO_DIR=/path/to/your/panos pnpm dev
```

## Directory structure

Panoramas **must** be placed under a `YYYY/MM/DD/<name>/` path inside `PANO_DIR`. The date is used for display and for ordering the gallery (newest first).

```
PANO_DIR/
  2024/
    06/
      15/
        garden/
          Panorama.jpg        ← equirectangular image
          thumbnail.jpg       ← optional preview (referenced manually in config.json)
      22/
        terrace/
          Panorama.jpg
  2023/
    09/
      01/
        rooftop/
          Panorama.jpg
```

Each leaf directory (the one containing the `.jpg`) becomes one scene. Its `id` in the config is built from the path relative to `PANO_DIR` with slashes replaced by dashes — e.g. `2024-06-15-garden`.

Running `pnpm generate:config` after adding new panoramas will append skeleton entries for the new scenes without touching existing ones.

## Config format

`config.json` lives at the root of `PANO_DIR` and is created/updated by `pnpm generate:config`. Edit `name`, `thumbnail`, `defaultPosition`, and `hotspots` by hand.

```json
{
  "scenes": [
    {
      "id": "2024-06-15-garden",
      "name": "Garden",
      "image": "2024/06/15/garden/Panorama.jpg",
      "date": "2024-06-15",
      "thumbnail": "2024/06/15/garden/thumbnail.jpg",
      "defaultPosition": { "yaw": 1.5708, "pitch": -0.1 },
      "hotspots": [
        {
          "id": "to-terrace",
          "targetId": "2024-06-22-terrace",
          "yaw": 1.2,
          "pitch": 0.0,
          "label": "Go to terrace"
        }
      ]
    },
    {
      "id": "2024-06-22-terrace",
      "name": "Terrace",
      "image": "2024/06/22/terrace/Panorama.jpg",
      "date": "2024-06-22",
      "hotspots": []
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | string | URL slug (auto-generated) — used in `/pano/<id>` and `/embed/<id>` |
| `name` | string | Display name — edit this from the auto-generated leaf-directory name |
| `image` | string | Path relative to `PANO_DIR` (auto-generated) |
| `date` | string? | `YYYY-MM-DD` — auto-extracted from path; used for ordering and display |
| `thumbnail` | string? | Path relative to `PANO_DIR` for preview image; add manually |
| `defaultPosition` | object? | Initial yaw/pitch (radians) when entering this scene; see [Coordinate picker](#coordinate-picker) |
| `hotspots[].targetId` | string | `id` of the destination scene |
| `hotspots[].yaw` | number | Horizontal angle in radians where the hotspot appears |
| `hotspots[].pitch` | number | Vertical angle in radians |
| `hotspots[].label` | string? | Tooltip label |

All angles are in **radians**.

## Coordinate picker

Finding the right yaw/pitch values for `defaultPosition` and hotspot positions requires looking at the panorama itself. The viewer includes a built-in authoring overlay that is **only shown in development mode** (`pnpm dev`) — it is compiled away entirely in production builds.

Open any scene in the viewer:

```
http://localhost:3000/pano/<id>
```

The overlay (top-right corner) shows:

- **Current view** — updates live as you look around. Use these values as `defaultPosition` for the scene.
- **Last click** — records the yaw/pitch of the last point you clicked on the sphere. Use these values as the `yaw`/`pitch` for a hotspot.

Both are shown pre-formatted ready to paste into `config.json`.

## Embedding

### Image link (recommended for blogs and external pages)

Use `/thumb/<id>` as the image source — it returns the scene's thumbnail (or full image if no thumbnail is set) with the correct image MIME type:

```html
<a href="https://your-host/pano/2024-06-15-garden" target="_blank">
  <img src="https://your-host/thumb/2024-06-15-garden" alt="Garden panorama" />
</a>
```

### iframe embed

`/embed/<id>` returns an HTML page with a static preview image that links to the viewer. Use this for iframes only — it cannot be used as an `<img src>`:

```html
<iframe src="https://your-host/embed/2024-06-15-garden" width="800" height="450" frameborder="0"></iframe>
```

## Deployment

The app expects one environment variable:

| Variable | Default | Description |
|---|---|---|
| `PANO_DIR` | `./data` | Absolute path to the directory containing images and `config.json` |

Mount your image volume at a stable path inside the container and set `PANO_DIR` to that path. The app serves images through `/api/image/<path>` — no static file server or CDN required, though adding one in front is straightforward.

Prometheus metrics are available at `/metrics` with no authentication.

## Commands

```bash
pnpm dev              # development server
pnpm build            # production build
pnpm preview          # preview production build locally
pnpm generate:config  # scan PANO_DIR and update config.json with new scenes
pnpm lint             # run ESLint
pnpm lint:fix         # auto-fix lint issues
pnpm typecheck        # run TypeScript type checking
```
