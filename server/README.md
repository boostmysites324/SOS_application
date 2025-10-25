# SOS Backend

Simple Express backend using JSON files for persistence.

## Setup

1. Copy `env.example` to `.env` and adjust values
2. Install deps: `npm i`
3. Run dev: `npm run dev`

## API

- `GET /api/health`
- `POST /api/auth/register` { email, password, name? }
- `POST /api/auth/login` { email, password }
- `GET /api/profile` (Bearer token)
- `PUT /api/profile` { name } (Bearer token)
- `GET /api/notifications` (Bearer token)
- `POST /api/notifications/:id/read` (Bearer token)
- `POST /api/sos/start` { latitude?, longitude? } (Bearer token)
- `POST /api/sos/cancel` (Bearer token)
- `GET /api/sos/active` (Bearer token)





