const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("memeshot.db");
const bcrypt = require('bcrypt');

// دالة لعرض جميع المستخدمين الموجودين
function showAllUsers() {
  db.all("SELECT id, username, role FROM users", (err, rows) => {
    if (err) {
      console.error("خطأ في جلب المستخدمين:", err.message);
      return;
    }
    console.log("جميع المستخدمين:");
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Username: ${row.username}, Role: ${row.role}`);
    });
  });
}

// دالة لحذف المستخدمين المكررين بناءً على اسم المستخدم


// إضافة مستخدمين جدد بصلاحية agent وصلاحيات مثل agent1


// استدعاء الدوال عند تشغيل الملف
// دالة لتحديث وتشفير كلمة مرور المستخدمين agent
async function hashAgentPasswords() {
  const users = ['mohamed', 'ahmed', 'radfan'];
  const saltRounds = 10;
  for (const username of users) {
    const hash = await bcrypt.hash('pass123', saltRounds);
    db.run(
      "UPDATE users SET password = ? WHERE username = ?",
      [hash, username],
      err => {
        if (err) {
          console.error(`خطأ في تحديث كلمة مرور ${username}:`, err.message);
        } else {
          console.log(`تم تحديث كلمة مرور ${username} بنجاح`);
        }
      }
    );
  }
}

// نفذ التحديث عند تشغيل الملف
hashAgentPasswords();
showAllUsers();

module.exports = db;