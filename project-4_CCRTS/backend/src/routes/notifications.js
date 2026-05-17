const router = require('express').Router();
const { getDB } = require('../../database/init');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/notifications
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const notes = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.id);
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', (req, res) => {
  try {
    const db = getDB();
    const { count } = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', (req, res) => {
  try {
    const db = getDB();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  try {
    const db = getDB();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
