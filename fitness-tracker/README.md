# VitalSync — Multi-Agent Fitness Tracker

A beautiful, interactive fitness tracking web app with multi-agent wellness orchestration.

**Public access:** anyone with the link can open the app — no login or network token required.

## Features

- **Meal Tracking** — Breakfast, lunch, evening snack, dinner with quantity-based calories (e.g. 6 paneer pieces)
- **Custom foods** — Type a name and calories autofill from the food database
- **Hydration** — Water (liters), coffee & tea cups with animated visualization
- **Sleep Data** — Bedtime, wake time, duration, and quality placeholders
- **Wellness Metrics** — Stress levels, heart rate average, and step count
- **Interactive Charts** — Animated bar, pie, radar, and area charts
- **Multi-Agent Orchestration** — Specialist agents + Wellness Coordinator analyze your day

## Quick Start (local)

```bash
cd fitness-tracker
npm install
npm run dev
```

## Public hosting (no token)

### Option A — GitHub Pages (recommended permanent link)

1. Open: https://github.com/sanket-mishrax/agenticsubmission/settings/pages
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**
3. Branch: **`gh-pages`** / folder: **`/` (root)** → Save

Public URL will be:

**https://sanket-mishrax.github.io/agenticsubmission/**

(A GitHub Actions workflow also exists for automatic deploys from `main`.)

### Option B — Netlify (drag & drop or Git)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `fitness-tracker/dist` folder after `npm run build`
3. Or connect the GitHub repo with base directory `fitness-tracker`

### Option C — Heroku

```bash
cd fitness-tracker
# Procfile + serve already configured
heroku create your-app-name
git push heroku main
```

## Tech Stack

React 18 · TypeScript · Vite · Tailwind · Framer Motion · Recharts · Zustand

Data is stored in the browser (`localStorage`) — no backend or auth required.
