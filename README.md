# GCare

Final project for IT 314 - Web Systems and Technology, 1st Semester AY 2026–2027, Group 2, CS-3101.

> *A safer, more prepared, and more connected Batangas.*

## Project Description

GCare is a community-driven safety platform for the residents of **Golden Country Homes, Batangas City**. It brings emergency alerts, incident reporting, an interactive safety map, community news, volunteer events, and an AI chat assistant into one web app, so residents can stay informed, prepared, and supported during emergencies and other local concerns.

> GCare is not an emergency response service. In an emergency, call your local hotline right away (in the Philippines, dial **911**).

### Problem

When a flood, fire, power outage, or road hazard happens in a small community, information is scattered and slow. Warnings spread through group chats and word of mouth, residents don't know who to call or where to report a hazard, and barangay officials and volunteers have no single place to see what is happening, who is handling it, and whether it has been resolved. Fake or duplicate reports and a lack of accountability make this worse.

### Objectives

- Give residents a single place to see **real-time safety alerts** (critical, warning, advisory) and community news.
- Let residents **report incidents and hazards** with a photo and a pin on a map, restricted to the Golden Country Homes service area.
- Let admins **review, assign, and resolve** reports, and let approved **volunteers** take reports and submit photo proof of the work.
- Build trust through **ID verification** and a verified badge for residents.
- Provide quick access to **official Batangas City hotlines** and a chat assistant that answers common questions.
- Let residents **sign up for volunteer events** and get in touch with the admins through a contact form.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router 6, Vite 5 |
| Styling | Plain CSS (one stylesheet per page/component in `src/styles/`) |
| Maps | Leaflet |
| Backend | Node.js, Express 4, CORS, dotenv |
| Database, Auth, Storage | Supabase (PostgreSQL with Row Level Security, Auth, Storage buckets) |
| AI Chat | Supabase Edge Function (`chat`), called through the Express server |
| Routing on hosting | SPA fallback rule in `public/_redirects` |

## How It Works

1. **Sign up and sign in.** Authentication is handled by Supabase Auth. Pages like the feed, reports, and profile require a signed-in user, and all `/admin` pages require an admin account.
2. **Stay informed.** The landing page shows the active alert and area status. The News page shows published community stories, and admins post alerts and news from the admin dashboard.
3. **Report an incident.** A resident picks a category (flood, fire, typhoon, landslide, earthquake, road hazard, power, water, medical, crime/safety, other), writes a description, attaches a photo, and drops a pin on the map. Pins are checked against the Golden Country Homes boundary.
4. **Review and resolve.** A report moves through **Pending → Under Review → Resolved**. Admins start the review, and can assign it to a volunteer. Residents can track and delete their own reports.
5. **Volunteer.** Residents sign up for volunteer events, and admins approve or reject each sign-up. Approved volunteers can claim a report under review and must submit a proof photo within 24 hours, otherwise the report is released. Admins approve or reject the proof before the report is marked resolved.
6. **Get verified.** Residents upload an ID (and optional selfie) which is stored privately. Admins approve or reject it, and approved users get a verified badge.
7. **Ask the assistant.** The floating GCare Assistant answers questions about alerts, reports, and events. For "who do I call?" questions it answers from a built-in list of official Batangas City hotlines instead of letting the AI guess numbers.
8. **Contact the team.** Anyone can send a suggestion or inquiry from the Contact page, and admins read the messages in the dashboard.

The React app talks to the Express server through `/api/...` routes (proxied to port `3001` by Vite in development). The server verifies the user's Supabase session token, checks admin access, validates input, and reads and writes the database and storage buckets.

### Running Locally

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Create server/.env with these variables
#    PORT=3001
#    CLIENT_ORIGIN=http://localhost:5173
#    SUPABASE_URL=<your Supabase project URL>
#    SUPABASE_ANON_KEY=<your Supabase anon/publishable key>
#    SUPABASE_SERVICE_KEY=<your Supabase service role key>

# 3. Start the backend (terminal 1)
cd server
npm run dev

# 4. Start the frontend (terminal 2, from the project root)
npm run dev
```

Build for production with `npm run build`, and preview the build with `npm run preview`.

## Project Structure

```
gcare/
├── index.html                  # App entry HTML
├── vite.config.js              # Vite config (proxies /api to the server)
├── package.json
├── public/
│   ├── _redirects              # SPA fallback for hosting
│   └── images/                 # Logo, icons, and landing page images
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Routes
│   ├── content.jsx             # Editable text (About, Contact, Terms, Privacy)
│   ├── components/             # Header, Footer, ChatWidget, IncidentMap,
│   │                           # ReportMap, AuthModal, IdVerification, etc.
│   ├── pages/                  # Landing, Feed, Report, Reports, Volunteer,
│   │                           # News, Profile, About, Contact, Legal,
│   │                           # and the Admin* pages
│   ├── lib/                    # API helpers, auth, reports, alerts, news,
│   │                           # volunteer, hotlines, service area, Supabase client
│   └── styles/                 # CSS files per page/component
├── server/
│   ├── index.js                # Express API (auth, reports, volunteers,
│   │                           # verification, news, alerts, chat, admin)
│   └── package.json
└── supabase/
    └── migrations/             # SQL migrations (contact_messages table + RLS)
```

## Developers

- Banaag, Ace Angela
- Banaag, Irish
- Bituin, Jan Lawrence