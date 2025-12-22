#!/bin/bash

# Setup script for SOS Application
# This script creates the .env file if it doesn't exist

ENV_FILE=".env"
API_BASE="https://sos-backend-l46b.onrender.com"

if [ -f "$ENV_FILE" ]; then
    echo "✓ .env file already exists"
    if grep -q "VITE_API_BASE" "$ENV_FILE"; then
        echo "✓ VITE_API_BASE is already configured"
        grep "VITE_API_BASE" "$ENV_FILE"
    else
        echo "Adding VITE_API_BASE to existing .env file..."
        echo "VITE_API_BASE=$API_BASE" >> "$ENV_FILE"
        echo "✓ Added VITE_API_BASE to .env"
    fi
else
    echo "Creating .env file..."
    echo "VITE_API_BASE=$API_BASE" > "$ENV_FILE"
    echo "✓ Created .env file with VITE_API_BASE=$API_BASE"
fi

echo ""
echo "Next steps:"
echo "1. Rebuild the app: npm run build"
echo "2. Sync with Capacitor: npm run cap:sync"
echo "3. Rebuild the APK in Android Studio"
