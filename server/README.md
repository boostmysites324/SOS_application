# SOS Backend Server

Express.js backend for the SOS Emergency Alert Application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `env.example`):
   ```bash
   cp env.example .env
   ```

3. Configure environment variables in `.env`

4. Start server:
   ```bash
   npm run dev   # development
   npm start     # production
   ```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/profile` - Get profile (auth required)
- `PUT /api/profile` - Update profile (auth required)
- `POST /api/sos/start` - Start SOS alert (auth required)
- `POST /api/sos/cancel` - Cancel SOS (auth required)
- `GET /api/notifications` - Get notifications (auth required)

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `node index.js`
5. Add environment variables from `.env`

The server includes a self-ping mechanism to prevent Render free tier from sleeping. It automatically pings `/api/health` every 30 seconds when `RENDER_EXTERNAL_URL` or `SERVER_URL` is set.

## Environment Variables

See `env.example` for required variables.
