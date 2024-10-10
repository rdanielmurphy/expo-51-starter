CREATE TABLE IF NOT EXISTS error_log (
	 id INTEGER PRIMARY KEY AUTOINCREMENT,
	 screen TEXT,
	 area TEXT,
     error TEXT,
	 stackTrace TEXT,
     insertDate INTEGER
);

CREATE TRIGGER update_error_log_insert_date_trigger
AFTER INSERT ON error_log
BEGIN
   UPDATE error_log SET insertDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;