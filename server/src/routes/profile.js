const express = require('express');
const { authRequired } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/db');

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const users = await readJson('users.json', []);
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  return res.json(safe);
});

router.put('/', authRequired, async (req, res) => {
  const { name } = req.body || {};
  const users = await readJson('users.json', []);
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx] = { ...users[idx], name: name ?? users[idx].name, updatedAt: new Date().toISOString() };
  await writeJson('users.json', users);
  const { password, ...safe } = users[idx];
  return res.json(safe);
});

module.exports = router;





