const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memeshot.db');

db.all(`SELECT id, username, role FROM users`, (err, rows) => {
  if (err) {
    console.error('❌ خطأ في جلب المستخدمين:', err.message);
  } else {
    console.table(rows);
  }
});







