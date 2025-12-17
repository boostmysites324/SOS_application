const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Self-ping to keep Render free tier alive (prevents sleep after 15 mins of inactivity)
const SELF_PING_INTERVAL = 30 * 1000; // 30 seconds

function startSelfPing() {
  const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  
  if (!serverUrl) {
    console.log('ℹ️  Self-ping disabled: No RENDER_EXTERNAL_URL or SERVER_URL configured');
    return;
  }

  const healthUrl = `${serverUrl}/api/health`;
  console.log(`🔄 Self-ping enabled: Pinging ${healthUrl} every 30 seconds`);

  setInterval(async () => {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        console.log(`✓ Self-ping OK at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`✗ Self-ping failed: ${error.message}`);
    }
  }, SELF_PING_INTERVAL);
}

server.listen(PORT, () => {
  console.log(`🚀 SOS Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  // Check if Supabase is configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('\n⚠️  WARNING: Supabase credentials not configured!');
    console.warn('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.warn('   See server/env.example for reference\n');
  } else {
    console.log('✅ Supabase configured\n');
  }

  // Start self-ping after server is ready
  startSelfPing();
});

