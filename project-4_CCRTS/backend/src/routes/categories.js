const router = require('express').Router();
const { getDB } = require('../../database/init');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/categories (public)
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const cats = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description || null);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, message: 'Category already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    const { name, description } = req.body;
    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, req.params.id);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
