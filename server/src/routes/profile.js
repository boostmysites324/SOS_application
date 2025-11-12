const express = require('express');
const { authRequired } = require('../middleware/auth');
const supabase = require('../utils/supabase');

const router = express.Router();

// Get user profile
router.get('/', authRequired, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, employee_id, name, role, created_at, updated_at')
      .eq('id', req.user.id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      id: user.id,
      email: user.email,
      employeeId: user.employee_id,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authRequired, async (req, res) => {
  try {
    const { name } = req.body || {};
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, employee_id, name, role, created_at, updated_at')
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      id: user.id,
      email: user.email,
      employeeId: user.employee_id,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

