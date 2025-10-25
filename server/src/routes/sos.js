const express = require('express');
const { authRequired } = require('../middleware/auth');
const { readJson, writeJson } = require('../utils/db');

const router = express.Router();

router.post('/start', authRequired, async (req, res) => {
  const { latitude, longitude } = req.body || {};
  const sos = await readJson('sos.json', []);
  const active = sos.find((s) => s.userId === req.user.id && s.status === 'active');
  if (active) return res.status(409).json({ error: 'SOS already active' });
  const entry = {
    id: `s_${Date.now()}`,
    userId: req.user.id,
    status: 'active',
    location: latitude && longitude ? { latitude, longitude } : null,
    startedAt: new Date().toISOString(),
  };
  sos.push(entry);
  await writeJson('sos.json', sos);
  // Create notification
  const notifications = await readJson('notifications.json', []);
  notifications.push({
    id: `n_${Date.now()}`,
    userId: req.user.id,
    type: 'sos_started',
    message: 'SOS has been activated.',
    read: false,
    createdAt: new Date().toISOString(),
  });
  await writeJson('notifications.json', notifications);
  return res.status(201).json(entry);
});

router.post('/cancel', authRequired, async (req, res) => {
  const sos = await readJson('sos.json', []);
  const idx = sos.findIndex((s) => s.userId === req.user.id && s.status === 'active');
  if (idx === -1) return res.status(404).json({ error: 'No active SOS' });
  sos[idx] = { ...sos[idx], status: 'cancelled', cancelledAt: new Date().toISOString() };
  await writeJson('sos.json', sos);
  return res.json(sos[idx]);
});

router.get('/active', authRequired, async (req, res) => {
  const sos = await readJson('sos.json', []);
  const active = sos.find((s) => s.userId === req.user.id && s.status === 'active');
  return res.json(active || null);
});

module.exports = router;





