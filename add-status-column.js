const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memeshot.db');

db.all(`SELECT id, username, role FROM users`, (err, rows) => {
  if (err) {
    console.error('❌ خطأ في جلب المستخدمين:', err.message);
  } else {
    console.table(rows);
  }
});

// إضافة حقل Maerket من نوع VARCHAR(50) إلى جدول marketing_requests
db.run(
  `ALTER TABLE marketing_requests ADD COLUMN Maerket VARCHAR(50)`,
  function(err) {
    if (err) {
      console.error('❌ خطأ في إضافة الحقل Maerket:', err.message);
    } else {
      console.log('✅ تم إضافة الحقل Maerket بنجاح إلى جدول marketing_requests');
    }
  }
);

db.close();
