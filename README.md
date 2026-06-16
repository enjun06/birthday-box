# Birthday Surprise Box 🎂

A beautifully animated birthday surprise web experience built with [Astro](https://astro.build) and [GSAP](https://gsap.com). Features 9 interactive sections: stories, album, journey board game, postcard, secret gallery, surprise box, love notes, wish wall, and a grand ending.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production → dist/
npm run preview  # preview production build
```

## Project Structure

```
birthday-box-astro/
├── src/
│   ├── config/content.js          ← ALL content & asset configuration
│   ├── layouts/BaseLayout.astro   ← HTML shell, fonts, meta tags
│   ├── components/
│   │   ├── screens/               ← 10 screen components
│   │   │   ├── Menu.astro         ← main menu with bento grid
│   │   │   ├── Stories.astro      ← 5 story cards with reveal
│   │   │   ├── Album.astro        ← photo exhibition wall
│   │   │   ├── Journey.astro      ← milestone board game
│   │   │   ├── Postcard.astro     ← flip-to-reveal letter
│   │   │   ├── Secret.astro       ← password-locked gallery + scratch
│   │   │   ├── SurpriseBox.astro  ← random surprise gifts
│   │   │   ├── Daily.astro        ← 27 love notes, one per day
│   │   │   ├── Wish.astro         ← persistent wish wall
│   │   │   └── Ending.astro       ← grand finale screen
│   │   └── shared/                ← reusable UI pieces
│   ├── scripts/main.js            ← all client-side logic + GSAP
│   ├── styles/global.css          ← all styling
│   └── pages/index.astro          ← entry point
├── public/
│   ├── music/                     ← drop audio files here
│   ├── images/                    ← drop images here
│   └── videos/                    ← drop videos here
└── astro.config.mjs
```

## Editing Content

All content lives in **`src/config/content.js`**. No HTML or component editing needed for content changes.

### Sections you can edit:

| Config Key | Description | File Location |
|---|---|---|
| `password` | Secret gallery unlock password | `content.js:12` |
| `countdownTarget` | Target date for the countdown (June 27) | `content.js:13-17` |
| `surprises` | 10 surprise box items (icon, title, body) | `content.js:20-32` |
| `dailyNotes` | 27 daily love note messages | `content.js:35-62` |
| `chatBubbles` | 10 random pop-up chat messages | `content.js:65-75` |
| `stories` | 5 story cards (quote, hidden text, tag, emoji) | `content.js:78-112` |
| `albumFrames` | 8 photo frames (emoji placeholder, caption, label) | `content.js:114-123` |
| `journeyMilestones` | 7 milestones with mini-game types | `content.js:125-135` |
| `postcards` | 6 postcards (front icon, letter text, caption) | `content.js:137-172` |

### Editing a value — example:

```js
// src/config/content.js

export const CONFIG = {
  password: 'love',                     // ← change password here

  surprises: [
    { icon: '💖', title: 'Heartfelt',   // ← change text here
      body: 'You are the most beautiful part of my ordinary days.' },
    // ... add more items to the array
  ],

  dailyNotes: [
    "You are my sunshine on cloudy days.",  // ← edit or add more notes
    // ...
  ],
};
```

## Configuring Assets

Assets are set in the **`ASSETS`** object at the top of `src/config/content.js`.

### Music

Drop audio files into `public/music/`, then configure per screen:

```js
export const ASSETS = {
  music: {
    menu: { label: 'Menu — Lofi Piano', src: '/music/menu-theme.mp3' },
    stories: { label: 'Stories — Strings', src: null },     // null = no audio
    secret: { label: 'Secret Room', src: '/music/secret.mp3' },
    // ... add more
  },
};
```

### Images

Drop images into `public/images/`, then assign per frame:

```js
export const ASSETS = {
  albumImages: {
    0: '/images/our-sunset.jpg',    // replaces album frame 0 emoji
    1: '/images/bloom.jpg',
    // ...
  },
  secretImages: {
    0: '/images/secret-photo-1.jpg',
    // ...
  },
};
```

### Videos

Drop videos into `public/videos/`, then assign per module:

```js
export const ASSETS = {
  videos: {
    'album-0': '/videos/our-moment.mp4',    // album frame 0 play overlay
    // ...
  },
};
```

## Available Mini-Game Types (Journey)

Each journey milestone has a `gameType` field. Supported values:

| Type | Interaction | Visual |
|---|---|---|
| `pop` | Tap balloons to pop them | 🎈💥🎈 |
| `hold` | Hold the star for 600ms | ⭐ press & hold |
| `connect` | Tap both hearts to connect | 💗 + 💗 → 💞 |
| `drag` | Drag the cloud to reveal | ☁️ swipe away |
| `reveal` | Tap button to open gift | 🎂 Open Gift |

## Deployment

### Static hosting (Vercel, Netlify, Cloudflare Pages, GitHub Pages)

```bash
npm run build
# Upload the dist/ folder to your host
```

**Vercel / Netlify**: connect repo, set build command to `npm run build`, output to `dist`.

**GitHub Pages** via Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Customizing

### Fonts

Google Fonts (Quicksand, Playfair Display, Dancing Script) are loaded in `src/layouts/BaseLayout.astro`. Swap the URL to change fonts.

### Colors

CSS custom properties are in `src/styles/global.css`:

```css
:root {
  --pink: #ff6b9d;
  --coral: #ff8a6b;
  --gold: #f9d56e;
  --mint: #7dd8c9;
  --sky: #7ec8e3;
  --lavender: #c9a8e8;
}
```

### Countdown Target

In `src/config/content.js` — currently set to June 27 of the current year. Change the month/date:

```js
countdownTarget: new Date(year, 5, 27, 0, 0, 0),  // month 5 = June
```

## Tech Stack

- **Astro** — static site generation
- **GSAP** — animations (transitions, ScrollTrigger, timeline)
- **Vite** — bundling, HMR
- **localStorage** — persistent wish wall and unlocked notes
