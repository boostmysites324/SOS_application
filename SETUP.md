# SOS Application - Setup Instructions

## Backend is NOW RUNNING ✅

The backend server is already running on **http://localhost:4000**

## ✅ Email Verification Now Required

After registering, users MUST verify their email before logging in. The verification link will be shown in the **server console** (for development).

## Running Your Frontend

### Option 1: Vite (Port 5173)
```bash
npm run dev
```
Then open http://localhost:5173

### Option 2: Any other dev server (Port 3000)
If your frontend is on http://localhost:3000, it will work automatically.

## What's Fixed

✅ Backend running on port 4000
✅ CORS configured to allow:
   - http://localhost:3000
   - http://localhost:5173
   - http://127.0.0.1:3000
   - http://127.0.0.1:5173

✅ `.env` file created with `VITE_API_BASE=http://localhost:4000`
✅ Register and Login endpoints tested and working

## Usage Flow

### 1. Register
- Fill in Full Name, Employee ID, Email, Password
- Click Sign Up
- **You'll see a message**: "Registration successful! Please check your email to verify your account."

### 2. Verify Email
- Check the **backend server console** (terminal where you ran `node index.js`)
- You'll see a verification link like: `http://localhost:3000/verify-email?token=abc123...`
- **Copy this URL** and paste it into your browser
- You'll see "Email Verified!" message
- Will automatically redirect to login page

### 3. Login
- Now you can log in with your email (or employee ID) and password
- If you try to login before verifying, you'll get: "Email not verified"

## API Endpoints

### Register (Now requires email verification)
- **URL**: POST http://localhost:4000/api/auth/register
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "YourPassword123!",
  "name": "Your Name",
  "employeeId": "EMP-1001"
}
```
- **Response**: 
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "requiresVerification": true,
  "user": { ... }
}
```

### Verify Email
- **URL**: GET http://localhost:4000/api/auth/verify-email/:token
- **Response**: 
```json
{
  "message": "Email verified successfully! You can now log in.",
  "success": true
}
```

### Resend Verification
- **URL**: POST http://localhost:4000/api/auth/resend-verification
- **Body**:
```json
{
  "email": "user@example.com"
}
```

### Login (Checks email verification)
- **URL**: POST http://localhost:4000/api/auth/login
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "YourPassword123!"
}
```
- **If not verified**: Returns 403 with error message

## Troubleshooting

### Still getting "Failed to fetch"?

1. **Check backend is running**:
   Open http://localhost:4000/api/health in your browser.
   You should see: `{"status":"ok","service":"sos-backend"}`

2. **Restart your frontend dev server**:
   ```bash
   # Stop your current dev server (Ctrl+C)
   npm run dev
   ```

3. **Hard refresh your browser**:
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

4. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any CORS or network errors
   - Share the exact error message

### Backend crashed?

Restart it:
```bash
cd server
node index.js
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/profile` - Get profile (requires auth)
- `PUT /api/profile` - Update profile (requires auth)
- `GET /api/notifications` - List notifications (requires auth)
- `POST /api/notifications/:id/read` - Mark as read (requires auth)
- `POST /api/sos/start` - Start SOS (requires auth)
- `POST /api/sos/cancel` - Cancel SOS (requires auth)
- `GET /api/sos/active` - Get active SOS (requires auth)

## Authentication

After login/register, you'll receive a JWT token. Store it in `localStorage` as `auth_token` and send it in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

The frontend is already configured to do this automatically.

