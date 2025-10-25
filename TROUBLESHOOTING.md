# 🔧 Troubleshooting Guide

## Vercel Deployment Issues

### ❌ Error: "Failed to resolve /preview-inject/index.ts"
**Solution:** ✅ Fixed in latest commit
- Removed invalid script reference from `index.html`
- Pull latest changes: `git pull origin main`

### ❌ Error: "No Output Directory named 'dist' found"
**Solution:** ✅ Fixed in latest commit
- Changed `vite.config.ts` to output to `dist` instead of `out`
- Pull latest changes: `git pull origin main`

### ⚠️ Warning: "RouteObject is not exported"
**Status:** This is a warning, NOT an error
- Build still succeeds
- Safe to ignore
- Doesn't affect functionality

### ❌ Error: "Build timeout"
**Causes:**
- node_modules being uploaded (check .gitignore)
- Slow network connection
- Large dependencies

**Solution:**
1. Ensure `.gitignore` includes `node_modules/`
2. Check build logs for slow operations
3. Increase Vercel timeout in settings (Pro plan)

---

## Backend Deployment Issues

### ❌ Error: "Cannot find module"
**Cause:** Dependencies not installed

**Solution:**
```bash
cd server
npm install
```

### ❌ Error: "Port already in use"
**Cause:** Another process using port 4000

**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### ❌ Error: "JWT secret not configured"
**Cause:** Missing environment variables

**Solution:**
Create `server/.env`:
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
```

---

## Frontend Connection Issues

### ❌ Error: "Failed to fetch" or "Network Error"
**Causes:**
1. Backend not running
2. Wrong API URL
3. CORS issues

**Solution:**
1. **Check backend is running:**
   ```bash
   curl http://localhost:4000/api/health
   ```
   Should return: `{"status":"ok","service":"sos-backend"}`

2. **Verify API URL in `.env`:**
   ```env
   VITE_API_BASE=http://localhost:4000
   ```

3. **Check CORS in `server/.env`:**
   ```env
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```

4. **Restart both servers:**
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   npm run dev
   ```

### ❌ Error: "Email not verified"
**Cause:** User trying to login before verifying email

**Solution:**
1. Check backend console for verification link
2. Copy the link and open in browser
3. After "Email Verified!" message, try login again

---

## Database Issues

### ❌ Error: "Cannot read property of undefined"
**Cause:** Empty or corrupted JSON database files

**Solution:**
Reset database files:
```bash
echo "[]" > server/data/users.json
echo "[]" > server/data/notifications.json
echo "[]" > server/data/sos.json
```

### ❌ Error: "ENOENT: no such file or directory"
**Cause:** Data directory doesn't exist

**Solution:**
```bash
mkdir -p server/data
echo "[]" > server/data/users.json
echo "[]" > server/data/notifications.json
echo "[]" > server/data/sos.json
```

---

## Build Issues

### ❌ Error: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: "TypeScript error"
**Solution:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run build
```

### ⚠️ Warning: "Sourcemap is larger than original"
**Status:** Safe to ignore
- Common with large bundles
- Doesn't affect production build

---

## Authentication Issues

### ❌ Error: "Invalid or expired token"
**Cause:** JWT token expired or invalid

**Solution:**
1. Login again to get new token
2. Check JWT_EXPIRES in server/.env
3. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

### ❌ Error: "Password hash failed"
**Cause:** bcrypt installation issue

**Solution:**
```bash
cd server
npm rebuild bcryptjs
```

---

## Development Environment

### ❌ Node version mismatch
**Error:** "Vite requires Node.js version 20.19+ or 22.12+"

**Solution:**
```bash
# Check version
node -v

# Update Node.js
# Windows: Download from nodejs.org
# Mac: brew install node@22
# Linux: nvm install 22
```

### ❌ Port conflicts
**Error:** "Port 3000 is already in use"

**Solution:**
1. **Change port in `vite.config.ts`:**
   ```typescript
   server: {
     port: 3001,
   }
   ```

2. **Or kill the process:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

---

## Quick Fixes

### Clear All Caches
```bash
# Frontend
rm -rf node_modules .vite dist
npm install

# Backend
cd server
rm -rf node_modules
npm install
```

### Reset Everything
```bash
# Stop all servers
# Then:
git pull origin main
rm -rf node_modules server/node_modules
npm install
cd server && npm install && cd ..
```

### Fresh Start
```bash
# Clone again
cd ..
rm -rf SOS_application
git clone https://github.com/boostmysites324/SOS_application.git
cd SOS_application
npm install
cd server && npm install && cd ..

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
npm run dev
```

---

## Still Having Issues?

1. **Check logs:**
   - Frontend: Browser Console (F12)
   - Backend: Server terminal output

2. **Verify environment:**
   - Node version: `node -v` (should be 20.19+ or 22.12+)
   - npm version: `npm -v`
   - Git status: `git status`

3. **Common checklist:**
   - [ ] Backend running on port 4000
   - [ ] Frontend running on port 3000/5173
   - [ ] `.env` files configured
   - [ ] Dependencies installed
   - [ ] No port conflicts
   - [ ] Latest code from GitHub

4. **Get help:**
   - Check [SETUP.md](./SETUP.md)
   - Check [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Open issue on [GitHub](https://github.com/boostmysites324/SOS_application/issues)

---

## Useful Commands

```bash
# Check if backend is running
curl http://localhost:4000/api/health

# Check frontend build
npm run build

# View build output
ls -lh dist/

# Check environment variables
cat .env
cat server/.env

# View server logs
cd server && npm run dev

# Test API endpoint
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'
```

---

**Most issues are resolved by restarting servers and clearing caches!** 🔄

