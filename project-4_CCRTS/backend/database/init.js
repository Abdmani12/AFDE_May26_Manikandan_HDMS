const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;
let SQL;
let dbPath;

// ---------------------------------------------------------------------------
// sql.js compatibility wrapper — mimics the better-sqlite3 synchronous API
// so all route files work without modification.
// ---------------------------------------------------------------------------
class Statement {
  constructor(sqlDb, sql) {
    this._db = sqlDb;
    this._sql = sql;
  }

  _exec(params = []) {
    // sql.js expects an array or object of bind parameters
    const normalised = Array.isArray(params) ? params : [];
    return this._db.exec(this._sql, normalised);
  }

  get(...params) {
    const results = this._exec(params);
    if (!results.length || !results[0].values.length) return undefined;
    const { columns, values } = results[0];
    return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]));
  }

  all(...params) {
    const results = this._exec(params);
    if (!results.length) return [];
    const { columns, values } = results[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
  }

  run(...params) {
    this._exec(params);
    const idResult = this._db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = idResult.length ? idResult[0].values[0][0] : null;
    _persist();
    return { lastInsertRowid, changes: this._db.getRowsModified() };
  }
}

class DB {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  prepare(sql) {
    return new Statement(this._db, sql);
  }

  exec(sql) {
    const result = this._db.exec(sql);
    _persist();
    return result;
  }

  pragma(stmt) {
    this._db.run(`PRAGMA ${stmt}`);
  }

  transaction(fn) {
    return () => {
      this._db.run('BEGIN');
      try {
        fn();
        this._db.run('COMMIT');
        _persist();
      } catch (err) {
        this._db.run('ROLLBACK');
        throw err;
      }
    };
  }
}

function _persist() {
  if (!db || !dbPath) return;
  const data = db._db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function initializeDB() {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  dbPath = path.resolve(process.env.DB_PATH || './database/ccrts.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let sqlDb;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }

  db = new DB(sqlDb);

  db._db.run('PRAGMA journal_mode = WAL');
  db._db.run('PRAGMA foreign_keys = ON');

  createTables();
  seedData();
  return db;
}

function createTables() {
  db._db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      category_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to INTEGER,
      sla_deadline DATETIME,
      escalated_at DATETIME,
      resolved_at DATETIME,
      closed_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS complaint_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      updated_by INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      complaint_id INTEGER,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db._db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);

  _persist();
}

function seedData() {
  const userCountResult = db._db.exec('SELECT COUNT(*) as c FROM users');
  const userCount = userCountResult.length ? userCountResult[0].values[0][0] : 0;
  if (userCount > 0) return;

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  const insertUser = (name, email, password, role, phone) =>
    db._db.run('INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,?,?)',
      [name, email, hash(password), role, phone]);

  insertUser('Admin User', 'admin@ccrts.com', 'Admin@123', 'admin', '9000000001');
  insertUser('Jane Supervisor', 'supervisor@ccrts.com', 'Super@123', 'supervisor', '9000000002');
  insertUser('Agent Smith', 'agent1@ccrts.com', 'Agent@123', 'agent', '9000000003');
  insertUser('Agent Johnson', 'agent2@ccrts.com', 'Agent@123', 'agent', '9000000004');
  insertUser('John Customer', 'customer@ccrts.com', 'Cust@123', 'customer', '9000000005');
  insertUser('Alice Customer', 'alice@ccrts.com', 'Cust@123', 'customer', '9000000006');

  const cats = [
    ['Billing Issues', 'Problems related to billing or payments'],
    ['Service Disruption', 'Service outages or disruptions'],
    ['Product Defects', 'Defective products or quality issues'],
    ['Technical Problems', 'Technical or system issues'],
    ['Delivery Delays', 'Late or missing deliveries'],
    ['Account Issues', 'Account access or configuration problems'],
    ['Customer Service Complaints', 'Issues with customer service quality'],
  ];
  cats.forEach(([name, desc]) =>
    db._db.run('INSERT INTO categories (name, description) VALUES (?,?)', [name, desc]));

  // Sample complaints
  const now = new Date();
  const addH = (h) => new Date(now.getTime() + h * 3600000).toISOString();
  const subH = (h) => new Date(now.getTime() - h * 3600000).toISOString();

  const insC = (num, custId, catId, title, desc, pri, status, agentId, sla, resolvedAt, createdAt) =>
    db._db.run(`INSERT INTO complaints (complaint_number,customer_id,category_id,title,description,priority,status,assigned_to,sla_deadline,resolved_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [num, custId, catId, title, desc, pri, status, agentId, sla, resolvedAt, createdAt, createdAt]);

  const insH = (cid, uid, os, ns, comment, createdAt) =>
    db._db.run('INSERT INTO complaint_history (complaint_id,updated_by,old_status,new_status,comment,created_at) VALUES (?,?,?,?,?,?)',
      [cid, uid, os, ns, comment, createdAt]);

  // admin id=1, agent1 id=3, cust1 id=5, cust2 id=6, cat billing=1, cat tech=4, cat service=2
  insC('CCRTS-20260514-0001', 5, 1, 'Double charged on my invoice',
    'I was billed twice for the same service in March.', 'high', 'resolved', 3, addH(24), subH(2), subH(48));
  insH(1, 5, null, 'open', 'Complaint submitted', subH(48));
  insH(1, 1, 'open', 'assigned', 'Assigned to Agent Smith', subH(46));
  insH(1, 3, 'assigned', 'resolved', 'Refund has been processed.', subH(2));

  insC('CCRTS-20260514-0002', 5, 4, 'Cannot login to my account',
    'My account login keeps failing since yesterday.', 'critical', 'in_progress', 3, addH(4), null, subH(5));
  insH(2, 5, null, 'open', 'Complaint submitted', subH(5));
  insH(2, 1, 'open', 'assigned', 'Assigned to Agent Smith', subH(4));
  insH(2, 3, 'assigned', 'in_progress', 'Investigating the issue.', subH(1));

  insC('CCRTS-20260515-0001', 6, 2, 'Service down for 3 hours',
    'The service has been unavailable since 9AM.', 'medium', 'open', null, addH(48), null, subH(3));
  insH(3, 6, null, 'open', 'Complaint submitted', subH(3));

  insC('CCRTS-20260515-0002', 6, 1, 'Wrong amount deducted from account',
    'An incorrect amount was deducted last week.', 'low', 'escalated', 3, subH(10), null, subH(80));
  insH(4, 6, null, 'open', 'Complaint submitted', subH(80));
  insH(4, 1, 'open', 'escalated', 'SLA breached — escalated', subH(5));

  _persist();
  console.log('[DB] Seed data inserted');
}

function getDB() {
  return db;
}

module.exports = { initializeDB, getDB };
