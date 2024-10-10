CREATE INDEX comment_comment_group_id_index ON comment (comment_group_id);

CREATE INDEX option_subsection_id_index ON option (subsection_id);
CREATE INDEX option_section_id_index ON option (section_id);
CREATE INDEX option_script_id_index ON option (script_id);

CREATE INDEX overview_script_id_index ON overview (script_id);

CREATE INDEX overview_section_overview_id_index ON overview_section (overview_id);

CREATE INDEX photo_inspectionId_index ON photo (inspectionId);
CREATE INDEX photo_sectionId_index ON photo (sectionId);
CREATE INDEX photo_subsectionId_index ON photo (subsectionId);
CREATE INDEX photo_optionId_index ON photo (optionId);

CREATE INDEX section_script_id_index ON section (script_id);

CREATE INDEX service_account_id_index ON service (account_id);
CREATE INDEX service_inspection_id_index ON service (inspection_id);

CREATE INDEX subsection_script_id_index ON subsection (script_id);
CREATE INDEX subsection_section_id_index ON subsection (section_id);

CREATE INDEX summary_script_id_index ON summary (script_id);

CREATE INDEX summary_section_summary_id_index ON summary_section (summary_id);

CREATE INDEX value_option_id_index ON value (option_id);
CREATE INDEX value_subsection_id_index ON value (subsection_id);
CREATE INDEX value_section_id_index ON value (section_id);
CREATE INDEX value_script_id_index ON value (script_id);

CREATE INDEX value_option_value_id_index ON value_option (value_id);
CREATE INDEX value_option_option_id_index ON value_option (option_id);
CREATE INDEX value_option_subsection_id_index ON value_option (subsection_id);
CREATE INDEX value_option_section_id_index ON value_option (section_id);
CREATE INDEX value_option_script_id_index ON value_option (script_id);

CREATE INDEX account_remoteId ON cloud_account (remoteId);
CREATE INDEX address_remoteId ON address (remoteId);
CREATE INDEX user_remoteId ON application_user (remoteId);
CREATE INDEX user_device_remoteId ON user_device (remoteId);
CREATE INDEX comment_remoteId ON comment (remoteId);
CREATE INDEX comment_group_remoteId ON comment_group (remoteId);
CREATE INDEX company_remoteId ON company (remoteId);
CREATE INDEX contact_remoteId ON contact (remoteId);
CREATE INDEX document_remoteId ON document (remoteId);
CREATE INDEX email_remoteId ON email (remoteId);
CREATE INDEX event_remoteId ON event (remoteId);
CREATE INDEX image_remoteId ON image (remoteId);
CREATE INDEX inspection_remoteId ON inspection (remoteId);
CREATE INDEX inspection_contact_remoteId ON inspection_contact (remoteId);
CREATE INDEX invoice_remoteId ON invoice (remoteId);
CREATE INDEX license_remoteId ON license (remoteId);
CREATE INDEX option_remoteId ON option (remoteId);
CREATE INDEX overview_remoteId ON overview (remoteId);
CREATE INDEX overview_section_remoteId ON overview_section (remoteId);
CREATE INDEX phonenumber_remoteId ON phonenumber (remoteId);
CREATE INDEX photo_remoteId ON photo (remoteId);
CREATE INDEX property_remoteId ON property (remoteId);
CREATE INDEX related_contact_remoteId ON related_contact (remoteId);
CREATE INDEX report_definition_remoteId ON report_definition (remoteId);
CREATE INDEX report_parameters_remoteId ON report_parameters (remoteId);
CREATE INDEX script_remoteId ON script (remoteId);
CREATE INDEX section_remoteId ON section (remoteId);
CREATE INDEX service_remoteId ON service (remoteId);
CREATE INDEX subsection_remoteId ON subsection (remoteId);
CREATE INDEX summary_remoteId ON summary (remoteId);
CREATE INDEX summary_section_remoteId on summary_section (remoteId);
CREATE INDEX userdefinedfields_remoteId ON userdefinedfields (remoteId);
CREATE INDEX user_preference_remoteId ON user_preference (remoteId);
CREATE INDEX value_remoteId ON value (remoteId);
CREATE INDEX value_option_remoteId ON value_option (remoteId);

CREATE INDEX user_address_user_id ON application_user_address (application_user_id);
CREATE INDEX user_email_user_id ON application_user_email (application_user_id);
CREATE INDEX user_phonenumber_user_id ON application_user_phonenumber (application_user_id);

