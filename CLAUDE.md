# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sapila is a meme-sharing platform built as a Next.js monolith with Supabase (PostgreSQL) backend, targeting sapila.gr.

**Target Audience:** Gen Z users aged 18–24. The tone is irreverent, playful, and internet-native. Copy should feel like talking to a friend, not a corporate product. Think Discord/TikTok energy, not LinkedIn.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

Prisma commands:
```bash
npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma db push     # Push schema changes to database (no migrations)
npx prisma studio      # Open database GUI
```

No test framework is configured yet.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7 · Supabase · NextAuth 4 · Tailwind CSS 4

**App Router structure (`src/app/`):**
- `api/auth/[...nextauth]/route.ts` — NextAuth route handler (GitHub OAuth, JWT sessions, PrismaAdapter)
- `api/posts/route.ts` — GET (feed) and POST (create) posts
- `api/posts/[id]/like/route.ts` — POST toggle like
- `api/posts/[id]/comments/route.ts` — GET and POST comments
- `providers.tsx` — Client-side SessionProvider wrapper
- `layout.tsx` — Root layout (Syne + Manrope fonts)
- `page.tsx` — Home page with post feed
- `submit/page.tsx` — Text joke submission form (requires auth)

**Components (`src/components/`):**
- `NavBar.tsx` — Sticky glass nav with logo, auth, avatar dropdown
- `PostCard.tsx` — Card component with author info, content, actions
- `LikeButton.tsx` — Animated like toggle with optimistic updates
- `CommentSection.tsx` — Expandable inline comments with reply form
- `LoadingSkeleton.tsx` — Shimmer skeleton cards for loading states
- `EmptyState.tsx` — Fun empty state with CTA

**Data layer (`prisma/schema.prisma`):**
- Content models: Post, Comment, Like
- Auth models: User, Account, Session, VerificationToken (NextAuth)
- Posts have a `type` field (image/text) and relate to User, Comment, Like

**Lib (`src/lib/`):**
- `supabase.ts` — Supabase client initialization
- `prisma.ts` — Prisma client singleton

**Auth flow:** GitHub OAuth → NextAuth with PrismaAdapter → JWT session strategy. User ID is injected into the JWT via session callbacks.

## Design System

**Aesthetic:** Dark neo-brutalist with electric accents. Dark-first, no light mode.

**Color tokens (CSS custom properties in `globals.css`):**
- Backgrounds: `--bg-base` (#0B0B0F), `--bg-surface` (#141418), `--bg-surface-hover`, `--bg-surface-raised`
- Text: `--text-primary` (#F0F0F5), `--text-secondary` (#8888A0), `--text-tertiary`
- Accents: `--accent-lime` (#BEFF00), `--accent-pink` (#FF3366), `--accent-indigo` (#5B5FFF)

**Fonts:**
- Display: **Syne** (headings, brand, `font-display` / `--font-syne`)
- Body: **Manrope** (text, UI, `font-sans` / `--font-manrope`)
- Mono: **Geist Mono** (`font-mono` / `--font-geist-mono`)

**CSS utilities (defined in `globals.css`):**
- `.btn-primary` / `.btn-ghost` — Button styles with hover/active states
- `.glass` — Glassmorphism with backdrop blur
- `.text-gradient-lime` / `.text-gradient-fire` — Gradient text effects
- `.animate-*` — fade-in, slide-up, shimmer, bounce-in, wiggle, float, etc.
- `.stagger-children` — Staggered entrance animations for lists

**Tailwind theme tokens** (via `@theme inline`): `color-surface`, `color-lime`, `color-pink`, `color-indigo`, `color-border`, `color-text-*`, `font-display`

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- React Compiler is enabled via Babel plugin (`next.config.ts`)
- TypeScript strict mode is on
- ESLint uses flat config (ESLint 9) with `next/core-web-vitals` and `next/typescript`
- Client components must use `"use client"` directive
- Custom components over shadcn/ui for full design control; shadcn can be added later for utility components (dialogs, toasts)
- Copy/microcopy should be casual and Gen Z-friendly ("Drop a banger", "Send it", not "Submit Post")

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string (Supabase)
- `NEXTAUTH_SECRET` — JWT signing secret
- `GITHUB_ID` / `GITHUB_SECRET` — GitHub OAuth credentials

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
