const express = require('express');
const path = require('path');
const app = express();
const db = require('./database');
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const bcrypt = require('bcrypt');
// إعداد الجلسة
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: true
}));

// ميدل وير لتوفير بيانات المستخدم في جميع الصفحات
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// إعداد محرك العرض EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// إعداد ملفات الستاتيك
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// =======================
// المسارات
// =======================

// صفحة تقديم الطلب
app.get('/', (req, res) => {
 res.render("marketing-request");
});

// خدمة الملفات الثابتة بما فيها ملفات اللغات
app.use(express.static('public'));

// route لتحميل ملفات الترجمة
app.get('/locales/:lang.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'locales', `${req.params.lang}.json`));
});

// إرسال الطلب
app.post('/submit-request', (req, res) => {
  let {
    channel_link,
    followers,
    account_link,
    platform,
    price,
    wallet,
    notes,
    Maerket
  } = req.body;
  // تحويل الأرقام والحالة للإنجليزية
  if (typeof followers === 'string') followers = followers.replace(/[^0-9.]/g, '');
  if (typeof price === 'string') price = price.replace(/[^0-9.]/g, '');
  if (typeof platform === 'string') platform = platform.toLowerCase();
  // حفظ البيانات كما هي بالإنجليزية
  const checkQuery = "SELECT * FROM marketing_requests WHERE channel_link = ?";
  db.get(checkQuery, [channel_link], (err, row) => {
    if (err) return res.send("❌ خطأ في النظام");

    if (row) {
      return res.send("<h2>تم الإعلان مسبقًا مع هذه القناة ❌</h2><a href='/'>عودة</a>");
    }

    const insertQuery = `
      INSERT INTO marketing_requests (channel_link, followers, account_link, platform, price, wallet, notes, maerket)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      insertQuery,
      [channel_link, followers, account_link, platform, price, wallet, notes, Maerket],
      function (err) {
        if (err) return res.send("❌ لم يتم حفظ الطلب");

        // إعادة التوجيه مع باراميتر success
        res.redirect('/?success=1');
      }
    );
  });
});

// =======================
// مراجعة الطلبات من الإدارة
// =======================

// الطلبات الغير مراجعة
app.get('/review-requests', (req, res) => {
  const query = "SELECT * FROM marketing_requests WHERE status IS NULL OR status = ''";
  db.all(query, [], (err, rows) => {
    if (err) return res.send("❌ حدث خطأ أثناء جلب الطلبات");
    res.render('review', { requests: rows });
  });
});

// تعليم الطلب كمراجع
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

    res.redirect("/requests");
  });
});


// =======================
// مراجعة مدير العمليات
// =======================

app.get('/operations-review', (req, res) => {
  db.all("SELECT * FROM marketing_requests WHERE status = 'مراجع'", [], (err, rows) => {
    if (err) return res.send("❌ حدث خطأ أثناء جلب الطلبات");
    res.render('operations', { requests: rows });
  });
});

app.post('/approve-request', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('Missing request ID');
  }

  try {
    // تحديث حالة الطلب في قاعدة البيانات
    await db.run('UPDATE marketing_requests SET status = ? WHERE id = ?', ['approved', id]);
    res.redirect('/requests'); // تأكد أن هذا هو اسم صفحة عرض الطلبات
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).send('Server error');
  }
});


// =======================
// مسارات الحالة العامة
// =======================

// كل الطلبات
app.get('/all-requests', (req, res) => {
  db.all("SELECT * FROM marketing_requests ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.send("❌ حدث خطأ أثناء جلب الطلبات");
    res.render('all-requests', { requests: rows });
  });
});

// عرض الطلبات (منقول من requests.js)
app.get('/requests', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  db.all("SELECT * FROM marketing_requests", (err, rows) => {
    if (err) return res.send("خطأ في  الطلبات");

    res.render('requests', { requests: rows, user: req.session.user });
  });
});

// إضافة نتيجة حملة (منقول من requests.js)
app.post('/add-campaign-result', (req, res) => {
  const { request_id, referral_link, referral_revenue } = req.body;
  db.run(
    'INSERT INTO campaign_results (request_id, referral_link, referral_revenue) VALUES (?, ?, ?)',
    [request_id, referral_link, referral_revenue],
    function (err) {
      if (err) {
        return res.status(500).send('حدث خطأ أثناء إدخال البيانات');
      }
      // بعد إضافة نتائج الحملة، غيّر حالة الطلب إلى 'report'
      db.run(
        "UPDATE marketing_requests SET status = 'report' WHERE id = ?",
        [request_id],
        function (err2) {
          if (err2) {
            return res.status(500).send('حدث خطأ أثناء تحديث الحالة');
          }
          res.redirect('/requests?success=2');
        }
      );
    }
  );
});

// تحديث حالة الطلب يدويًا
app.post('/update-status', (req, res) => {
  const { id, status } = req.body;
  db.run("UPDATE marketing_requests SET status = ? WHERE id = ?", [status, id], err => {
    if (err) return res.send("❌ حدث خطأ أثناء تحديث الحالة");
    res.redirect('/requests');
  });
});

// =======================
// مسارات التحديث المتدرج
// =======================

app.post('/review/:id', (req, res) => {
  db.run("UPDATE marketing_requests SET status='reviewed' WHERE id=?", [req.params.id], () => res.sendStatus(200));
});

app.post('/approve/:id', (req, res) => {
  db.run("UPDATE marketing_requests SET status='approved' WHERE id=?", [req.params.id], () => res.sendStatus(200));
});

app.post('/attach-receipt/:id', (req, res) => {
  const { receipt } = req.body;
  db.run("UPDATE marketing_requests SET receipt=?, status='published' WHERE id=?", [receipt, req.params.id], () => res.sendStatus(200));
});

app.post('/complete/:id', (req, res) => {
  db.run("UPDATE marketing_requests SET status='completed' WHERE id=?", [req.params.id], () => res.redirect('/requests'));
});

app.post('/reject/:id', (req, res) => {
  db.run("UPDATE marketing_requests SET status='rejected' WHERE id=?", [req.params.id], () => res.redirect('/requests'));
});

// =======================
// أدوات الديبق للمطور
// =======================
app.get("/debug/schema", (req, res) => {
  db.all("PRAGMA table_info(marketing_requests);", (err, rows) => {
    if (err) return res.send("❌ خطأ أثناء جلب بنية الجدول");
    res.json(rows);
  });
});

// =======================
// تشغيل السيرفر
// =======================
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
});

app.post('/add-receipt', (req, res) => {
  let { id, receipt } = req.body;
  // حفظ رقم الإيصال كإنجليزي
  if (typeof receipt === 'string') receipt = receipt.replace(/[^0-9a-zA-Z-_.]/g, '');
  const query = `UPDATE marketing_requests SET receipt = ?, status = 'receipt-added' WHERE id = ?`;
  db.run(query, [receipt, id], function(err) {
    if (err) {
      console.error("Error updating receipt:", err);
      return res.status(500).send("خطأ في تحديث رقم الإيصال");
    }
    res.redirect('/requests');
  });
});

app.post('/publish-request', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('Missing request ID');
  }

  try {
    // تحديث حالة الطلب إلى "publishing"
    await db.run('UPDATE marketing_requests SET status = ? WHERE id = ?', ['publishing', id]);
    res.redirect('/requests');
  } catch (error) {
    console.error('Error updating request to publishing:', error);
    res.status(500).send('Server error');
  }
});

app.post('/complete-request', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('Missing request ID');
  }

  try {
    // تحديث حالة الطلب إلى "complete"
    await db.run('UPDATE marketing_requests SET status = ? WHERE id = ?', ['complete', id]);
    res.redirect('/requests');
  } catch (error) {
    console.error('Error updating request to complete:', error);
    res.status(500).send('Server error');
  }
});


// صفحة تسجيل الدخول
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.get(query, [username], async (err, user) => {
    if (err) return res.send("❌ خطأ في قاعدة البيانات");

    if (!user) {
      return res.render('login', { error: "❌ اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    // تحقق من تطابق كلمة المرور
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: "❌ اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    // تسجيل الدخول بنجاح
    req.session.user = user;
    res.redirect('/requests');
  });
});


app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('خطأ أثناء تسجيل الخروج');
    }
    res.redirect('/login');
  });
});

// دالة وسيطة لحماية الصفحات
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// صفحة إدارة الطلبات محمية

// جلب نتائج الحملة لطلب معين (API)
app.get('/api/campaign-result/:requestId', (req, res) => {
  const requestId = req.params.requestId;
  db.get('SELECT * FROM campaign_results WHERE request_id = ?', [requestId], (err, row) => {
    if (err) return res.status(500).json({error: 'db error'});
    if (!row) return res.status(404).json({error: 'not found'});
    res.json(row);
  });
});


