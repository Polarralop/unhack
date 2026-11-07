# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Medical communication platform: doctors share diagnostic results; patients receive, understand and acknowledge them, and raise concerns. Currently a **clickable prototype on mock data**. See `README.md` and `docs/product-brief.md`.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Node 24, npm.

## Rules

- Never use or generate realistic-looking real patient data; mock data must be obviously synthetic.
- Never commit secrets or `.env*` files (except `.env.example`).
- Patient-facing copy must be plain-language and non-alarming; avoid jargon or explain it.
- Prototype first: prefer simple, readable code over abstraction. Things will be refined later.
