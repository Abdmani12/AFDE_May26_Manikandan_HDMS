const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || './database/ccrts.db';
const dbPath = path.resolve(__dirname, '../..', DB_PATH);

let db;

function getDB() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

module.exports = { getDB };
