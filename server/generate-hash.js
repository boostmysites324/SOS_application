const bcrypt = require('bcryptjs');

const password = 'Demo@123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);

// Test verification
const isValid = bcrypt.compareSync(password, hash);
console.log('Verification test:', isValid);
