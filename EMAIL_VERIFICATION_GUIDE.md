# ✅ Email Verification is Now Required!

## What Changed?

Users can NO LONGER automatically log in after registration. They MUST verify their email first.

## How It Works (Step by Step)

### Step 1: Register
1. Go to http://localhost:3000/register (or your frontend port)
2. Fill in:
   - **Full Name**: Test User
   - **Employee ID**: EMP-1001
   - **Email**: test@example.com
   - **Password**: Password123!
3. Click **Sign Up**
4. You'll see: **"Registration successful! Please check your email to verify your account before logging in."**
5. You'll be redirected to the login page

### Step 2: Get Verification Link
**In Development Mode:**
- The verification email is NOT sent to your real email
- Instead, it's printed in the **backend server console** (terminal)
- Look for something like this:

```
========== EMAIL VERIFICATION ==========
To: test@example.com
Subject: Verify Your Email - SOS Application

Hi Test User,

Thank you for registering! Please verify your email by clicking the link below:

http://localhost:3000/verify-email?token=abc123def456...

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.
=========================================
```

### Step 3: Verify Email
1. **Copy** the verification URL from the console
2. **Paste** it into your browser
3. You'll see: **"Email Verified!"**
4. After 3 seconds, you'll be automatically redirected to login

### Step 4: Login
1. Now you can log in with:
   - **Email or Employee ID**: test@example.com (or EMP-1001)
   - **Password**: Password123!
2. Click **Login**
3. ✅ Success! You'll be logged in and redirected to home screen

## What Happens If You Try to Login Before Verifying?

If you try to log in without verifying your email, you'll get:

```
❌ Email not verified
Please verify your email before logging in. Check your email for the verification link.
```

## Backend API Changes

### Register Response (Changed)
**Before:**
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

**After (Now):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "requiresVerification": true,
  "user": { "id": "...", "email": "...", "employeeId": "...", "name": "..." }
}
```
**Note**: NO token is returned until email is verified!

### Login Response
**If email not verified (403 error):**
```json
{
  "error": "Email not verified",
  "message": "Please verify your email before logging in. Check your email for the verification link.",
  "requiresVerification": true
}
```

**If email verified (200 success):**
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

## New API Endpoints

### 1. Verify Email
```
GET /api/auth/verify-email/:token
```
**Response:**
```json
{
  "message": "Email verified successfully! You can now log in.",
  "success": true
}
```

### 2. Resend Verification Email
```
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "Verification email sent. Please check your email.",
  "success": true
}
```

## Frontend Changes

### New Page: `/verify-email`
- Shows loading spinner while verifying
- Shows success message if verification succeeds
- Shows error message if token is invalid/expired
- Auto-redirects to login after success

### Register Page
- Now shows verification message after signup
- Redirects to login instead of home-screen
- No longer stores auth token immediately

### API Client (`src/lib/api.ts`)
- `Auth.register()` now returns the full response (not just user)
- Only stores token if email verification is not required

## User Database Schema

### New Fields Added to Users:
```javascript
{
  id: "u_1234567890",
  email: "user@example.com",
  employeeId: "EMP-1001",
  name: "Test User",
  password: "hashed_password",
  
  // NEW FIELDS:
  emailVerified: false,                    // boolean
  verificationToken: "abc123...",          // hex string
  verificationTokenExpiry: "2024-...",     // ISO date (24 hours)
  verifiedAt: "2024-...",                  // ISO date (set when verified)
  
  createdAt: "2024-..."
}
```

## Testing the Flow

### Quick Test:
```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test","employeeId":"EMP-1001"}'

# Response: { "message": "Registration successful...", "requiresVerification": true }

# 2. Check server console for verification link

# 3. Copy token from console and verify
curl http://localhost:4000/api/auth/verify-email/YOUR_TOKEN_HERE

# Response: { "message": "Email verified successfully!", "success": true }

# 4. Now login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Response: { "token": "jwt_here", "user": {...} }
```

## Production Deployment

In production, you'll want to:

1. **Use a real email service** (replace `server/src/utils/email.js`):
   - Nodemailer + Gmail/SendGrid/AWS SES
   - Or use a service like Postmark, Mailgun

2. **Update FRONTEND_URL** in `server/.env`:
   ```
   FRONTEND_URL=https://yourapp.com
   ```

3. **Set proper JWT secrets** in `server/.env`:
   ```
   JWT_SECRET=your-super-secure-secret-key-here
   ```

4. **Optional: Reduce token expiry** for tighter security:
   ```
   JWT_EXPIRES=24h
   ```

## FAQ

**Q: Can users without email register?**
A: Yes, if they register with only `employeeId` and no `email`, they can log in immediately without verification.

**Q: What if verification link expires?**
A: User can request a new link via POST `/api/auth/resend-verification`

**Q: Can I skip email verification in development?**
A: Yes, manually set `emailVerified: true` in `server/data/users.json`, or register without email (employeeId only).

**Q: Where are verification tokens stored?**
A: In the user record in `server/data/users.json`

---

✅ **Email verification is now fully working!**


