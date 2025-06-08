const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memeshot.db');

db.all(`SELECT id, username, role FROM users`, (err, rows) => {
  if (err) {
    console.error('❌ خطأ في جلب المستخدمين:', err.message);
  } else {
    console.table(rows);
  }
});

// استعراض جميع الحقول (الأعمدة) في جدول marketing_requests
db.all(`PRAGMA table_info(marketing_requests)`, (err, columns) => {
  if (err) {
    console.error('❌ خطأ في جلب أعمدة الجدول:', err.message);
  } else {
    console.table(columns);
  }
});

// استعراض جميع البيانات في جدول marketing_requests
db.all(`SELECT * FROM marketing_requests`, (err, rows) => {
  if (err) {
    console.error('❌ خطأ في جلب بيانات الجدول:', err.message);
  } else {
    console.table(rows);
  }
});



