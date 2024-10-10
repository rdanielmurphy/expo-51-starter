-- TODO Add more

CREATE TRIGGER insert_created_date_trigger_script
AFTER INSERT ON script
BEGIN
   UPDATE script SET createDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_script
AFTER UPDATE ON script
BEGIN
   UPDATE script SET lastModified=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_inspection
AFTER UPDATE ON inspection
BEGIN
   UPDATE inspection SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_property
AFTER UPDATE ON property
BEGIN
   UPDATE property SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_photo
AFTER INSERT ON photo
BEGIN
   UPDATE photo SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER insert_created_date_trigger_invoice
AFTER INSERT ON invoice
BEGIN
   UPDATE invoice SET dateCreated=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_image
AFTER INSERT ON image
BEGIN
   UPDATE image SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_cloud_account
AFTER UPDATE ON cloud_account
BEGIN
   UPDATE cloud_account SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_application_user
AFTER UPDATE ON application_user
BEGIN
   UPDATE application_user SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_email
AFTER UPDATE ON email
BEGIN
   UPDATE email SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_user
AFTER UPDATE ON application_user
BEGIN
   UPDATE application_user SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;

CREATE TRIGGER update_last_modified_trigger_contact
AFTER UPDATE ON contact
BEGIN
   UPDATE contact SET lastModifiedDate=STRFTIME('%s', 'NOW') WHERE id = NEW.id;
END;