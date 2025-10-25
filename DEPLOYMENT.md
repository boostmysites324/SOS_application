# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/boostmysites324/SOS_application)

### Manual Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `boostmysites324/SOS_application`

2. **Configure Build Settings**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables**
   Add in Vercel Dashboard → Settings → Environment Variables:
   ```
   VITE_API_BASE=https://your-backend-url.railway.app
   ```
   (Replace with your actual backend URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-app.vercel.app`

### Troubleshooting Vercel Build

If build fails:

**Error: "Failed to resolve /preview-inject/index.ts"**
- ✅ Fixed in latest commit (removed invalid script reference)

**Error: "RouteObject not exported"**
- This is a warning only, build still succeeds
- Can be safely ignored

**Error: Build timeout**
- Check if node_modules are being uploaded (should be in .gitignore)
- Ensure dependencies are in package.json

---

## Backend Deployment (Railway/Render/Heroku)

### Railway (Recommended)

1. **Sign Up**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `boostmysites324/SOS_application`

3. **Configure**
   - Railway will auto-detect Node.js
   - Set **Start Command:** `cd server && node index.js`
   - Set **Build Command:** `cd server && npm install`

4. **Environment Variables**
   Add in Railway Dashboard:
   ```
   PORT=4000
   JWT_SECRET=your-super-secret-key-here-change-this
   JWT_EXPIRES=7d
   CORS_ORIGIN=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Get your backend URL from Railway dashboard
   - Update frontend `VITE_API_BASE` with this URL

### Render

1. **Create Web Service**
   - Go to [Render Dashboard](https://render.com/dashboard)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure**
   - **Name:** `sos-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

3. **Environment Variables**
   ```
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES=7d
   CORS_ORIGIN=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the URL (e.g., `https://sos-backend.onrender.com`)

### Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd server
   heroku create sos-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set JWT_EXPIRES=7d
   heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

---

## Complete Deployment Checklist

### ✅ Pre-Deployment

- [ ] Build succeeds locally: `npm run build`
- [ ] Backend runs locally: `cd server && npm start`
- [ ] Environment variables configured
- [ ] .gitignore includes node_modules
- [ ] .env files not committed

### ✅ Frontend (Vercel)

- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variable `VITE_API_BASE` set
- [ ] Build succeeds
- [ ] App accessible at Vercel URL

### ✅ Backend (Railway/Render)

- [ ] Service created
- [ ] All environment variables set
- [ ] PORT configured (auto-assigned or 4000)
- [ ] CORS_ORIGIN matches frontend URL
- [ ] Backend API responding

### ✅ Integration Test

- [ ] Frontend can reach backend API
- [ ] Register new user works
- [ ] Email verification link appears in logs
- [ ] Login works after verification
- [ ] SOS alert creation works
- [ ] Notifications load
- [ ] Profile update works

---

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_BASE=https://your-backend.railway.app
```

### Backend (server/.env)
```env
PORT=4000
JWT_SECRET=change-this-to-random-secure-string
JWT_EXPIRES=7d
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Domain Configuration (Optional)

### Custom Domain on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `sos-app.com`)
3. Follow DNS configuration instructions
4. Update backend `CORS_ORIGIN` with new domain

### Custom Domain on Railway

1. Go to Railway Dashboard → Your Project → Settings
2. Click "Add Domain"
3. Enter your custom domain
4. Configure DNS records as shown
5. Update frontend `VITE_API_BASE` with new domain

---

## Production Email Service

For production, replace the console email logger with a real service:

### Using SendGrid

1. **Install**
   ```bash
   cd server
   npm install @sendgrid/mail
   ```

2. **Update `server/src/utils/email.js`**
   ```javascript
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   async function sendVerificationEmail(email, token, name) {
     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
     
     const msg = {
       to: email,
       from: 'noreply@yourapp.com',
       subject: 'Verify Your Email - SOS Application',
       html: `
         <h1>Hi ${name},</h1>
         <p>Please verify your email by clicking the link below:</p>
         <a href="${verificationUrl}">${verificationUrl}</a>
         <p>This link expires in 24 hours.</p>
       `
     };
     
     await sgMail.send(msg);
   }
   ```

3. **Add Environment Variable**
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

---

## Monitoring & Logs

### Vercel Logs
- Dashboard → Your Project → Deployments → Click deployment → Logs

### Railway Logs
- Dashboard → Your Service → Deployments → View Logs

### Render Logs
- Dashboard → Your Service → Logs tab

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] No .env files in git
- [ ] CORS_ORIGIN is specific (not *)
- [ ] HTTPS enabled on both frontend and backend
- [ ] API rate limiting enabled (optional but recommended)
- [ ] Email verification required before login

---

## Support

For deployment issues:
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review logs in deployment platform
- Open issue on [GitHub](https://github.com/boostmysites324/SOS_application/issues)

---

**Your SOS Application is ready for production! 🎉**

