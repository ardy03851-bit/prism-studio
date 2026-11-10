# Prism — AI Image Studio

A free, keyless, glassmorphic AI image generation web app. No signups, no API keys, nothing to configure — open the page and generate.

**Live:** https://ardy03851-bit.github.io/prism-studio/

## Features

- **8 models, zero keys** — Sana (Pollinations), FLUX.1 Schnell, AlbedoBase XL 3.1, Juggernaut XL, ICBINP, Animagine XL, Dreamshaper, Stable Diffusion 1.5 (all via AI Horde)
- **Reference images (img2img)** — drop, paste, or upload an image and AI Horde models will edit from it, with an adjustable reference-strength slider
- **Style presets** — cinematic, photoreal, anime, 3D, watercolor, neon noir, minimal
- **Aspect ratios** — 1:1, 4:3, 3:4, 16:9, 9:16 (auto-sized to each provider's free-tier limits)
- **Batch generation** — up to 4 images per run, each with its own seed
- **Settings** — steps, guidance, seed lock, denoise strength
- Glassmorphic UI with animated aurora background, staggered reveals, shimmer loaders and a lightbox viewer

## How it works

The app runs entirely in your browser and talks to two free, keyless, CORS-enabled services:

| Provider | Endpoint | Notes |
|---|---|---|
| [Pollinations](https://pollinations.ai) | `image.pollinations.ai/prompt/…` | Sana model, instant, one request at a time, small watermark |
| [AI Horde](https://stablehorde.net) | `stablehorde.net/api/v2/generate/…` | Community GPU cluster using the official anonymous key `0000000000`; supports img2img; anonymous requests are community-prioritized so they can take a minute or two |

Anonymous free tiers impose limits (Pollinations: 1 concurrent request per IP; AI Horde: sizes up to ~591×591). The app handles both automatically.

## Run locally

It's a static site — just serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Tech

Vanilla HTML/CSS/JS. No build step, no dependencies. Fonts: Clash Display & Satoshi (Fontshare), JetBrains Mono.

## License

MIT
