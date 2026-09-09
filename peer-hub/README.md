# St Oran's Peer Hub

A student-focused prototype website to help St Oran's students learn, stay organised, and support one another through peer-to-peer help, shared study resources, and a focused study timer.

This is a **front-end prototype**: everything runs in the browser and data is stored in `localStorage`, so it's ready to publish on **GitHub Pages** with no backend or build step.

## ✨ Features

- **Home** — personalised greeting, daily thought, peer search, mini calendar, upcoming deadlines, peers available now, and Peer Points progress
- **Calendar** — full monthly view, add/remove events with High / Medium / Low importance
- **Assignments** — track subject, due date and priority; tick off completed work (earns Peer Points)
- **Find a Peer** — search and filter classmates by subject, year level and availability, and send help requests
- **Study Resources** — browse and share notes, guides, videos and templates by subject
- **Study Session** — a Pomodoro-style timer with Focus / Short break / Long break modes, weekly stats and Roro encouragement
- **My Profile** — bio, year level, subjects you can help with, interests and privacy preferences
- **My Progress** — Peer Points, students helped, study sessions, streaks, a weekly minutes chart and badges
- **Settings** — account details, password, notification preferences and sign-out
- **Login / Sign-up** — create an account or use a demo account; sessions persist in the browser
- **Roro 🐉** — a small dragon mascot in the bottom-right corner who pops up with encouragement on every page

## 🎨 Design

- **Colours:** dark forest green, cream, white, muted gold, small burgundy accents
- **Type:** Playfair Display for headings, DM Sans for body text
- Calm, academic, letterpress-style cards (hairline borders, no heavy shadows) rather than a generic SaaS dashboard look

## 🚀 Running it locally

No build tools needed — it's plain HTML, CSS and JavaScript.

1. Clone or download this repository
2. Open `index.html` in a browser, **or** serve the folder locally, e.g.:
   ```bash
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000`

## 🌐 Publishing to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Under **Source**, choose the `main` branch and `/ (root)` folder
4. Save — your site will be live at `https://<username>.github.io/<repo-name>/`

## 🔑 Demo accounts

| Name | Username | Password |
|---|---|---|
| Aria Whitfield (Year 12) | `demo.aria` | `peerhub` |
| Kai Ngata (Year 13) | `demo.kai` | `peerhub` |

You can also sign up as a new student from the login screen.

## 📁 Project structure

```
peer-hub/
├── index.html            Login / sign-up
├── home.html              Dashboard
├── calendar.html          Monthly calendar
├── assignments.html       Assignment tracker
├── find-peer.html         Peer search
├── resources.html         Study resources
├── study-session.html     Pomodoro timer
├── profile.html           My Profile
├── progress.html          My Progress
├── settings.html          Settings
├── css/
│   └── style.css          Design system (colours, type, components)
└── js/
    ├── data.js            Demo data + localStorage data layer
    ├── app.js              Shared shell: sidebar, topbar, Roro, toasts
    └── pages/              Page-specific logic (one file per page)
```

## ⚠️ Prototype notes

- All data (accounts, assignments, events, resources) lives in your browser's `localStorage` — it is **not** shared between devices or students, and clearing browser data will reset it.
- "Sending a peer request" and "opening a resource" show a confirmation toast but don't connect to a real backend — this is a click-through prototype for demonstrating the concept.
