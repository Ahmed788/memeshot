// database.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("memeshot.db");

// إنشاء جدول إذا لم يكن موجود
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS marketing_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_link TEXT UNIQUE,
      followers INTEGER,
      account_link TEXT,
      platform TEXT,
      price REAL,
      wallet TEXT,
      notes TEXT
    )
  `);
});

module.exports = db;
