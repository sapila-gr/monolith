# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sapila is a meme-sharing platform built as a Next.js monolith with Supabase (PostgreSQL) backend, targeting sapila.gr.

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
- `providers.tsx` — Client-side SessionProvider wrapper
- `layout.tsx` — Root layout
- `page.tsx` — Home page with auth UI
- `submit/page.tsx` — Text joke submission form (requires auth)

**Data layer (`prisma/schema.prisma`):**
- Content models: Post, Comment, Like
- Auth models: User, Account, Session, VerificationToken (NextAuth)
- Posts have a `type` field (image/text) and relate to User, Comment, Like

**Lib (`src/lib/`):**
- `supabase.ts` — Supabase client initialization

**Auth flow:** GitHub OAuth → NextAuth with PrismaAdapter → JWT session strategy. User ID is injected into the JWT via session callbacks.

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- React Compiler is enabled via Babel plugin (`next.config.ts`)
- TypeScript strict mode is on
- ESLint uses flat config (ESLint 9) with `next/core-web-vitals` and `next/typescript`
- Client components must use `"use client"` directive

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string (Supabase)
- `NEXTAUTH_SECRET` — JWT signing secret
- `GITHUB_ID` / `GITHUB_SECRET` — GitHub OAuth credentials

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
