# 🚨 SOS Application - Employee Safety Alert System

A complete **full-stack emergency alert application** with **React frontend** and **Express backend** featuring **email verification**, **JWT authentication**, **real-time SOS alerts**, and **notification management**.

🔗 **Repository:** [github.com/boostmysites324/SOS_application](https://github.com/boostmysites324/SOS_application)

---

## ✨ Features

### 🔐 **Authentication System**
- ✅ **Email verification required** before login
- ✅ JWT-based authentication with secure tokens
- ✅ Login with email or employee ID
- ✅ Bcrypt password hashing
- ✅ Token expiry management

### 🚨 **SOS Emergency System**
- Press & hold SOS button for 3 seconds
- Real-time location tracking (GPS)
- Instant alert to security team
- Active SOS status monitoring
- Cancel/resolve SOS alerts

### 📢 **Notifications**
- Real-time notifications for SOS events
- Mark notifications as read
- Filter by type (Emergency, Test, Info)
- Notification history

### 👤 **User Profile Management**
- View and update profile
- Employee ID and email management
- Account statistics (safe days, alerts sent, response time)

### 🎨 **Modern UI/UX**
- Beautiful gradient designs
- Smooth animations and transitions
- Responsive mobile-first design
- Tailwind CSS styling
- Dark mode compatible

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ React 19.1.0 with TypeScript
- 🎨 Tailwind CSS for styling
- 🧭 React Router DOM for navigation
- 🌐 i18next for internationalization
- ⚡ Vite for blazing-fast development

### **Backend**
- 🟢 Node.js with Express 5.1.0
- 🔐 JWT for authentication
- 🔒 bcryptjs for password hashing
- 📦 JSON file-based data storage
- 🌐 CORS enabled
- 📝 Morgan for request logging

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/boostmysites324/SOS_application.git
cd SOS_application
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 3. Configure Environment

**Frontend (root `.env`):**
```env
VITE_API_BASE=http://localhost:4000
```

**Backend (`server/.env`):**
```bash
cp server/env.example server/.env
```

Edit `server/.env`:
```env
PORT=4000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 4. Run Application

**Start Backend (Terminal 1):**
```bash
cd server
npm run dev
```

Backend runs on: **http://localhost:4000**

**Start Frontend (Terminal 2):**
```bash
npm run dev
```

Frontend runs on: **http://localhost:5173** (or your configured port)

---

## 🔑 API Endpoints

### **Authentication**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/verify-email/:token` | Verify email | ❌ |
| POST | `/api/auth/resend-verification` | Resend verification email | ❌ |

### **Profile**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get user profile | ✅ |
| PUT | `/api/profile` | Update profile | ✅ |

### **Notifications**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | List notifications | ✅ |
| POST | `/api/notifications/:id/read` | Mark as read | ✅ |

### **SOS**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/sos/start` | Start SOS alert | ✅ |
| POST | `/api/sos/cancel` | Cancel SOS alert | ✅ |
| GET | `/api/sos/active` | Get active SOS | ✅ |

---

## 📧 Email Verification Flow

### Development Mode
1. **Register** with email, password, name, and employee ID
2. **Check backend console** for verification link
3. **Copy the link** and paste in browser
4. **Email verified!** - Now you can login

### Production Mode
- Configure a real email service (Nodemailer + SMTP)
- Update `server/src/utils/email.js`
- Use services like SendGrid, AWS SES, or Postmark

---

## 🗂️ Project Structure

```
SOS_application/
├── src/                        # Frontend source
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   │   ├── login/            
│   │   ├── register/         
│   │   ├── verify-email/     
│   │   ├── home-screen/      
│   │   ├── sos-active/       
│   │   ├── notifications/    
│   │   └── profile/          
│   ├── lib/                   # API client & utilities
│   ├── router/                # Routing configuration
│   └── i18n/                  # Internationalization
│
├── server/                     # Backend source
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js       
│   │   │   ├── profile.js    
│   │   │   ├── notifications.js
│   │   │   └── sos.js        
│   │   ├── middleware/        # Auth middleware
│   │   ├── utils/             # Helpers (DB, email, password)
│   │   └── app.js            # Express app
│   ├── data/                  # JSON database files
│   └── index.js              # Server entry point
│
├── EMAIL_VERIFICATION_GUIDE.md  # Email verification docs
├── SETUP.md                      # Setup instructions
└── README.md                     # This file
```

---

## 🧪 Usage Example

### 1. Register New User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "employeeId": "EMP-1001"
  }'
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "requiresVerification": true,
  "user": {
    "id": "u_1234567890",
    "email": "john@example.com",
    "employeeId": "EMP-1001",
    "name": "John Doe"
  }
}
```

### 2. Verify Email
Check the **backend console** for the verification link:
```
http://localhost:3000/verify-email?token=abc123def456...
```

Visit the link in your browser.

### 3. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u_1234567890",
    "email": "john@example.com",
    "employeeId": "EMP-1001",
    "name": "John Doe"
  }
}
```

### 4. Start SOS Alert
```bash
curl -X POST http://localhost:4000/api/sos/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_BASE` to your backend URL

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Install dependencies: `cd server && npm install`
3. Start: `node index.js`
4. Ensure PORT is set by platform

---

## 📝 Key Files

- **`EMAIL_VERIFICATION_GUIDE.md`** - Complete email verification documentation
- **`SETUP.md`** - Detailed setup and troubleshooting guide
- **`server/README.md`** - Backend API documentation
- **`.env.example`** - Environment variable template

---

## 🔒 Security Features

✅ JWT with secure secret keys  
✅ Password hashing with bcrypt (salt rounds: 10)  
✅ Email verification before login  
✅ Token expiration (configurable)  
✅ CORS protection  
✅ Auth middleware for protected routes  

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**boostmysites324**

- GitHub: [@boostmysites324](https://github.com/boostmysites324)
- Repository: [SOS_application](https://github.com/boostmysites324/SOS_application)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

---

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on [GitHub](https://github.com/boostmysites324/SOS_application)!

---

## 📞 Support

For issues or questions:
- Open an issue on [GitHub Issues](https://github.com/boostmysites324/SOS_application/issues)
- Check `SETUP.md` for troubleshooting

---

**Made with ❤️ for Employee Safety**

