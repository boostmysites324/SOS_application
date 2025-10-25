#!/bin/bash

# Setup Demo Accounts for SOS Application
# Make sure backend is running on http://localhost:4000

echo "🚀 Setting up demo accounts..."
echo ""

API_URL="http://localhost:4000"

# Check if backend is running
echo "📡 Checking backend connection..."
if ! curl -s "${API_URL}/api/health" > /dev/null; then
    echo "❌ Error: Backend is not running on ${API_URL}"
    echo "Please start the backend first: cd server && npm run dev"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Function to register user
register_user() {
    local email=$1
    local password=$2
    local name=$3
    local empId=$4
    
    echo "📝 Registering: $name ($email)..."
    
    response=$(curl -s -X POST "${API_URL}/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"name\": \"$name\",
            \"employeeId\": \"$empId\"
        }")
    
    if echo "$response" | grep -q "success"; then
        echo "   ✅ Registered successfully"
    else
        echo "   ⚠️  $response"
    fi
}

# Register demo accounts
register_user "john.doe@example.com" "Demo@123" "John Doe" "EMP-1001"
register_user "jane.smith@example.com" "Demo@123" "Jane Smith" "EMP-1002"
register_user "mike.johnson@example.com" "Demo@123" "Mike Johnson" "EMP-1003"
register_user "demo@example.com" "Demo@123" "Demo User" "EMP-DEMO"

echo ""
echo "✅ Demo accounts created!"
echo ""
echo "📧 IMPORTANT: Check backend console for verification links"
echo "   Copy each verification link and open in browser"
echo ""
echo "🔑 Demo Credentials:"
echo "   Email: john.doe@example.com | Employee ID: EMP-1001 | Password: Demo@123"
echo "   Email: jane.smith@example.com | Employee ID: EMP-1002 | Password: Demo@123"
echo "   Email: mike.johnson@example.com | Employee ID: EMP-1003 | Password: Demo@123"
echo "   Email: demo@example.com | Employee ID: EMP-DEMO | Password: Demo@123"
echo ""
echo "💡 TIP: To skip email verification, edit server/data/users.json"
echo "   Set 'emailVerified: true' for each user"
echo ""

