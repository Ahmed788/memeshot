CREATE TABLE IF NOT EXISTS campaign_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  referral_link TEXT,
  referral_revenue TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(request_id) REFERENCES marketing_requests(id)
);
