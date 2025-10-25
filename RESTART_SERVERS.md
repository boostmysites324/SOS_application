# 🔄 How to Restart Servers

## ⚠️ IMPORTANT: You MUST restart after changing .env files!

When you create or modify `.env` files, Vite doesn't automatically reload them. You need to restart the dev server.

---

## 🟢 Start Backend (Terminal 1)

### Option 1: Using npm script
```bash
cd server
npm run dev
```

### Option 2: Direct node
```bash
cd server
node index.js
```

### Windows PowerShell (New Window)
```powershell
cd server
node index.js
```

**✅ You should see:**
```
SOS backend listening on http://localhost:4000
```

---

## 🔵 Start Frontend (Terminal 2)

**⚠️ STOP your current frontend dev server first (Ctrl+C)**

Then restart:

```bash
npm run dev
```

**✅ You should see:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Verify Everything is Working

### 1. Test Backend
Open in browser: http://localhost:4000/api/health

Should show:
```json
{"status":"ok","service":"sos-backend"}
```

### 2. Test Frontend
Open in browser: http://localhost:5173

Should load the login page.

### 3. Test API Connection
Open browser console (F12) and run:
```javascript
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Backend error:', e))
```

Should show: `✅ Backend connected: {status: "ok", service: "sos-backend"}`

---

## 🔧 Full Restart (If Still Not Working)

### Step 1: Stop Everything
```bash
# Press Ctrl+C in all terminal windows
# OR kill all node processes:

# Windows
Get-Process -Name node | Stop-Process -Force

# Mac/Linux
pkill node
```

### Step 2: Verify .env Files

**Root `.env`:**
```bash
cat .env
```
Should show:
```
VITE_API_BASE=http://localhost:4000
```

**Server `.env`:**
```bash
cat server/.env
```
Should show:
```
PORT=4000
JWT_SECRET=supersecret-change-in-production-2024
JWT_EXPIRES=7d
CORS_ORIGIN=*
```

### Step 3: Start Backend
```bash
cd server
node index.js
```

Wait for: `SOS backend listening on http://localhost:4000`

### Step 4: Start Frontend (New Terminal)
```bash
# Make sure you're in the root directory
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Step 5: Hard Refresh Browser
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

---

## 🎯 Quick Checklist

- [ ] Backend running on port 4000
- [ ] Frontend dev server restarted
- [ ] Browser hard refreshed
- [ ] .env file has `VITE_API_BASE=http://localhost:4000`
- [ ] server/.env has `CORS_ORIGIN=*`
- [ ] No firewall blocking localhost:4000
- [ ] No other apps using port 4000

---

## 🐛 Still Getting "Failed to Fetch"?

### Check 1: Backend Running?
```bash
curl http://localhost:4000/api/health
```

### Check 2: Frontend Using Correct URL?
Open browser console and type:
```javascript
console.log(import.meta.env.VITE_API_BASE)
```
Should show: `http://localhost:4000`

If it shows `undefined`, your frontend wasn't restarted after creating .env!

### Check 3: CORS Headers
Open browser DevTools → Network → Try to register → Look at the failed request:
- **Status 0** or **CORS error** = Backend CORS issue
- **404** = Wrong URL
- **Connection refused** = Backend not running

---

## 🔥 Nuclear Option (Reset Everything)

If nothing works:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Kill all node processes
# Windows:
Get-Process -Name node | Stop-Process -Force

# 3. Verify .env files exist
ls -la .env
ls -la server/.env

# 4. Restart backend in NEW terminal
cd server
node index.js

# 5. Wait 3 seconds, then start frontend in NEW terminal
npm run dev

# 6. Open browser in INCOGNITO mode
# Go to: http://localhost:5173/register

# 7. Open DevTools Console (F12)
# Look for any red errors
```

---

## 📞 Still Stuck?

Share these details:

1. **Backend status:**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Browser console error** (F12 → Console tab)

3. **Network tab error** (F12 → Network tab → Click failed request → Response)

4. **Are you accessing:**
   - ✅ http://localhost:5173 (or 3000)
   - ❌ file:/// (wrong - won't work)

---

## ✅ Working Setup Looks Like:

**Terminal 1 (Backend):**
```
SOS backend listening on http://localhost:4000
```

**Terminal 2 (Frontend):**
```
  VITE v7.1.11  ready in 432 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Browser:**
- Opens http://localhost:5173
- Shows login/register page
- No CORS errors in console
- Network tab shows successful API calls

---

**Restart your frontend dev server and try again!** 🔄

