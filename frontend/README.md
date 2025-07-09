# Frontend – Portfolio Website

This is the Vite + React frontend for the portfolio project.

## 📦 Stack

- Vite
- React 19
- TailwindCSS
- React Toastify
- Cloudflare Turnstile

## 🚀 Running Locally

```bash
    npm install
    npm run dev
```
```bash
npm run preview
```
Preview the production build locally on `http://localhost:4173`.

## 🧩 Features

- Single page static website, stored in S3
- Dark/light theme support
- Dynamic project listing via GitHub API
- Downloadable CV (gated by Turnstile)
- Responsive design with mobile-first breakpoints
- Optional Umami metrics script (configurable in `.env`)

These are required to fully run the frontend.

## 📄 Notes


- Turnstile must be configured in Cloudflare and added to `.env`.
- Link your own GITHUB, and LinkedIn profiles from the footer.
- Can call the set_open_to_work endpoint with a POST command to `https://api.<YOURDOMAIN>/set-open-to-work`, with the 
- `x-api-key` header set to the correct value, and the body in the format of 
```
{ "openToWork": <BOOL> }
```
---