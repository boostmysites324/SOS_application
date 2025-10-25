async function sendVerificationEmail(email, token, name) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  // In development, just log to console
  // In production, you would use nodemailer or another email service
  console.log('\n========== EMAIL VERIFICATION ==========');
  console.log(`To: ${email}`);
  console.log(`Subject: Verify Your Email - SOS Application`);
  console.log(`\nHi ${name || 'User'},\n`);
  console.log(`Thank you for registering! Please verify your email by clicking the link below:\n`);
  console.log(verificationUrl);
  console.log(`\nThis link will expire in 24 hours.\n`);
  console.log(`If you didn't create this account, please ignore this email.`);
  console.log('=========================================\n');
  
  return Promise.resolve();
}

module.exports = { sendVerificationEmail };


