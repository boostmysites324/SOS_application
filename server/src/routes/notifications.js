const express = require('express');
const { authRequired } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/db');

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const all = await readJson('notifications.json', []);
  const items = all.filter((n) => n.userId === req.user.id);
  return res.json(items);
});

router.post('/:id/read', authRequired, async (req, res) => {
  const { id } = req.params;
  const all = await readJson('notifications.json', []);
  const idx = all.findIndex((n) => n.id === id && n.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx] = { ...all[idx], read: true, readAt: new Date().toISOString() };
  await writeJson('notifications.json', all);
  return res.json(all[idx]);
});

module.exports = router;





