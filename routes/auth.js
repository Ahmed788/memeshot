const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database');

// عرض صفحة تسجيل الدخول
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// استقبال بيانات تسجيل الدخول
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.send('حدث خطأ في قاعدة البيانات');
    if (!user) {
      return res.render('pages/login', { error: 'اسم المستخدم غير موجود' });
    }

    // التحقق من كلمة المرور
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role
        };
        return res.redirect('/requests');
      } else {
        return res.render('pages/login', { error: 'كلمة المرور غير صحيحة' });
      }
    });
  });
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
