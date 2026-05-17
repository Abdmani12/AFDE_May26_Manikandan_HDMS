const cron = require('node-cron');
const { getDB } = require('../../database/init');
const { notifyAdminsAndSupervisors } = require('./notificationHelper');

function startSLAChecker() {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    try {
      const db = getDB();
      const now = new Date().toISOString();
      const breached = db.prepare(`
        SELECT c.*, u.name as customer_name FROM complaints c
        JOIN users u ON c.customer_id = u.id
        WHERE c.sla_deadline < ? AND c.status NOT IN ('resolved','closed','escalated')
      `).all(now);

      breached.forEach(complaint => {
        db.prepare(`
          UPDATE complaints SET status = 'escalated', escalated_at = ?, updated_at = ? WHERE id = ?
        `).run(now, now, complaint.id);

        db.prepare(`
          INSERT INTO complaint_history (complaint_id, updated_by, old_status, new_status, comment)
          VALUES (?, ?, ?, 'escalated', 'Auto-escalated: SLA deadline breached')
        `).run(complaint.id, 1, complaint.status);

        notifyAdminsAndSupervisors(
          'SLA Breach Detected',
          `Complaint ${complaint.complaint_number} has breached its SLA and been auto-escalated.`,
          'warning',
          complaint.id
        );
      });

      if (breached.length > 0) {
        console.log(`[SLA Checker] Auto-escalated ${breached.length} complaint(s)`);
      }
    } catch (err) {
      console.error('[SLA Checker] Error:', err.message);
    }
  });

  console.log('[SLA Checker] Started — running every 30 minutes');
}

module.exports = { startSLAChecker };
