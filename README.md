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

Running `npm install` sets up the Husky pre-commit hook. It runs the local checks
before each commit, while CI focuses on the test suite and production build.
