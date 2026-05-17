const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../../database/init');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { notifyAdminsAndSupervisors, notifyUser } = require('../utils/notificationHelper');

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// SLA hours per priority
const SLA_HOURS = { low: 72, medium: 48, high: 24, critical: 4 };

const VALID_TRANSITIONS = {
  open: ['assigned'],
  assigned: ['in_progress', 'escalated'],
  in_progress: ['pending_customer', 'resolved', 'escalated'],
  pending_customer: ['in_progress', 'resolved'],
  escalated: ['assigned', 'in_progress'],
  resolved: ['closed', 'open'],
  closed: [],
};

function generateComplaintNumber(db) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = db.prepare(
    "SELECT COUNT(*) as c FROM complaints WHERE complaint_number LIKE ?"
  ).get(`CCRTS-${today}-%`).c;
  return `CCRTS-${today}-${String(count + 1).padStart(4, '0')}`;
}

function complaintWithDetails(db, id) {
  const complaint = db.prepare(`
    SELECT c.*, 
      u.name as customer_name, u.email as customer_email,
      a.name as agent_name, a.email as agent_email,
      cat.name as category_name
    FROM complaints c
    LEFT JOIN users u ON c.customer_id = u.id
    LEFT JOIN users a ON c.assigned_to = a.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.id = ?
  `).get(id);
  return complaint;
}

