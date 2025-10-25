const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readJson, writeJson } = require('../utils/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

function issueToken(userId) {
  const payload = { sub: userId };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/register', async (req, res) => {
  const { email, password, name, employeeId } = req.body || {};
  if ((!email && !employeeId) || !password) {
    return res.status(400).json({ error: 'email or employeeId and password are required' });
  }
  const db = await readJson('users.json', []);
  const existsByEmail = email ? db.find((u) => u.email?.toLowerCase() === String(email).toLowerCase()) : null;
  if (existsByEmail) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const existsByEmp = employeeId ? db.find((u) => u.employeeId === String(employeeId)) : null;
  if (existsByEmp) {
    return res.status(409).json({ error: 'Employee ID already registered' });
  }
  const hashed = await hashPassword(password);
  const verificationToken = generateVerificationToken();
  const newUser = {
    id: `u_${Date.now()}`,
    email: email || null,
    employeeId: employeeId || null,
    name: name || '',
    password: hashed,
    emailVerified: false,
    verificationToken,
    verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    createdAt: new Date().toISOString(),
  };
  db.push(newUser);
  await writeJson('users.json', db);
  
  // Send verification email (in dev mode, just log it)
  if (email) {
    await sendVerificationEmail(email, verificationToken, name);
  }
  
  return res.status(201).json({ 
    message: 'Registration successful. Please check your email to verify your account.',
    requiresVerification: !!email,
    user: { id: newUser.id, email: newUser.email, employeeId: newUser.employeeId, name: newUser.name }
  });
});

router.post('/login', async (req, res) => {
  const { email, employeeId, password } = req.body || {};
  if ((!email && !employeeId) || !password) {
    return res.status(400).json({ error: 'email or employeeId and password are required' });
  }
  const db = await readJson('users.json', []);
  let user = null;
  if (email) {
    user = db.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
  } else if (employeeId) {
    user = db.find((u) => u.employeeId === String(employeeId));
  }
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  
  // Check email verification
  if (user.email && !user.emailVerified) {
    return res.status(403).json({ 
      error: 'Email not verified',
      message: 'Please verify your email before logging in. Check your email for the verification link.',
      requiresVerification: true
    });
  }
  
  const token = issueToken(user.id);
  return res.json({ token, user: { id: user.id, email: user.email, employeeId: user.employeeId, name: user.name } });
});

// Verify email endpoint
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  const db = await readJson('users.json', []);
  const userIndex = db.findIndex((u) => u.verificationToken === token);
  
  if (userIndex === -1) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }
  
  const user = db[userIndex];
  
  // Check if token is expired
  if (new Date(user.verificationTokenExpiry) < new Date()) {
    return res.status(400).json({ error: 'Verification token has expired' });
  }
  
  // Mark as verified
  db[userIndex] = {
    ...user,
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpiry: null,
    verifiedAt: new Date().toISOString(),
  };
  
  await writeJson('users.json', db);
  
  return res.json({ 
    message: 'Email verified successfully! You can now log in.',
    success: true
  });
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const db = await readJson('users.json', []);
  const userIndex = db.findIndex((u) => u.email?.toLowerCase() === String(email).toLowerCase());
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const user = db[userIndex];
  
  if (user.emailVerified) {
    return res.status(400).json({ error: 'Email already verified' });
  }
  
  // Generate new token
  const verificationToken = generateVerificationToken();
  db[userIndex] = {
    ...user,
    verificationToken,
    verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  await writeJson('users.json', db);
  await sendVerificationEmail(email, verificationToken, user.name);
  
  return res.json({ 
    message: 'Verification email sent. Please check your email.',
    success: true
  });
});

module.exports = router;



