const router = require('express').Router();
const { getDB } = require('../../database/init');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/feedback/:complaint_id
router.post('/:complaint_id', requireRole('customer'), (req, res) => {
  try {
    const db = getDB();
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.complaint_id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only submit feedback for your own complaints' });
    }
    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved or closed complaints' });
    }
    const existing = db.prepare('SELECT id FROM feedback WHERE complaint_id = ?').get(req.params.complaint_id);
    if (existing) return res.status(409).json({ success: false, message: 'Feedback already submitted' });

    const result = db.prepare(
      'INSERT INTO feedback (complaint_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)'
    ).run(req.params.complaint_id, req.user.id, rating, comment || null);

    const fb = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: fb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/feedback/:complaint_id
router.get('/:complaint_id', (req, res) => {
  try {
    const db = getDB();
    const fb = db.prepare('SELECT * FROM feedback WHERE complaint_id = ?').get(req.params.complaint_id);
    res.json({ success: true, data: fb || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
