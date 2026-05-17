const { getDB } = require('../../database/init');

function createNotification(userId, title, message, type = 'info', complaintId = null) {
  const db = getDB();
  db.prepare(
    'INSERT INTO notifications (user_id, title, message, type, complaint_id) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, title, message, type, complaintId);
}

function notifyAdminsAndSupervisors(title, message, type = 'info', complaintId = null) {
  const db = getDB();
  const recipients = db.prepare(
    "SELECT id FROM users WHERE role IN ('admin','supervisor') AND is_active = 1"
  ).all();
  recipients.forEach(u => createNotification(u.id, title, message, type, complaintId));
}

function notifyUser(userId, title, message, type = 'info', complaintId = null) {
  createNotification(userId, title, message, type, complaintId);
}

module.exports = { createNotification, notifyAdminsAndSupervisors, notifyUser };
