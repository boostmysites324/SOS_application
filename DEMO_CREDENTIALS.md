# 🔑 Demo Credentials

## Test Accounts

### Account 1 - John Doe (Admin)
```
Email: john.doe@example.com
Employee ID: EMP-1001
Password: Demo@123
Name: John Doe
```

### Account 2 - Jane Smith (Security)
```
Email: jane.smith@example.com
Employee ID: EMP-1002
Password: Demo@123
Name: Jane Smith
```

### Account 3 - Mike Johnson (Employee)
```
Email: mike.johnson@example.com
Employee ID: EMP-1003
Password: Demo@123
Name: Mike Johnson
```

---

## ⚠️ Important Notes

### For Local Development

1. **These accounts don't exist by default**
   - You need to register them first
   - Or use the quick setup script below

2. **Email Verification Required**
   - After registration, check backend console for verification link
   - Copy and paste the link in your browser
   - Then you can login

### For Production/Demo

1. **Change these credentials immediately**
2. **Use strong passwords**
3. **Enable proper email service**

---

## 🚀 Quick Setup Script

Run this to create all demo accounts:

```bash
# Make sure backend is running on http://localhost:4000
# Then run:

# Account 1 - John Doe
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Demo@123",
    "name": "John Doe",
    "employeeId": "EMP-1001"
  }'

# Account 2 - Jane Smith
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "Demo@123",
    "name": "Jane Smith",
    "employeeId": "EMP-1002"
  }'

# Account 3 - Mike Johnson
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mike.johnson@example.com",
    "password": "Demo@123",
    "name": "Mike Johnson",
    "employeeId": "EMP-1003"
  }'
```

---

## 🔓 Bypass Email Verification (Development Only)

To skip email verification for demo accounts, manually edit the database:

1. **Open:** `server/data/users.json`
2. **Find your user**
3. **Set:** `"emailVerified": true`
4. **Remove:** `"verificationToken"` and `"verificationTokenExpiry"`

**Example:**
```json
{
  "id": "u_1234567890",
  "email": "john.doe@example.com",
  "employeeId": "EMP-1001",
  "name": "John Doe",
  "password": "$2a$10$...",
  "emailVerified": true,
  "verificationToken": null,
  "verificationTokenExpiry": null,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**⚠️ DO NOT do this in production!**

---

## 🧪 Testing Different Scenarios

### Test 1: Normal Registration Flow
1. Register with: `test1@example.com` / `Test@123`
2. Check backend console for verification link
3. Click verification link
4. Login with email or employee ID

### Test 2: Login with Employee ID
1. Use: `EMP-1001` instead of email
2. Password: `Demo@123`
3. Should work after email verification

### Test 3: SOS Alert
1. Login with any account
2. Go to home screen
3. Press and hold SOS button for 3 seconds
4. Check notifications page

### Test 4: Profile Update
1. Login
2. Go to profile page
3. Click "Edit Profile"
4. Change name
5. Verify changes persist

---

## 🎯 Quick Login for Testing

**Fastest way to test:**

1. **Register** a new account (any credentials)
2. **Check backend console** for verification link
3. **Copy the token** from the URL
4. **Manually verify** by visiting:
   ```
   http://localhost:3000/verify-email?token=YOUR_TOKEN_HERE
   ```
5. **Login** with your credentials

---

## 📋 Sample Data

### Sample Employee IDs
```
EMP-1001, EMP-1002, EMP-1003
EMP-2001, EMP-2002, EMP-2003
EMP-3001, EMP-3002, EMP-3003
```

### Sample Email Format
```
firstname.lastname@example.com
employee.id@company.com
user.name@demo.app
```

### Sample Passwords
```
Demo@123
Test@2024
Secure@Pass
```

**Note:** All passwords must contain:
- At least 6 characters
- (Recommended: uppercase, lowercase, number, special char)

---

## 🔐 Security Best Practices

### For Demo/Staging:
- ✅ Use simple passwords like `Demo@123`
- ✅ Use fake emails like `demo@example.com`
- ✅ Reset database regularly
- ✅ Don't store sensitive data

### For Production:
- ❌ Never use demo credentials
- ✅ Require strong passwords (8+ chars, mixed case, numbers, symbols)
- ✅ Enable real email verification
- ✅ Add rate limiting
- ✅ Enable HTTPS only
- ✅ Use secure JWT secrets
- ✅ Implement password reset
- ✅ Add two-factor authentication (optional)

---

## 🆘 Quick Test Account

**Need a quick test? Use this:**

```
Login: demo@example.com
Password: Demo@123
Employee ID: EMP-DEMO
```

**To create:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo@123",
    "name": "Demo User",
    "employeeId": "EMP-DEMO"
  }'
```

Then manually set `emailVerified: true` in `server/data/users.json`

---

## 📞 Support

Having issues with credentials?
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Verify backend is running: `curl http://localhost:4000/api/health`
- Clear localStorage: `localStorage.clear()` in browser console
- Reset database: `echo "[]" > server/data/users.json`

---

**Happy Testing! 🎉**

