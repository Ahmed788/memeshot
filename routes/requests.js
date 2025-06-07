router.get('/requests', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userRole = req.session.user.role;

  db.all("SELECT * FROM marketing_requests", (err, rows) => {
    if (err) return res.send("خطأ في جلب الطلبات");

    res.render('pages/requests', { requests: rows, role: userRole });
  });
});
