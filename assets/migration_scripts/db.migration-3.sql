ALTER TABLE service ADD enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE service ADD isCustom INTEGER NOT NULL DEFAULT 0;
ALTER TABLE service ADD master INTEGER NOT NULL DEFAULT 0;
INSERT INTO service ("description", "discount", "lastModified", "price", "master") VALUES ('Wind Mitigation', '', STRFTIME('%s', 'NOW'), '50', 1);
INSERT INTO service ("description", "discount", "lastModified", "price", "master") VALUES ('4 point', '', STRFTIME('%s', 'NOW'), '50', 1);
INSERT INTO service ("description", "discount", "lastModified", "price", "master") VALUES ('Radon Test', '', STRFTIME('%s', 'NOW'), '50', 1);
INSERT INTO service ("description", "discount", "lastModified", "price", "master") VALUES ('Pool', '', STRFTIME('%s', 'NOW'), '50', 1);
INSERT INTO service ("description", "discount", "lastModified", "price", "master") VALUES ('WDO', '', STRFTIME('%s', 'NOW'), '50', 1);