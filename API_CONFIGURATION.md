# API Configuration Guide

## Problem: "Unable to resolve host" Error

If you're getting DNS resolution errors when trying to login or signup in the Android APK, follow these steps:

## Solution

### 1. Set Environment Variable

Create a `.env` file in the root directory (if it doesn't exist):

```env
VITE_API_BASE=https://sos-backend-l46b.onrender.com
```

**Important:** The `.env` file must be created BEFORE building the app. Environment variables are baked into the build at build time.

### 2. Rebuild the App

After setting the environment variable, you MUST rebuild the app:

```bash
# 1. Build the web app (this includes the environment variable)
npm run build

# 2. Sync with Capacitor
npm run cap:sync

# 3. Rebuild the Android APK in Android Studio
```

### 3. Verify Backend is Running

Test if the backend is accessible:

```bash
curl https://sos-backend-l46b.onrender.com/api/health
```

Should return: `{"status":"ok","service":"sos-backend"}`

### 4. Check Network Configuration

The app is configured to:
- ✅ Allow HTTPS connections to `sos-backend-l46b.onrender.com`
- ✅ Allow HTTPS connections to `*.onrender.com` domains
- ✅ Use system certificates for SSL verification
- ✅ Block cleartext (HTTP) traffic for security

## Troubleshooting

### Error: "Unable to resolve host"

**Causes:**
1. Environment variable not set before build
2. Backend server is down
3. Network connectivity issues
4. DNS resolution problems on device

**Solutions:**
1. **Check environment variable is set:**
   ```bash
   cat .env
   # Should show: VITE_API_BASE=https://sos-backend-l46b.onrender.com
   ```

2. **Rebuild the app:**
   ```bash
   npm run build
   npm run cap:sync
   ```
   Then rebuild in Android Studio.

3. **Test backend connectivity:**
   ```bash
   curl https://sos-backend-l46b.onrender.com/api/health
   ```

4. **Check device internet connection:**
   - Ensure device has internet access
   - Try opening the URL in device browser

### Error: "Connection timeout"

**Causes:**
- Backend server is sleeping (Render free tier)
- Network firewall blocking connection

**Solutions:**
- Wait a few seconds and try again (Render wakes up on first request)
- Check if backend is running: `curl https://sos-backend-l46b.onrender.com/api/health`

### Using a Different Backend URL

If you're using a different backend (e.g., Railway, Heroku, or local server):

1. **Update `.env` file:**
   ```env
   VITE_API_BASE=https://your-backend-url.railway.app
   # OR for local development:
   # VITE_API_BASE=http://localhost:4000
   ```

2. **Update network security config** (if using localhost or custom domain):
   Edit `android/app/src/main/res/xml/network_security_config.xml` and add your domain.

3. **Rebuild:**
   ```bash
   npm run build
   npm run cap:sync
   ```

## For Production Builds

When building the production APK:

1. Set `VITE_API_BASE` to your production backend URL
2. Build: `npm run build`
3. Sync: `npm run cap:sync`
4. Build APK in Android Studio (Release build)

## Current Configuration

- **Backend URL:** `https://sos-backend-l46b.onrender.com`
- **API Base:** Configured via `VITE_API_BASE` environment variable
- **Fallback:** If env var not set, uses `https://sos-backend-l46b.onrender.com`
- **Network Security:** HTTPS only, system certificates trusted

## Debugging

The app logs the API base URL on startup. Check Android Logcat for:
```
[API] Final API_BASE configured: https://sos-backend-l46b.onrender.com
```

If you see a warning about using fallback, the environment variable wasn't set during build.

