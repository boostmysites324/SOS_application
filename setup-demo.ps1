# Setup Demo Accounts for SOS Application
# Make sure backend is running on http://localhost:4000

Write-Host "🚀 Setting up demo accounts..." -ForegroundColor Green
Write-Host ""

$apiUrl = "http://localhost:4000"

# Check if backend is running
Write-Host "📡 Checking backend connection..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$apiUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Backend is not running on $apiUrl" -ForegroundColor Red
    Write-Host "Please start the backend first: cd server && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Function to register user
function Register-User {
    param(
        [string]$email,
        [string]$password,
        [string]$name,
        [string]$empId
    )
    
    Write-Host "📝 Registering: $name ($email)..." -ForegroundColor Cyan
    
    $body = @{
        email = $email
        password = $password
        name = $name
        employeeId = $empId
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/api/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "   ✅ Registered successfully" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Register demo accounts
Register-User -email "john.doe@example.com" -password "Demo@123" -name "John Doe" -empId "EMP-1001"
Register-User -email "jane.smith@example.com" -password "Demo@123" -name "Jane Smith" -empId "EMP-1002"
Register-User -email "mike.johnson@example.com" -password "Demo@123" -name "Mike Johnson" -empId "EMP-1003"
Register-User -email "demo@example.com" -password "Demo@123" -name "Demo User" -empId "EMP-DEMO"

Write-Host ""
Write-Host "✅ Demo accounts created!" -ForegroundColor Green
Write-Host ""
Write-Host "📧 IMPORTANT: Check backend console for verification links" -ForegroundColor Yellow
Write-Host "   Copy each verification link and open in browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔑 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Email: john.doe@example.com | Employee ID: EMP-1001 | Password: Demo@123"
Write-Host "   Email: jane.smith@example.com | Employee ID: EMP-1002 | Password: Demo@123"
Write-Host "   Email: mike.johnson@example.com | Employee ID: EMP-1003 | Password: Demo@123"
Write-Host "   Email: demo@example.com | Employee ID: EMP-DEMO | Password: Demo@123"
Write-Host ""
Write-Host "💡 TIP: To skip email verification, edit server/data/users.json" -ForegroundColor Yellow
Write-Host "   Set 'emailVerified: true' for each user" -ForegroundColor Yellow
Write-Host ""