CREATE INDEX account_address_account_id ON cloud_account_address (cloud_account_id);
CREATE INDEX account_email_account_id ON cloud_account_email (cloud_account_id);
CREATE INDEX account_phonenumber_account_id ON cloud_account_phonenumber (cloud_account_id);

CREATE INDEX company_address_company_id ON company_address (company_id);
CREATE INDEX company_email_company_id ON company_email (company_id);
CREATE INDEX company_phonenumber_company_id ON company_phonenumber (company_id);

CREATE INDEX contact_address_contact_id ON contact_address (contact_id);
CREATE INDEX contact_email_contact_id ON contact_email (contact_id);
CREATE INDEX contact_license_contact_id ON contact_license (contact_id);
CREATE INDEX contact_phoneumber_contact_id ON contact_phonenumber (contact_id);

CREATE INDEX comment_name_group_id_number ON comment (name, comment_group_id, number);

CREATE INDEX comment_group_name ON comment_group (name);
CREATE INDEX comment_group_number ON comment_group (number);
CREATE INDEX comment_group_name_number ON comment_group (name, number);

CREATE INDEX dbchangeitem_inspectionId ON dbchangeitem (inspectionId);
CREATE INDEX dbchangeitem_inspectionRemoteId ON dbchangeitem (inspectionRemoteId);
CREATE INDEX dbchangeitem_scriptId ON dbchangeitem (scriptId);
CREATE INDEX dbchangeitem_scriptRemoteId ON dbchangeitem (scriptRemoteId);

CREATE INDEX document_inspection_id ON document (inspection_id);
CREATE INDEX document_reportDefinition_id ON document (reportDefinition_id);
CREATE INDEX document_service_id ON document (service_id);

CREATE INDEX image_fileName ON image (fileName);
CREATE INDEX image_account_id ON image (account_id);
CREATE INDEX image_contact_id ON image (contact_id);
CREATE INDEX image_inspection_id ON image (inspection_id);
CREATE INDEX image_user_id ON image (user_id);

CREATE INDEX inspection_account_id ON inspection (account_id);
CREATE INDEX inspection_application_user_id ON inspection (applicationUser_id);
CREATE INDEX inspection_event_id ON inspection (event_id);
CREATE INDEX inspection_invoice_id ON inspection (invoice_id);
CREATE INDEX inspection_property_id ON inspection (property_id);
CREATE INDEX inspection_reportParameters_id ON inspection (reportParameters_id);
CREATE INDEX inspection_scriptId ON inspection (scriptId);

CREATE INDEX inspection_contact_contact_id ON inspection_contact (contact_id);
CREATE INDEX inspection_contact_inspection_id ON inspection_contact (inspection_id);

CREATE INDEX option_name_subsection_id ON option (name, subsection_id);

CREATE INDEX overview_master ON overview (master);

CREATE INDEX overview_section_name_overview_id ON overview_section (name, overview_id);

CREATE INDEX license_application_user_id ON license (application_user_id);

CREATE INDEX photo_fileName ON photo (fileName);

CREATE INDEX related_contact_contact_id ON related_contact (contact_id);
CREATE INDEX related_contact_inspection_id ON related_contact (inspection_id);

CREATE INDEX section_name_script_id ON section (name, script_id);

CREATE INDEX script_account_id ON script (account_id);
CREATE INDEX script_overview_id ON script (overview_id);
CREATE INDEX script_summary_id ON script (summary_id);
CREATE INDEX script_master ON script (master);
CREATE INDEX script_tag ON script (tag);
CREATE INDEX script_master_tag ON script (master, tag);
CREATE INDEX script_name_editable_master_account_id_remoteId ON script (name, editable, master, account_id, remoteId);

CREATE INDEX service_scriptID ON service (scriptID);

CREATE INDEX subsection_name_section_id ON subsection (name, section_id);

CREATE INDEX summary_master ON summary (master);

CREATE INDEX userdefinedfields_fieldType ON userdefinedfields (fieldType);
CREATE INDEX userdefinedfields_fieldType_fieldLabel ON userdefinedfields (fieldType, fieldLabel);

CREATE INDEX value_text_option_id ON value (text, option_id);

CREATE INDEX value_option_text_value_id ON value_option (text, value_id);