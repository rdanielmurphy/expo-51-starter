CREATE TABLE IF NOT EXISTS invoice_payment (
	 id INTEGER PRIMARY KEY AUTOINCREMENT,
	 paymentMethod TEXT,
	 checkNumber TEXT,
     amount INTEGER NOT NULL DEFAULT 0,
     invoice_id INTEGER
);