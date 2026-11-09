# GCare (React + Tailwind)

```bash
npm install     # once
npm run dev     # http://localhost:5173
npm run build   # creates dist/ to upload (Netlify etc.)
```

## Where things are
- `src/content.jsx`        – alert/status text + Terms & Privacy wording
- `src/pages/`             – Landing, News, Legal, ComingSoon
- `src/components/`
  - `Header.jsx`           – brand, landing header, inner-page header
  - `Footer.jsx`
  - `Alerts.jsx`           – red banner + alert details pop-up
  - `AuthModal.jsx`        – sign in / sign up pop-up
  - `LegalModal.jsx`       – Terms/Privacy pop-up + shared section renderer
  - `ui.jsx`               – icons, button styles, title band, helpers
- `public/images/`         – images
- `tailwind.config.js`     – colors, font, `mob:` breakpoint
