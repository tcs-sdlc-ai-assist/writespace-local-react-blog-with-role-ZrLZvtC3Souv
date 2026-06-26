# Deployment Guide

This document covers how to deploy WriteSpace to production. WriteSpace is a fully client-side single-page application (SPA) with no backend server or database — all data is persisted in the browser's localStorage. This makes deployment straightforward: you only need a static file host.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build](#build)
- [Output Directory](#output-directory)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
  - [Automatic Deployment (Recommended)](#automatic-deployment-recommended)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [vercel.json Configuration](#verceljson-configuration)
  - [SPA Rewrite Rules Explained](#spa-rewrite-rules-explained)
- [Other Hosting Providers](#other-hosting-providers)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Cloudflare Pages](#cloudflare-pages)
  - [Generic Static Server](#generic-static-server)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)
- A Git repository hosted on GitHub, GitLab, or Bitbucket (for automatic deployments)

## Build

To create an optimized production build, run:

```bash
npm install
npm run build
```

This executes `vite build` under the hood, which:

1. Bundles all React components and JavaScript modules
2. Processes Tailwind CSS and purges unused utility classes
3. Minifies JavaScript and CSS for production
4. Outputs static assets with content-hashed filenames for cache busting

## Output Directory

The production build is written to the **`dist/`** directory at the project root. This directory contains:

```
dist/
├── index.html          # Entry HTML file
└── assets/
    ├── index-[hash].js   # Bundled and minified JavaScript
    └── index-[hash].css  # Bundled and minified CSS
```

When configuring any hosting provider, set the **publish directory** (or output directory) to `dist`.

## Environment Variables

WriteSpace does **not** require any environment variables. There are no API keys, no backend URLs, and no secrets to configure. All data is stored locally in the browser's localStorage.

No `.env` file is needed for development or production.

## Vercel Deployment

[Vercel](https://vercel.com/) is the recommended hosting platform for WriteSpace. It provides automatic builds, global CDN distribution, and seamless Git integration.

### Automatic Deployment (Recommended)

1. **Push your code** to a Git repository on GitHub, GitLab, or Bitbucket.

2. **Import the project** in the [Vercel Dashboard](https://vercel.com/new):
   - Click "Add New Project"
   - Select your Git provider and repository
   - Vercel will auto-detect the Vite framework

3. **Verify build settings** (Vercel typically detects these automatically):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Click Deploy**. Vercel will build and deploy your application.

5. **Automatic deploys on push:** Once connected, every push to the default branch (e.g., `main`) triggers a new production deployment automatically. Pull requests generate preview deployments with unique URLs.

### Manual Deployment via Vercel CLI

If you prefer deploying from the command line:

```bash
# Install the Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Deploy from the project root
vercel

# For production deployment
vercel --prod
```

The CLI will prompt you to confirm project settings on the first run.

### vercel.json Configuration

The project includes a `vercel.json` file at the repository root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This file configures Vercel's routing behavior for the deployed application.

### SPA Rewrite Rules Explained

WriteSpace uses client-side routing via React Router v6. When a user navigates to a URL like `/blogs` or `/admin/users`, the browser sends a request to the server for that path. Without rewrite rules, the server would return a 404 because no physical file exists at `/blogs` or `/admin/users` — only `index.html` and bundled assets exist in the `dist/` directory.

The rewrite rule solves this:

- **`"source": "/(.*)"` ** — Matches every incoming request path (e.g., `/`, `/login`, `/blog/abc-123`, `/admin/users`)
- **`"destination": "/index.html"`** — Serves `index.html` for all matched paths instead of returning a 404

Once `index.html` loads in the browser, React Router reads the URL and renders the correct page component. This is the standard pattern for deploying any single-page application.

> **Note:** Static assets (JavaScript bundles, CSS files, images) are still served directly by Vercel's CDN. The rewrite rule only applies to paths that don't match an existing static file.

## Other Hosting Providers

Since WriteSpace is a static SPA, it can be deployed to any static hosting provider. The key requirement is configuring a **catch-all redirect** (or rewrite) so that all routes serve `index.html`.

### Netlify

Create a `netlify.toml` file in the project root (or configure via the Netlify dashboard):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Alternatively, create a `dist/_redirects` file (added as part of your build process):

```
/*    /index.html   200
```

### GitHub Pages

GitHub Pages does not natively support SPA rewrites. Use one of these workarounds:

1. **404.html trick:** Copy `index.html` to `404.html` in the `dist/` directory after building:

   ```bash
   npm run build
   cp dist/index.html dist/404.html
   ```

2. **Use a GitHub Action** to deploy the `dist/` directory to the `gh-pages` branch.

> **Note:** GitHub Pages serves from a subpath (e.g., `https://username.github.io/repo-name/`), which requires setting `base` in `vite.config.js`:
>
> ```js
> export default defineConfig({
>   base: '/repo-name/',
>   plugins: [react()],
> });
> ```

### Cloudflare Pages

1. Connect your Git repository in the Cloudflare Pages dashboard.
2. Set the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Cloudflare Pages automatically handles SPA routing — no additional configuration is needed.

### Generic Static Server

If you are using a generic static file server (e.g., Nginx, Apache, Caddy), configure it to serve `index.html` for all routes that don't match a static file.

**Nginx example:**

```nginx
server {
    listen 80;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Caddy example:**

```
example.com {
    root * /path/to/dist
    try_files {path} /index.html
    file_server
}
```

## CI/CD Notes

### Automatic Deploys with Vercel

When your Git repository is connected to Vercel:

- **Production deploys** are triggered automatically on every push to the default branch (e.g., `main` or `master`).
- **Preview deploys** are created for every pull request, providing a unique URL to review changes before merging.
- **No additional CI/CD configuration** is required — Vercel handles the build and deployment pipeline.

### Running Tests Before Deploy

To ensure code quality before deployment, you can run the test suite as part of your CI pipeline. Add a test step before the build:

```bash
npm install
npm test
npm run build
```

If using GitHub Actions, a basic workflow might look like:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - run: npm ci
      - run: npm test
      - run: npm run build
```

> **Tip:** If you are using Vercel's automatic deploys, you can configure the **Ignored Build Step** in your Vercel project settings to skip builds when only non-code files (e.g., documentation) change. Use a custom script or Vercel's built-in folder-based ignore rules.

### Build Caching

Vercel automatically caches `node_modules` between builds to speed up deployment times. No additional caching configuration is needed.

## Troubleshooting

### Routes return 404 in production

This means the SPA rewrite rule is not configured correctly. Ensure your hosting provider is set up to serve `index.html` for all routes. See the [SPA Rewrite Rules Explained](#spa-rewrite-rules-explained) section.

### Blank page after deployment

1. Open the browser developer console and check for JavaScript errors.
2. Verify that the `base` path in `vite.config.js` matches your deployment URL. For root-level deployments (e.g., `https://your-app.vercel.app/`), no `base` configuration is needed (the default `/` is correct).
3. Ensure the build completed successfully without errors.

### Styles are missing

1. Confirm that `tailwind.config.js` has the correct `content` paths:
   ```js
   content: [
     "./index.html",
     "./src/**/*.{js,jsx}",
   ]
   ```
2. Verify that `src/index.css` includes the Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Run `npm run build` locally and preview with `npm run preview` to verify styles render correctly before deploying.

### localStorage data is not shared across devices

This is expected behavior. WriteSpace stores all data in the browser's localStorage, which is specific to each browser and device. Data created on one device will not appear on another. This is a design choice that enables the application to work without a backend server.