// GET /api/complaints
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    const params = [];

    if (req.user.role === 'customer') {
      where += ' AND c.customer_id = ?'; params.push(req.user.id);
    } else if (req.user.role === 'agent') {
      where += ' AND c.assigned_to = ?'; params.push(req.user.id);
    }
    if (status) { where += ' AND c.status = ?'; params.push(status); }
    if (priority) { where += ' AND c.priority = ?'; params.push(priority); }
    if (category) { where += ' AND c.category_id = ?'; params.push(category); }
    if (search) {
      where += ' AND (c.complaint_number LIKE ? OR c.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`SELECT COUNT(*) as c FROM complaints c WHERE ${where}`).get(...params).c;
    const items = db.prepare(`
      SELECT c.*, u.name as customer_name, a.name as agent_name, cat.name as category_name
      FROM complaints c
      LEFT JOIN users u ON c.customer_id = u.id
      LEFT JOIN users a ON c.assigned_to = a.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE ${where}
      ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: { items, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints
router.post('/', requireRole('customer', 'admin'), (req, res) => {
  try {
    const db = getDB();
    const { title, description, category_id, priority = 'medium' } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const slaHours = SLA_HOURS[priority] || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();
    const complaintNumber = generateComplaintNumber(db);

    const result = db.prepare(`
      INSERT INTO complaints (complaint_number, customer_id, category_id, title, description, priority, sla_deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(complaintNumber, req.user.id, category_id || null, title, description, priority, slaDeadline);

    db.prepare(`
      INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment)
      VALUES (?, ?, null, 'open', 'Complaint submitted')
    `).run(result.lastInsertRowid, req.user.id);

    notifyAdminsAndSupervisors(
      'New Complaint Submitted',
      `${req.user.name} submitted complaint ${complaintNumber}: "${title}"`,
      'info', result.lastInsertRowid
    );

    const complaint = complaintWithDetails(db, result.lastInsertRowid);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const complaint = complaintWithDetails(db, req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'customer' && complaint.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.user.role === 'agent' && complaint.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const history = db.prepare(`
      SELECT h.*, u.name as updated_by_name FROM complaint_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.complaint_id = ? ORDER BY h.created_at ASC
    `).all(req.params.id);

    const attachments = db.prepare('SELECT * FROM attachments WHERE complaint_id = ?').all(req.params.id);
    const feedback = db.prepare('SELECT * FROM feedback WHERE complaint_id = ?').get(req.params.id);

    res.json({ success: true, data: { ...complaint, history, attachments, feedback: feedback || null } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/assign
router.put('/:id/assign', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const { agent_id } = req.body;
    if (!agent_id) return res.status(400).json({ success: false, message: 'agent_id required' });

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const agent = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'agent' AND is_active = 1").get(agent_id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET assigned_to = ?, status = 'assigned', updated_at = ? WHERE id = ?`)
      .run(agent_id, now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, 'assigned', ?)`)
      .run(req.params.id, req.user.id, complaint.status, `Assigned to ${agent.name}`);

    notifyUser(agent.id, 'Complaint Assigned', `Complaint ${complaint.complaint_number} has been assigned to you.`, 'info', complaint.id);
    notifyUser(complaint.customer_id, 'Complaint Assigned', `Your complaint ${complaint.complaint_number} has been assigned to an agent.`, 'info', complaint.id);

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/status
router.put('/:id/status', requireRole('agent', 'admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const { status, comment } = req.body;
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'agent' && complaint.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this complaint' });
    }

    const allowed = VALID_TRANSITIONS[complaint.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${complaint.status} to ${status}` });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET status = ?, updated_at = ? WHERE id = ?`).run(status, now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, ?, ?)`)
      .run(req.params.id, req.user.id, complaint.status, status, comment || null);

    notifyUser(complaint.customer_id, 'Complaint Status Updated', `Your complaint ${complaint.complaint_number} status changed to ${status}.`, 'info', complaint.id);

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/escalate
router.put('/:id/escalate', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.status === 'closed' || complaint.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Cannot escalate a resolved/closed complaint' });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET status = 'escalated', escalated_at = ?, updated_at = ? WHERE id = ?`).run(now, now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, 'escalated', ?)`)
      .run(req.params.id, req.user.id, complaint.status, req.body.comment || 'Escalated by supervisor');

    notifyUser(complaint.customer_id, 'Complaint Escalated', `Your complaint ${complaint.complaint_number} has been escalated for priority handling.`, 'warning', complaint.id);
    notifyAdminsAndSupervisors('Complaint Escalated', `Complaint ${complaint.complaint_number} was escalated.`, 'warning', complaint.id);

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/resolve
router.put('/:id/resolve', requireRole('agent', 'admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const { resolution_comment } = req.body;
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'agent' && complaint.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET status = 'resolved', resolved_at = ?, updated_at = ? WHERE id = ?`).run(now, now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, 'resolved', ?)`)
      .run(req.params.id, req.user.id, complaint.status, resolution_comment || 'Complaint resolved');

    notifyUser(complaint.customer_id, 'Complaint Resolved', `Your complaint ${complaint.complaint_number} has been resolved. Please confirm or reopen.`, 'success', complaint.id);

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/complaints/:id/close
router.put('/:id/close', requireRole('customer', 'admin'), (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'customer' && complaint.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Only resolved complaints can be closed' });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET status = 'closed', closed_at = ?, updated_at = ? WHERE id = ?`).run(now, now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, 'resolved', 'closed', ?)`)
      .run(req.params.id, req.user.id, 'Customer confirmed resolution');

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints/:id/reopen
router.post('/:id/reopen', requireRole('customer', 'admin'), (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'customer' && complaint.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Only resolved/closed complaints can be reopened' });
    }

    const now = new Date().toISOString();
    db.prepare(`UPDATE complaints SET status = 'open', resolved_at = null, closed_at = null, updated_at = ? WHERE id = ?`).run(now, req.params.id);
    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, 'open', ?)`)
      .run(req.params.id, req.user.id, complaint.status, req.body.reason || 'Complaint reopened by customer');

    notifyAdminsAndSupervisors('Complaint Reopened', `Complaint ${complaint.complaint_number} was reopened.`, 'warning', complaint.id);

    res.json({ success: true, data: complaintWithDetails(db, req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints/:id/comments
router.post('/:id/comments', (req, res) => {
  try {
    const db = getDB();
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ success: false, message: 'Comment is required' });
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    db.prepare(`INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment) VALUES (?, ?, ?, ?, ?)`)
      .run(req.params.id, req.user.id, complaint.status, complaint.status, comment);

    res.status(201).json({ success: true, message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/complaints/:id/history
router.get('/:id/history', (req, res) => {
  try {
    const db = getDB();
    const history = db.prepare(`
      SELECT h.*, u.name as updated_by_name FROM complaint_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.complaint_id = ? ORDER BY h.created_at ASC
    `).all(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/complaints/:id/attachments
router.post('/:id/attachments', upload.array('files', 5), (req, res) => {
  try {
    const db = getDB();
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const insertAttachment = db.prepare(
      'INSERT INTO attachments (complaint_id, filename, original_name, uploaded_by) VALUES (?, ?, ?, ?)'
    );

    req.files.forEach(file => {
      insertAttachment.run(req.params.id, file.filename, file.originalname, req.user.id);
    });

    res.status(201).json({ success: true, message: `${req.files.length} file(s) uploaded` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/complaints/:id/attachments
router.get('/:id/attachments', (req, res) => {
  try {
    const db = getDB();
    const attachments = db.prepare('SELECT * FROM attachments WHERE complaint_id = ?').all(req.params.id);
    res.json({ success: true, data: attachments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
