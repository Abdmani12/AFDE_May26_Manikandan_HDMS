const router = require('express').Router();
const { getDB } = require('../../database/init');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    const db = getDB();
    const role = req.user.role;
    let baseWhere = '1=1';
    const params = [];

    if (role === 'customer') {
      baseWhere = 'customer_id = ?'; params.push(req.user.id);
    } else if (role === 'agent') {
      baseWhere = 'assigned_to = ?'; params.push(req.user.id);
    }

    const total = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere}`).get(...params).c;
    const open = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'open'`).get(...params).c;
    const assigned = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'assigned'`).get(...params).c;
    const in_progress = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'in_progress'`).get(...params).c;
    const escalated = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'escalated'`).get(...params).c;
    const resolved = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'resolved'`).get(...params).c;
    const closed = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND status = 'closed'`).get(...params).c;
    const now = new Date().toISOString();
    const sla_breached = db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND sla_deadline < ? AND status NOT IN ('resolved','closed')`).get(...params, now).c;

    const avgResult = db.prepare(`SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg FROM complaints WHERE ${baseWhere} AND resolved_at IS NOT NULL`).get(...params);
    const avg_resolution_hours = avgResult.avg ? Math.round(avgResult.avg * 10) / 10 : 0;

    const by_priority = {
      low: db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND priority = 'low'`).get(...params).c,
      medium: db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND priority = 'medium'`).get(...params).c,
      high: db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND priority = 'high'`).get(...params).c,
      critical: db.prepare(`SELECT COUNT(*) as c FROM complaints WHERE ${baseWhere} AND priority = 'critical'`).get(...params).c,
    };

    const by_category = db.prepare(`
      SELECT cat.name as category, COUNT(c.id) as count
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE ${baseWhere}
      GROUP BY c.category_id ORDER BY count DESC
    `).all(...params);

    res.json({
      success: true,
      data: { total, open, assigned, in_progress, escalated, resolved, closed, sla_breached, avg_resolution_hours, by_priority, by_category },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/recent
router.get('/recent', (req, res) => {
  try {
    const db = getDB();
    let where = '1=1';
    const params = [];
    if (req.user.role === 'customer') { where = 'c.customer_id = ?'; params.push(req.user.id); }
    else if (req.user.role === 'agent') { where = 'c.assigned_to = ?'; params.push(req.user.id); }

    const items = db.prepare(`
      SELECT c.*, u.name as customer_name, a.name as agent_name, cat.name as category_name
      FROM complaints c
      LEFT JOIN users u ON c.customer_id = u.id
      LEFT JOIN users a ON c.assigned_to = a.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE ${where}
      ORDER BY c.created_at DESC LIMIT 10
    `).all(...params);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/sla-breaches
router.get('/sla-breaches', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const now = new Date().toISOString();
    const items = db.prepare(`
      SELECT c.*, u.name as customer_name, a.name as agent_name, cat.name as category_name
      FROM complaints c
      LEFT JOIN users u ON c.customer_id = u.id
      LEFT JOIN users a ON c.assigned_to = a.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.sla_deadline < ? AND c.status NOT IN ('resolved','closed')
      ORDER BY c.sla_deadline ASC
    `).all(now);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/agent-performance
router.get('/agent-performance', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const agents = db.prepare(`
      SELECT u.id, u.name, u.email,
        COUNT(c.id) as total_assigned,
        SUM(CASE WHEN c.status IN ('resolved','closed') THEN 1 ELSE 0 END) as total_resolved,
        AVG(CASE WHEN c.resolved_at IS NOT NULL THEN (julianday(c.resolved_at) - julianday(c.created_at)) * 24 ELSE NULL END) as avg_resolution_hours
      FROM users u
      LEFT JOIN complaints c ON c.assigned_to = u.id
      WHERE u.role = 'agent'
      GROUP BY u.id ORDER BY total_resolved DESC
    `).all();
    res.json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/trends
router.get('/trends', requireRole('admin', 'supervisor'), (req, res) => {
  try {
    const db = getDB();
    const trends = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM complaints
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();
    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
