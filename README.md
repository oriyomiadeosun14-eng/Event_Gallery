# Event Gallery

A private photo and video gallery for a wedding. Guests scan a QR code, upload from their phone without making an account, and the couple reviews everything from an admin page before it goes public.

## Features

- **Guest uploads with no login.** Multiple photos and videos at once, with progress, retries and chunked uploads for large videos (Cloudinary upload widget). Guests add their name, the moment (Getting Ready, Ceremony, Reception, Dance Floor) and an optional caption.
- **Gallery.** Masonry grid of approved uploads with small, fast thumbnails, a full-screen viewer (keyboard and swipe), video playback that works on every browser, and filters kept in the URL (`/gallery?type=video&album=ceremony&page=2`) so they can be shared.
- **Moderation.** New uploads wait as *pending* until approved. Admins can approve, hide, feature, move to another album, or delete (which also removes the file from Cloudinary).
- **Highlights.** `/highlights` shows only the featured uploads, a "best of" page to share with the couple.
- **Guestbook.** Guests leave a note with their name and how they know the couple. Messages are moderated like photos, and the newest three appear on the home page.
- **Counters.** "248 memories from 61 guests" on the home page and gallery.
- **Event passcode and QR cards.** An optional passcode keeps the site private. `/admin/qr` prints an entrance sign and table cards whose QR code lets guests straight in, with the short link and passcode printed underneath as a backup.
- **Downloads.** Admins can download any album, or everything, as a ZIP.
- **Private by default.** Pages are marked `noindex`, guest pages can require the event passcode, and admin pages and admin API routes require a password.

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19, Server Components) |
| Database | PostgreSQL with [Prisma 7](https://www.prisma.io) (`pg` driver adapter) |
| Media | [Cloudinary](https://cloudinary.com): storage, resizing, video transcoding, ZIP archives |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) with design tokens |
| Language | TypeScript |

## How it works

```
Guest's phone ──upload──▶ Cloudinary ──(url, id, size)──▶ POST /api/media ──▶ Postgres (status: PENDING)
                                                                                  │
Admin (/admin) ── approve / hide / feature / delete ──▶ PATCH, DELETE /api/media/[id]
                                                                                  │
Gallery (/gallery) ◀── approved rows ── Postgres     thumbnails ◀── Cloudinary transformations
```

Files go straight from the guest's browser to Cloudinary. The app only stores metadata (who, which moment, status, the Cloudinary URL). The API checks that each URL belongs to this project's Cloudinary account and matches the claimed file type before saving it.

## Getting started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL server (local or hosted)
- A free [Cloudinary](https://cloudinary.com) account

### 1. Install

```bash
npm install          # also runs `prisma generate`
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable | What it is |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://postgres:PASSWORD@localhost:5432/event_gallery`. URL-encode special characters in the password (`@` → `%40`). Connections to anything other than localhost are encrypted. |
| `DATABASE_CA_CERT` | Optional. Only for hosted databases whose certificate isn't publicly trusted: paste the CA certificate your provider gives you. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (dashboard). |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Name of the unsigned upload preset (see step 3). Default `wedding`. |
| `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard. Server-side only; used for deletes and ZIP downloads. |
| `ADMIN_PASSWORD` | A password you choose for `/admin`. Guests never need it. |
| `AUTO_APPROVE_UPLOADS` | `true` publishes uploads and messages immediately; anything else holds them for review. |
| `EVENT_PASSCODE` | Optional. A short code such as `AMELIA26`, printed on the QR cards. When set, guests need it (or the QR code) to open the site. Not case-sensitive. |
| `NEXT_PUBLIC_SITE_URL` | The public address used in the QR code, e.g. `https://amelia-and-james.com`. If empty, the QR page uses the address you opened it on. |

### 3. Create the Cloudinary upload preset

In Cloudinary go to **Settings → Upload → Upload presets → Add upload preset** and set:

- **Name:** `wedding` (or whatever you put in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)
- **Signing mode:** Unsigned, so guests can upload without an account
- **Folder:** `wedding`
- **Allowed formats:** common photo and video formats (`jpg, jpeg, png, heic, heif, webp, gif, mp4, mov, m4v, webm, 3gp`)

An unsigned preset means anyone who finds it can upload, which is why uploads are held for moderation by default.

### 4. Create the database tables

```bash
npm run db:migrate
```

This applies the migrations in `prisma/migrations` (and creates the database if it doesn't exist yet). The four default albums are created automatically the first time the app talks to the database.

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>. To test on a phone, use the **Network** address `next dev` prints (the dev server accepts any `192.168.x.x` address on your Wi-Fi).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations locally; after editing `prisma/schema.prisma`, creates a new one |
| `npm run db:push` | Sync the schema without a migration (quick experiments only) |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Project structure

```
app/
  page.tsx                  landing page
  upload/                   guest upload page
  messages/                 guestbook (write and read notes)
  unlock/                   event passcode screen
  gallery/                  public gallery (filters in the URL)
  highlights/               featured uploads only
  admin/                    moderation (photos and messages tabs), login, printable QR cards
  api/media/                save an upload (public, validated)
  api/media/[id]/           approve / hide / feature / delete (admin)
  api/messages/             leave a guestbook message (public, validated)
  api/messages/[id]/        approve / hide / delete a message (admin)
  api/admin/download/       ZIP downloads (admin)
  globals.css               design tokens (colours) and base styles
components/
  ui/                       shared building blocks: Button, chip, card, input styles
  UploadForm.tsx            upload flow around the Cloudinary widget
  MediaGrid.tsx, Lightbox.tsx
  AdminBoard.tsx
lib/
  prisma.ts                 database client
  queries.ts                all database reads used by pages
  cloudinary.ts             server-side Cloudinary helpers (delete, ZIP, URL check)
  media.ts                  shared types, moments, thumbnail and video URL helpers
  auth.ts, tokens.ts        admin and guest sessions (HMAC-signed, httpOnly cookies)
  event.ts                  the couple's names and the date, used across the site
  theme.ts, cn.ts           small styling helpers
proxy.ts                    event passcode gate for guest pages
prisma/schema.prisma        Media, Album and Message models
```

## Styling conventions

Colours are design tokens, defined once in [`app/globals.css`](app/globals.css):

| Token | Use |
|---|---|
| `bg` | Page background |
| `surface` | Cards and panels |
| `ink` / `ink-muted` | Text / captions and helper text |
| `border` | Dividers and card borders |
| `primary` | Primary buttons |
| `sky` | Section backgrounds and highlights only, never text |
| `sage` | Secondary accents |
| `terracotta` | The single main call to action on a screen |

Tailwind turns each token into classes (`bg-surface`, `text-ink`, `border-border`). Components shouldn't use raw hex values. Shared styles live in [`components/ui/`](components/ui):

```tsx
<Button variant="accent" size="xl">Choose photos & videos</Button>
<Link href="/gallery" className={buttonClass({ variant: "outline" })}>See the gallery</Link>
<section className={cardClass({ tone: "sky", raised: true, className: "rounded-4xl p-6" })}>…</section>
```

To change how every primary button looks, edit `components/ui/button.tsx`. To change a colour everywhere, edit the token.

## Before the event

- **Names and date.** Edit [`lib/event.ts`](lib/event.ts).
- **QR cards.** Set `EVENT_PASSCODE` and `NEXT_PUBLIC_SITE_URL`, then open `/admin/qr` and print. Scan one with your phone to check it before printing them all.
- **Storage.** Wedding videos are large. Check your Cloudinary plan's storage and per-file limits (the free plan allows videos up to 100 MB).
- **Venue Wi-Fi** is often poor. Tell guests they can upload later and keep the link live for a few weeks.
- **Back up** everything from the admin ZIP download after the event.

## Deployment

Works on any Node host (for example Vercel) with a hosted PostgreSQL database. Set the same environment variables there, and run `npx prisma migrate deploy` against the production database (once, and again after each new migration). Files live in Cloudinary, so the server itself doesn't need persistent storage.
