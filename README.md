# Zenth / Ukyo New Tab

A Chrome new-tab extension with a cinematic sky theme, fast search commands, quick notes, custom app shortcuts, and a GitHub profile snapshot widget.

## Features

- Dynamic sky/background theme based on time of day.
- Live clock and contextual greeting.
- Battery status pill (when supported by the browser).
- Search shortcuts in the main search bar:
  - `/g` Google
  - `/yt` YouTube
  - `/gh` GitHub
  - `/r` Reddit
  - `/so` Stack Overflow
- Quick Notes panel with draggable notes (stored locally).
- Custom app shortcuts in the dock (stored locally).
- GitHub Snapshot widget (fetches public profile data from GitHub API).

## Tech Stack

- HTML, CSS, vanilla JavaScript (ES modules)
- Chrome Extension Manifest V3
- `chrome.storage.local` with `localStorage` fallback

## Project Structure

- `index.html` main new-tab page
- `manifest.json` extension manifest
- `styles.css` root stylesheet import
- `styles/` feature-specific styles
- `js/main.js` app bootstrap
- `js/features/` modular feature logic
- `js/lib/storage.js` storage helper
- `icons/` extension icons
- `images/`, `svg/` visual assets
- `privacy-policy/` privacy policy page and assets

## Run Locally (as extension)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `ukyo-new-page`.
5. Open a new tab to verify the UI loads.

## Packaging

To create a distributable zip manually, package the project directory contents (excluding ignored files). Current repo includes `zenth.zip` as an artifact.

## Permissions Used

From `manifest.json`:

- `storage`: persist notes, shortcuts, and widget settings.
- `identity`, `identity.email`: optional profile greeting/name support.

Network access:

- `https://api.github.com` for GitHub Snapshot.

## Privacy

See `privacy-policy/index.html` for policy details.

## Notes for Development

- No build tooling is required.
- Edit modules under `js/features/` and refresh the extension in `chrome://extensions`.
- If UI changes do not appear, use the extension "Reload" button and hard refresh the new-tab page.
