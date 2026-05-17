const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { getDB } = require('../../database/init');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/users/agents  (admin, supervisor)
router.get('/agents', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const agents = db.prepare(
      "SELECT id, name, email, phone FROM users WHERE role = 'agent' AND is_active = 1 ORDER BY name"
    ).all();
    res.json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users
router.get('/', requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const { role, search } = req.query;
    let query = 'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users (admin creates agent/supervisor)
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hashed, role || 'customer', phone || null);
    const user = db.prepare('SELECT id, name, email, role, phone, is_active FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const { name, email, role, phone, is_active } = req.body;
    db.prepare('UPDATE users SET name = ?, email = ?, role = ?, phone = ?, is_active = ? WHERE id = ?')
      .run(name, email, role, phone, is_active !== undefined ? is_active : 1, req.params.id);
    const user = db.prepare('SELECT id, name, email, role, phone, is_active FROM users WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id (soft delete)
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
