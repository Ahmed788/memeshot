const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("الجداول الموجودة في قاعدة البيانات:");
  rows.forEach((row) => {
    console.log(row.name);
  });
});

db.close();
