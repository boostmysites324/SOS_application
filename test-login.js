const fetch = require('node-fetch');

async function testLogin() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'demo@example.com',
                password: 'Demo@123'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS: Login works!');
            console.log('Token:', data.token ? 'Received' : 'Missing');
            console.log('User:', data.user ? data.user.name : 'Missing');
        } else {
            console.log('❌ ERROR:', data.message || 'Login failed');
        }
    } catch (error) {
        console.log('❌ CONNECTION ERROR:', error.message);
    }
}

testLogin();
