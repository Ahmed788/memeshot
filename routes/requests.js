router.get('/requests', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  db.all("SELECT * FROM marketing_requests", (err, rows) => {
    if (err) return res.send("خطأ في  الطلبات");

    res.render('pages/requests', { requests: rows, user: req.session.user });
  });
});


