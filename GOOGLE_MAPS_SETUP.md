# Google Maps Integration Setup

## Overview
The SOS Active page now displays a live Google Map showing the emergency location with a marker.

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. Click on your API key in the Credentials page
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain(s):
     - `http://localhost:3000/*` (for development)
     - `http://localhost:5173/*` (for Vite dev server)
     - Your production domain(s)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Maps JavaScript API"
   - Save

### 3. Add API Key to Environment Variables

Create or update your `.env` file in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important**: 
- Never commit your `.env` file to version control
- The `.env` file should already be in `.gitignore`
- For production, set this as an environment variable in your hosting platform

### 4. Restart Development Server

After adding the API key, restart your Vite dev server:

```bash
npm run dev
```

## Features

- **Live Map Display**: Shows the exact location from the SOS alert
- **Custom Marker**: Red marker with white border indicating emergency location
- **Info Window**: Click marker to see address and coordinates
- **Responsive**: Works on mobile and desktop
- **Fallback**: Shows coordinates if map fails to load

## Troubleshooting

### Map Not Showing

1. **Check API Key**: Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
2. **Check Console**: Look for errors in browser console
3. **API Enabled**: Ensure Maps JavaScript API is enabled in Google Cloud Console
4. **Restrictions**: Check if API key restrictions are blocking your domain
5. **Billing**: Google Maps requires a billing account (free tier available)

### Common Errors

- **"This page can't load Google Maps correctly"**: API key issue or restrictions
- **"RefererNotAllowedMapError"**: Add your domain to API key restrictions
- **"ApiNotActivatedMapError"**: Enable Maps JavaScript API in Google Cloud Console

## Cost Information

Google Maps offers a free tier:
- **$200 free credit per month**
- First 28,000 map loads per month are free
- After that: $7 per 1,000 additional loads

For most applications, the free tier is sufficient.

## Production Deployment

When deploying to production:

1. Add your production domain to API key restrictions
2. Set `VITE_GOOGLE_MAPS_API_KEY` as an environment variable in your hosting platform
3. Rebuild your application

Example for Vercel/Netlify:
- Add environment variable: `VITE_GOOGLE_MAPS_API_KEY`
- Value: Your API key
- Redeploy

