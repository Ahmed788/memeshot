const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./database');


// إعداد محرك العرض EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// إعداد مجلد الملفات الثابتة (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// تحليل البيانات القادمة من الفورم
app.use(express.urlencoded({ extended: true }));

// مسارات الموقع
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});


app.post("/review-request", (req, res) => {
  const { id, action } = req.body;

  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).send("طلب غير صالح");
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const updateQuery = "UPDATE marketing_requests SET status = ? WHERE id = ?";
  db.run(updateQuery, [newStatus, id], function(err) {
    if (err) {
      console.error(err);
      return res.send("❌ حدث خطأ أثناء تحديث الحالة");
    }

    // يمكنك هنا إرسال إشعار لمدير التشغيل أو أي خطوة إضافية

    res.redirect("/all-requests");
  });
});


app.get('/requests', (req, res) => {
  const query = `SELECT * FROM marketing_requests`;
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.send("❌ حدث خطأ أثناء جلب الطلبات");
    }
    res.render('requests', { requests: rows });
  });
});



app.post('/update-status', (req, res) => {
  const { id, status } = req.body;
  const updateQuery = "UPDATE marketing_requests SET status = ? WHERE id = ?";
  db.run(updateQuery, [status, id], function(err) {
    if (err) {
      console.error(err);
      return res.send("❌ حدث خطأ أثناء تحديث الحالة");
    }
    res.redirect('/requests'); // بعد التحديث نعيد العرض
  });
});

// رفض الطلب
app.post('/reject/:id', (req, res) => {
  db.run(`UPDATE marketing_requests SET status='rejected' WHERE id=?`, [req.params.id], () => {
    res.redirect('/requests');
  });
});
// من pending → reviewed
app.post('/review/:id', (req, res) => {
  db.run(`UPDATE marketing_requests SET status='reviewed' WHERE id=?`, [req.params.id], () => {
    res.sendStatus(200);
  });
});
// من reviewed → approved
app.post('/approve/:id', (req, res) => {
  db.run(`UPDATE marketing_requests SET status='approved' WHERE id=?`, [req.params.id], () => {
    res.sendStatus(200);
  });
});
// إرفاق رقم الإيصال وتغيير الحالة إلى published
app.post('/attach-receipt/:id', express.json(), (req, res) => {
  const { receipt } = req.body;
  db.run(
    `UPDATE marketing_requests SET receipt=?, status='published' WHERE id=?`,
    [receipt, req.params.id],
    () => res.sendStatus(200)
  );
});
// من published → completed
app.post('/complete/:id', (req, res) => {
  db.run(`UPDATE marketing_requests SET status='completed' WHERE id=?`, [req.params.id], () => {
    res.redirect('/requests');
  });
});
