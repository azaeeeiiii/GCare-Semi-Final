# GCare (React + plain CSS)

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
  - `ui.jsx`               – icons, button helper, title band, helpers
- `public/images/`         – images
- `src/index.css`          – imports every stylesheet below (order matters)
- `src/styles/`            – plain CSS, one file per area:
  - `base.css`             – colour variables (`--navy`, `--danger`, …), font, reset, pop-up animation
  - `icons.css`            – icon sizes / stroke styles
  - `buttons.css`          – `.btn` + variants (`btn--navy`, `btn--outline-dark`, `btn--outline-light`, `btn--white`)
  - `header.css`, `footer.css`, `page.css` (inner-page layout, News, Coming soon)
  - `alerts.css`           – red banner + alert pop-up
  - `landing.css`          – home hero + community card
  - `auth.css`             – sign in / sign up pop-up
  - `legal.css`            – Terms / Privacy page, pop-up and shared text styles

## Breakpoints used
Phone layouts use `max-width` media queries (960 / 760 / 640 / 480 / 380 px);
the desktop layout of the home page and sign-in pop-up starts at `min-width: 761px`;
the Terms / Privacy side menu starts at `min-width: 821px`.
