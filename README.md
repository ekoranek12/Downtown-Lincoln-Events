# Downtown Lincoln Events

A static Astro site for browsing community events in Downtown Lincoln.

## Stack

- Astro
- GitHub Pages
- GitHub Actions
- Public Google Calendar ICS feed
- Google Calendar embed
- Google Forms event submission

## Local development

```sh
npm install
npm run dev
```

For local builds in this workspace, Astro telemetry is disabled:

```sh
HOME="$PWD/.astro-home" ASTRO_TELEMETRY_DISABLED=1 npm run build
```

## Deployment

The site is configured for GitHub Pages at:

- Site URL: `https://ekoranek12.github.io`
- Base path: `/Downtown-Lincoln-Events`

Deployment is handled by `.github/workflows/deploy.yml` and runs:

- on push to `main`
- daily at `11:00 UTC` (6:00 AM Central during standard time, 5:00 AM during daylight time)
- manually via `workflow_dispatch`

## Content sources

- Calendar ICS feed: configured in `src/lib/siteConfig.ts`
- Calendar embed URL: configured in `src/lib/siteConfig.ts`
- Submission form URL: configured in `src/lib/siteConfig.ts`
