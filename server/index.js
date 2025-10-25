const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SOS backend listening on http://localhost:${PORT}`);
});





