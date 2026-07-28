# Sermon Prep

A lightweight tool for turning sermon notes or extracted text into a clean list of Bible passages.

The app will:

- accept pasted text first, with image OCR planned later;
- detect and normalize Bible references, including abbreviated book names;
- fetch passage text from free-to-use Bible sources;
- export the resulting passage list as a PDF;
- use AI only where it adds value, with cost kept low by defaulting to deterministic parsing.

## Local commands

- `npm run dev`
- `npm run check:local` (lint and typecheck)
- `npm run test`
- `npm run build`

## Analytics

The production build can load Cloudflare Web Analytics without sending sermon
notes or Scripture content. In Netlify, add the Cloudflare site token as the
`VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN` environment variable, then trigger a new
deploy. The token is a public site identifier, not an API secret.

Analytics are disabled during local development and when the variable is not
configured. Cloudflare automatically tracks page views and route changes for
this single-page app; custom click events and heatmaps are not included.

Running `npm install` sets up the Husky pre-commit hook. It runs the local checks
before each commit. CI independently runs lint, typecheck, the test suite, and
the production build. Configure the `Lint and typecheck` and `Test and build`
checks as required status checks in the `main` branch protection rules.
