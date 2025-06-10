const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memeshot.db');



// استعلام لجلب بيانات جدول marketing_requests
db.all(`SELECT * FROM marketing_requests`, (err, rows) => {
  if (err) {
    console.error('❌ خطأ في جلب بيانات marketing_requests:', err.message);
  } else {
    console.log('📊 بيانات marketing_requests:');
    console.table(rows);
  }
});







