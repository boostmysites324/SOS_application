const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_DIR = path.resolve(process.cwd(), 'server/data');

async function ensureDataDir() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(fileName, fallback) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeJson(fileName, fallback);
      return fallback;
    }
    throw err;
  }
}

async function writeJson(fileName, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, fileName);
  const tmpPath = `${filePath}.tmp`;
  await fsp.writeFile(tmpPath, JSON.stringify(data, null, 2));
  await fsp.rename(tmpPath, filePath);
}

module.exports = { DATA_DIR, readJson, writeJson };





