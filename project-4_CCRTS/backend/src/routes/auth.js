const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../../database/init');
const { authMiddleware } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const db = getDB();
    const { name, email, password, phone } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hashed, 'customer', phone || null);

    const user = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(user.id);
    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user.id);
    const { password: _, ...userWithoutPwd } = user;
    res.json({ success: true, data: { token, user: userWithoutPwd } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const { name, phone, password } = req.body;
    if (password) {
      const hashed = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?')
        .run(name || req.user.name, phone || null, hashed, req.user.id);
    } else {
      db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?')
        .run(name || req.user.name, phone || null, req.user.id);
    }
    const updated = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
