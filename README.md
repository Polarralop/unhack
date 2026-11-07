# unhack

A platform for doctors to share diagnostic results with patients — and make sure those results are **received**, **understood**, and that patient **concerns get addressed**.

> **Status:** early prototype. Everything runs on mock data. Do not enter real patient information.

## The core loop

1. **Doctor shares a result** — a lab, imaging or other diagnostic report, with a plain-language summary and next steps.
2. **Patient receives it** — notified, opens it, and the platform records that it was delivered and viewed.
3. **Patient confirms understanding** — acknowledges the result, optionally answering a short comprehension check.
4. **Patient raises concerns** — asks questions or flags worries tied to that specific result.
5. **Doctor responds** — sees which results are unread, unacknowledged or have open concerns, and closes the loop.

See [docs/product-brief.md](docs/product-brief.md) for scope and open questions.

## Planned stack (prototype)

| Concern    | Choice                              |
| ---------- | ----------------------------------- |
| Framework  | Next.js (App Router) + TypeScript   |
| Styling    | Tailwind CSS                        |
| Data       | In-memory mock data (no backend yet)|
| Runtime    | Node 24 (see `.nvmrc`)              |

## Getting started

_The app has not been scaffolded yet. Instructions will be added once it is._

## Data & privacy

This project will eventually handle protected health information (PHI). From day one:

- Never commit real patient data, credentials or `.env` files.
- Use only synthetic/mock data in fixtures, screenshots and demos.
- Compliance requirements (HIPAA / PHIPA / PIPEDA, depending on deployment) will be scoped before any real data is handled.
