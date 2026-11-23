# MemeMasters Studio

**Current state:** Testable, dependency-free browser editor MVP. This repo previously held **reports only**, not the source of the claimed AI/revenue platform. Old QA reports are historical claims, not evidence of live earnings or production AI integrations.

## What works in this version
- Import a locally selected JPG, PNG or WebP image (up to 12 MB).
- Add top and bottom meme captions, adjust text size, change image framing, and choose square/portrait output.
- Preview and download a real full-resolution PNG entirely in the browser.
- Use the built-in gradient background without importing a picture.
- No accounts, paid AI requests, payment processor, cloud storage, tracking pixels, or external app dependencies.

## Run locally

Run in the repository root:

    python3 -m http.server 8000

Open http://localhost:8000 in a modern browser. Serve the files over HTTP rather than opening the HTML as file:// because the application uses JavaScript ES modules.

## Run tests

    node --check editor-core.mjs
    node --check app.mjs
    node --test tests/editor.test.mjs
    python3 tests/site_contract.py

Node.js 20+ and Python 3.9+ are sufficient. No npm install, cloud credentials, Replit account, or paid service is required.

## Deploy a static demo
Publish the root HTML, CSS and JS files through HTTPS with correct .mjs content types and a proper 404. The image never needs to reach the server. Confirm the user-visible PNG export on desktop and mobile before advertising the demo. See RELEASE_GATES.md for acceptance and rollback.

## Monetization and business ownership
This MVP is free. It links to Bobsome1 Media + IT, where customers can request scoped paid services. Do not advertise AI creation, memberships, subscriptions, ad earnings, or automated PayPal checkout as operational unless those separate systems are built and verified.

## Historical reports and credential safety
The legacy markdown reports describe systems, metrics and revenue that are **not verifiable from the source currently in this repo**. They are retained for provenance, not endorsements of readiness. One public document contained a password value in an old example; the main branch now redacts that example. If it was ever valid, rotate the credential and review Git history/cache exposure. Never commit passwords or credentials.
