# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1️⃣ Clone Repository
```bash
git clone https://github.com/boostmysites324/SOS_application.git
cd SOS_application
```

### 2️⃣ Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 3️⃣ Setup Environment
```bash
# Frontend
echo "VITE_API_BASE=http://localhost:4000" > .env

# Backend
cd server
cp env.example .env
cd ..
```

### 4️⃣ Start Backend
```bash
cd server
npm run dev
```
✅ Backend running on **http://localhost:4000**

### 5️⃣ Start Frontend (New Terminal)
```bash
npm run dev
```
✅ Frontend running on **http://localhost:5173**

### 6️⃣ Create Demo Account (Optional)
```bash
# Windows
powershell -ExecutionPolicy Bypass -File setup-demo.ps1

# Mac/Linux
chmod +x setup-demo.sh
./setup-demo.sh
```

---

## 🔑 Demo Credentials

### Quick Test Account
```
Email: demo@example.com
Password: Demo@123
Employee ID: EMP-DEMO
```

### More Test Accounts
```
john.doe@example.com | EMP-1001 | Demo@123
jane.smith@example.com | EMP-1002 | Demo@123
mike.johnson@example.com | EMP-1003 | Demo@123
```

📖 **See:** [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)

---

## 📝 Usage Flow

### Register New User
1. Open **http://localhost:5173/register**
2. Fill in details:
   - Full Name
   - Employee ID (e.g., EMP-1001)
   - Email
   - Password
3. Click **Sign Up**

### Verify Email
1. Check **backend console** for verification link
2. **Copy** the link
3. **Paste** in browser
4. See "Email Verified!" message

### Login
1. Open **http://localhost:5173/login**
2. Enter **Email** or **Employee ID**
3. Enter **Password**
4. Click **Login**

### Test SOS Alert
1. Go to **Home Screen**
2. **Press and hold** SOS button for 3 seconds
3. Alert sent! Check **Notifications** page

---

## 🛠️ Common Commands

```bash
# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# Build frontend
npm run build

# Setup demo accounts
powershell -File setup-demo.ps1  # Windows
./setup-demo.sh                   # Mac/Linux

# Check backend health
curl http://localhost:4000/api/health

# Reset database
echo "[]" > server/data/users.json
echo "[]" > server/data/notifications.json
echo "[]" > server/data/sos.json
```

---

## 🎯 Key URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:4000 |
| **API Health** | http://localhost:4000/api/health |
| **GitHub Repo** | https://github.com/boostmysites324/SOS_application |

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [README.md](./README.md) | Complete overview & features |
| [SETUP.md](./SETUP.md) | Detailed setup instructions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel/Railway/Render |
| [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md) | All test accounts |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fix common issues |
| [EMAIL_VERIFICATION_GUIDE.md](./EMAIL_VERIFICATION_GUIDE.md) | Email verification details |

---

## ⚠️ Troubleshooting

### Backend not starting?
```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

### Frontend not connecting?
1. Check `.env` has `VITE_API_BASE=http://localhost:4000`
2. Verify backend is running
3. Hard refresh browser (Ctrl+Shift+R)

### "Failed to fetch" error?
1. Backend running? Check: `curl http://localhost:4000/api/health`
2. CORS issue? Check `server/.env` has correct `CORS_ORIGIN`
3. Restart both servers

### Email not verifying?
1. Check backend console for verification link
2. Copy entire URL including token
3. Open in browser
4. Or manually edit `server/data/users.json` and set `emailVerified: true`

---

## 🆘 Need Help?

- **Issues?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Setup?** Check [SETUP.md](./SETUP.md)
- **Deploy?** Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Report Bug:** [GitHub Issues](https://github.com/boostmysites324/SOS_application/issues)

---

## ✅ Success Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] API health check returns OK
- [ ] Demo accounts created (optional)
- [ ] Able to register new user
- [ ] Email verification link appears in console
- [ ] Can login after verification
- [ ] SOS button works
- [ ] Notifications load

---

**You're all set! Start building! 🎉**

