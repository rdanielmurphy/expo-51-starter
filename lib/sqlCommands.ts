import { IAddress, IEmail, ILicense, IPhonenumber } from "./types";

// GET
export const SQL_GET_ALL_TABLES = "SELECT name FROM sqlite_master WHERE type = 'table'";
export const SQL_GET_INSPECTION_TYPES = "SELECT * from inspection_type";
export const SQL_GET_REPORT_DEFINITIONS = "SELECT * from report_definition";
export const SQL_GET_SCRIPTS = "SELECT * from script";
export const SQL_GET_MASTER_SCRIPTS = `${SQL_GET_SCRIPTS} where master = 1`
export const SQL_GET_USER_DEFINED_FIELDS = "SELECT * from userdefinedfields";
export const SQL_GET_STATES = "SELECT * from state";
export const SQL_GET_INSPECTIONS = "SELECT * from inspection";
export const SQL_GET_OVERVIEW_SECTIONS = "SELECT * from overview_section";
export const SQL_GET_MASTER_OVERVIEW_SECTION = `SELECT * from overview where master = 1`
export const SQL_GET_MASTER_SUMMARY_SECTION = `SELECT * from summary where master = 1`
export const SQL_GET_SUMMARY_SECTIONS = "SELECT * from summary_section";
export const SQL_GET_SUMMARY_SUBSECTIONS = "SELECT * from summary_subsection";
export const SQL_GET_ALL_COMMENTS = "SELECT * from comment";
export const SQL_GET_DB_VERSION = "SELECT * FROM version_updates";

export const SQL_GET_INSPECTION = (id: number) => (
    `SELECT INSPECTION.displayName, INSPECTION.fee, INSPECTION.name as inspectionName, INSPECTION.number, INSPECTION.inspection_date as inspectionDate, SCRIPT.id as scriptId, 
    SCRIPT.name as scriptName, SCRIPT.tag, INSPECTION.invoice_id as invoiceId, OVERVIEW.id as overviewId, SUMMARY.id as summaryId,
    INSPECTION.property_id, ADDRESS.id as address_id, INSPECTION.status, IMAGE.fileName as coverFileName, IMAGE.id as coverFileId
    from INSPECTION 
    INNER JOIN SCRIPT ON INSPECTION.scriptId = SCRIPT.id 
    INNER JOIN OVERVIEW ON SCRIPT.id = OVERVIEW.script_id 
    INNER JOIN SUMMARY ON SCRIPT.id = SUMMARY.script_id
    INNER JOIN PROPERTY ON INSPECTION.property_id = PROPERTY.id
    INNER JOIN ADDRESS ON PROPERTY.address_id = ADDRESS.id
    LEFT OUTER JOIN IMAGE ON INSPECTION.coverPhotoId = IMAGE.id
    where INSPECTION.id=${id}`
);
export const SQL_GET_SCRIPT = (id: number) => (
    `${SQL_GET_SCRIPTS} where id = ${id}`
);
export const SQL_GET_OVERVIEW_SECTION = (id: number) => (
    `${SQL_GET_OVERVIEW_SECTIONS} where overview_id = ${id}`
);
export const SQL_GET_SUMMARY_SECTION = (id: number) => (
    `${SQL_GET_SUMMARY_SECTIONS} where summary_id = ${id}`
);
export const SQL_GET_SUMMARY_SECTION_IDS = (id: number) => (
    `SELECT id from summary_section where summary_id = ${id}`
);
export const SQL_GET_SUMMARY_SUBSECTION = (id: number) => (
    `${SQL_GET_SUMMARY_SUBSECTIONS} where section_id = ${id}`
);
export const SQL_GET_SECTIONS = (id: number) => (
    `select * from section where script_id = ${id}`
);
export const SQL_GET_SECTION = (id: number) => (
    `select * from section where id = ${id}`
);
export const SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG = (scriptId: number, tag: string) => (
    `select * from section where script_id = ${scriptId} and tag = '${tag}'`
);
export const SQL_GET_SUBSECTION = (id: number) => (
    `select * from subsection where id = ${id}`
);
export const SQL_GET_SUBSECTIONS = (id: number) => (
    `select * from subsection where section_id = ${id}`
);
export const SQL_GET_SUBSECTIONS_BY_SECTIONS = (sectionIds: number[]) => (
    `select * from subsection where section_id IN (${sectionIds});`
);
export const SQL_GET_SUBSECTIONS_BY_SCRIPT_ID = (script_id: number) => (
    `select * from subsection where script_id = ${script_id}`
);
export const SQL_GET_OPTIONS = (id: number) => (
    `select * from option where subsection_id = ${id}`
);
export const SQL_GET_OPTIONS_BY_SCRIPT_ID = (script_id: number) => (
    `select * from option where script_id = ${script_id}`
);
export const SQL_GET_OPTIONS_BY_SECTIONS = (sectionIds: number[]) => (
    `select * from option where section_id IN (${sectionIds});`
);
export const SQL_GET_VALUES = (id: number) => (
    `select * from value where option_id = ${id}`
);
export const SQL_GET_VALUES_BY_SCRIPT_ID = (script_id: number) => (
    `select * from value where script_id = ${script_id}`
);
export const SQL_GET_VALUES_BY_SECTIONS = (sectionIds: number[]) => (
    `select * from value where section_id IN (${sectionIds});`
);
export const SQL_GET_VALUE_OPTIONS = (id: number) => (
    `select * from value_option where value_id = ${id}`
);
export const SQL_GET_VALUE_OPTIONS_BY_SECTIONS = (sectionIds: number[]) => (
    `select * from value_option where section_id IN (${sectionIds});`
);
export const SQL_GET_VALUE_OPTIONS_BY_SCRIPT_ID = (script_id: number) => (
    `select * from value_option where script_id = ${script_id}`
);
export const SQL_GET_OPTIONS_BY_SECTION_ID = (id: number) => (
    `select * from option where section_id = ${id}`
);
export const SQL_GET_VALUES_BY_SECTION_ID = (id: number) => (
    `select * from value where section_id = ${id}`
);
export const SQL_GET_VALUE_OPTIONS_BY_SECTION_ID = (id: number) => (
    `select * from value_option where section_id = ${id}`
);
export const SQL_GET_PHOTOTS_BY_SECTION_ID = (id: number) => (
    `select * from photo where sectionId = ${id}`
);
export const SQL_GET_PHOTOTS_BY_INSPECTION_ID = (id: number) => (
    `select * from photo where inspectionId = ${id}`
);
export const SQL_GET_OVERVIEW_BY_SCRIPT_ID = (scriptId: number) => (
    `SELECT overview_section.*
    from overview 
    INNER JOIN overview_section on overview.id = overview_section.overview_id 
    where script_id = ${scriptId}`
);
export const SQL_GET_SUMMARY_BY_SCRIPT_ID = (scriptId: number) => (
    `SELECT summary_section.*
    from summary 
    INNER JOIN summary_section on summary.id = summary_section.summary_id 
    where script_id = ${scriptId} and summary_section.type = 0`
)
export const SQL_GET_INVOICE_BY_INSPECTION_ID = (inspectionId: number) => (
    `SELECT invoice.id as invoice_id, invoice.totalFee, inspection.fee, inspection.discountAmount
    from inspection
    INNER JOIN invoice on invoice.id = inspection.invoice_id 
    where inspection.id = ${inspectionId}`
);
export const SQL_GET_INVOICE_PAYMENTS = (invoiceId: number) => (
    `SELECT * from invoice_payment where invoice_id = ${invoiceId}`
);
export const SQL_GET_PROPERTY_BY_INSPECTION_ID = (inspectionId: number) => (
    `SELECT property.*
    from inspection
    INNER JOIN property on property.id = inspection.property_id 
    where inspection.id = ${inspectionId}`
);
export const SQL_GET_ADDRESS = (id: number) => (
    `select * from address where id = ${id}`
);
export const SQL_GET_CLOUD_ACCOUNT = () => (
    `SELECT CLOUD_ACCOUNT.*, IMAGE.fileName as logoName, IMAGE.id as logoId
    FROM CLOUD_ACCOUNT 
    LEFT OUTER JOIN IMAGE ON CLOUD_ACCOUNT.id = IMAGE.account_id
    where CLOUD_ACCOUNT.id = 1`
);
export const SQL_GET_CLOUD_ACCOUNT_ADDRESSES = () => (
    `SELECT ADDRESS.*
    FROM CLOUD_ACCOUNT_ADDRESS
    LEFT OUTER JOIN ADDRESS ON CLOUD_ACCOUNT_ADDRESS.addresses_id = ADDRESS.id
    where CLOUD_ACCOUNT_ADDRESS.cloud_account_id = 1`
);
export const SQL_GET_CLOUD_ACCOUNT_EMAILS = () => (
    `SELECT  EMAIL.*
    FROM CLOUD_ACCOUNT_EMAIL
    LEFT OUTER JOIN EMAIL ON CLOUD_ACCOUNT_EMAIL.emails_id = EMAIL.id
    where CLOUD_ACCOUNT_EMAIL.cloud_account_id = 1`
);
export const SQL_GET_CLOUD_ACCOUNT_EMAIL = () => (
    `Select *  from cloud_account_email
	JOIN email ON  email.id = cloud_account_email.emails_id
	ORDER BY email.isPrimary
	DESC
	LIMIT 1`
);
export const SQL_GET_CLOUD_ACCOUNT_PHONENUMBERS = () => (
    `SELECT  PHONENUMBER.*
    FROM CLOUD_ACCOUNT_PHONENUMBER
    LEFT OUTER JOIN PHONENUMBER ON CLOUD_ACCOUNT_PHONENUMBER.phonenumbers_id = PHONENUMBER.id
    where CLOUD_ACCOUNT_PHONENUMBER.cloud_account_id = 1`
);
export const SQL_GET_CLOUD_ACCOUNT_PHONE_NUMBER = () => (
    `Select * from cloud_account_phonenumber
	JOIN phonenumber ON phonenumber.id = cloud_account_phonenumber.phonenumbers_id
	ORDER BY phonenumber.isPrimary
	DESC
	LIMIT 1`
);
export const SQL_GET_INSPECTOR_INFO = () => (
    `Select *
    from application_user
    WHERE application_user.id = 1`
);
export const SQL_GET_IMAGE = (id: number) => (
    `Select * from image where id = ${id}`
);
export const SQL_GET_USER_ADDRESSES = () => (
    `SELECT ADDRESS.*
    FROM application_user_address
    LEFT OUTER JOIN ADDRESS ON application_user_address.addresses_id = ADDRESS.id
    where application_user_address.application_user_id = 1`
);
export const SQL_GET_USER_EMAILS = () => (
    `SELECT EMAIL.*
    FROM application_user_EMAIL
    LEFT OUTER JOIN EMAIL ON application_user_EMAIL.emails_id = EMAIL.id
    where application_user_EMAIL.application_user_id = 1`
);
export const SQL_GET_USER_PHONENUMBERS = () => (
    `SELECT PHONENUMBER.*
    FROM application_user_phonenumber
    LEFT OUTER JOIN PHONENUMBER ON application_user_phonenumber.phonenumbers_id = PHONENUMBER.id
    where application_user_phonenumber.application_user_id = 1`
);
export const SQL_GET_USER_LICENSES = () => (
    "SELECT * FROM license where application_user_id = 1"
);
export const SQL_GET_CONTACTS = () => (
    `SELECT * FROM contact`
);
export const SQL_GET_INSPECTION_CONTACTS = (inspectionId: number) => (
    `SELECT inspection_contact.id as inspectionContactId, 
    inspection_contact.contactSignaturePath as contactSignaturePath,
    contact.*
    FROM inspection_contact 
    INNER JOIN contact on inspection_contact.contact_id = contact.id
    where inspection_id = ${inspectionId}`
);
export const SQL_GET_RELATED_CONTACTS = (inspectionId: number) => (
    `SELECT * 
    FROM related_contact 
    INNER JOIN contact on related_contact.contact_id = contact.id
    where inspection_id = ${inspectionId}`
);
export const SQL_GET_CONTACT_ADDRESSES = (contactId: number) => (
    `SELECT address.*
    from contact_address
    INNER JOIN address on contact_address.addresses_id = address.id
    where contact_id = ${contactId};`
);
export const SQL_GET_CONTACT_EMAILS = (contactId: number) => (
    `SELECT email.*
    from contact_email
    INNER JOIN email on contact_email.emails_id = email.id
    where contact_id = ${contactId};`
);
export const SQL_GET_CONTACT_PHONENUMBERS = (contactId: number) => (
    `SELECT phonenumber.*
    from contact_phonenumber
    INNER JOIN phonenumber on contact_phonenumber.phonenumbers_id = phonenumber.id
    where contact_id = ${contactId};`
);
export const SQL_GET_CONTACT_LICENSES = (contactId: number) => (
    `SELECT license.*
    from contact_license
    INNER JOIN license on contact_license.licenses_id = license.id
    where contact_license.contact_id = ${contactId};`
);
export const SQL_GET_COMMENT_GROUPS = () => (
    `SELECT * from comment_group;`
);
export const SQL_GET_COMMENT_GROUP = (groupId: number) => (
    `SELECT * from comment_group where id = ${groupId};`
);
export const SQL_GET_COMMENT_GROUP_BY_NUMBER = (number: number) => (
    `SELECT * from comment_group where number = ${number}`
);
export const SQL_GET_COMMENTS = (groupId: number) => (
    `SELECT * from comment where comment_group_id = ${groupId};`
);
export const SQL_GET_OPTION = (optionId: number) => (
    `SELECT * from option where id = ${optionId};`
);
export const SQL_GET_INSPECTOR_SIG = () => (
    `SELECT image.*
    from application_user
    INNER JOIN image ON application_user.signatureId = image.id
    where application_user.id = 1`
);
export const SQL_GET_INSPECTION_SERVICES = (inspectionId: number) => (
    `SELECT * from service where inspection_id = ${inspectionId};`
);
export const SQL_GET_SERVICES = "SELECT * from service;";
export const SQL_GET_SECTION_COUNT_BY_TAG = (scriptId: number, tag: string) => (
    `SELECT count(*) as count from section where script_id = ${scriptId} and tag = '${tag}'`
);
export const SQL_GET_ERROR_LOG = () => (
    `SELECT * from error_log`
);
export const SQL_GET_MAX_COMMENT_GROUP_NUMBER = () => (
    `SELECT MAX(number) as max from comment_group`
);

// INSERT
export const SQL_INSERT_ADDRESS = (city: string, isPrimary: number, state: string, street: string, street2: string, type: string, zip: string) => (
    `INSERT INTO address (city, isPrimary, state, street, street2, type, zipCode) VALUES ('${city}', ${isPrimary}, '${state}', '${street}', '${street2}', '${type}', '${zip}')`
);
export const SQL_INSERT_EMAIL = (emailAddress: string, isPrimary: number, emailType: string) => (
    `INSERT INTO email (emailAddress, isPrimary, emailType) VALUES ('${emailAddress}', ${isPrimary}, '${emailType}')`
);
export const SQL_INSERT_PHONE_NUMBER = (phoneNumber: string, extension: string, isPrimary: number, phoneType: string) => (
    `INSERT INTO phonenumber (phoneNumber, extension, isPrimary, phoneType) VALUES ('${phoneNumber}', '${extension}', ${isPrimary}, '${phoneType}')`
);
export const SQL_INSERT_LICENSE = (licenseNumber: string, state: string, startDate: number, type: string, contactId?: number) => (
    `INSERT INTO license (licenseNumber, state, startDate, type, application_user_id, contact_id) VALUES ('${licenseNumber}', '${state}', ${startDate}, '${type}', 1, ${contactId ? contactId : null})`
);
export const SQL_INSERT_INSPECTOR_CONTACT_LICENSE = (licenseNumber: string, state: string, startDate: number, type: string, contactId: number) => (
    `INSERT INTO license (licenseNumber, state, startDate, type, contact_id) VALUES ('${licenseNumber}', '${state}', ${startDate}, '${type}', ${contactId})`
);
export const SQL_INSERT_PROPERTY = (basementType: string, bathrooms: number, bedrooms: number, crawlspaceType: string, garageType: string, address_id: number) => (
    `INSERT INTO property (basementType, bathrooms, bedrooms, crawlspaceType, garageType, address_id) VALUES ('${basementType}', ${bathrooms}, ${bedrooms}, '${crawlspaceType}', '${garageType}', ${address_id})`
);
export const SQL_INSERT_SCRIPT = (name: string, originalScriptId: number, tag: string, version: number) => (
    `INSERT INTO script (editable, master, name, originalScriptId, tag, version) VALUES (1, 0, 
        '${name}', ${originalScriptId}, '${tag}', ${version})`
);
export const SQL_INSERT_MASTER_SCRIPT = (name: string, originalScriptId: number, tag: string, version: number) => (
    `INSERT INTO script (editable, master, name, originalScriptId, tag, version) VALUES (1, 1, 
        '${name}', ${originalScriptId}, '${tag}', ${version})`
);
export const SQL_INSERT_OVERVIEW = (scriptId: number) => (
    `INSERT INTO overview (master, script_id) VALUES (0, ${scriptId})`
);
export const SQL_INSERT_OVERVIEW_SECTION = (overviewId: number, commentListNumber: number | null, theNumber: number, name: string) => (
    `INSERT INTO overview_section (overview_id, commentListNumber, number, name) VALUES (
        ${overviewId}, ${commentListNumber}, '${theNumber}', '${name}')`
);
export const SQL_INSERT_BULK_OVERVIEW_SECTION = (jsonString: string) => (
    `INSERT INTO overview_section (overview_id, commentListNumber, number, name) VALUES ${jsonString}`
);
export const SQL_INSERT_SUMMARY = (scriptId: number) => (
    `INSERT INTO summary (master, script_id, type) VALUES (0, ${scriptId}, 0)`
);
export const SQL_INSERT_SUMMARY_SECTION = (summaryId: number, commentListNumber: number | null, theNumber: number, name: string, text: string, type: number) => (
    `INSERT INTO summary_section (summary_id, commentListNumber, number, name, text, type) VALUES (
        ${summaryId}, ${commentListNumber}, ${theNumber}, '${name}', '${text === null ? '' : text}', ${type})`
);
export const SQL_INSERT_BULK_SUMMARY_SECTION = (jsonString: string) => (
    `INSERT INTO summary_section (summary_id, commentListNumber, number, name, text, type) VALUES ${jsonString}`
);
export const SQL_INSERT_SUMMARY_SUBSECTION = (sectionId: number, commentListNumber: number, theNumber: number, name: string, text: string, type: number) => (
    `INSERT INTO summary_subsection (section_id, commentListNumber, number, name, text, type) VALUES (
        ${sectionId}, ${commentListNumber}, ${theNumber}, '${name}', '${text === null ? '' : text}', ${type})`
);
export const SQL_INSERT_INSPECTION = (name: string, number: string, scriptId: number, property_id: number, invoice_id: number) => (
    `INSERT INTO inspection (name, number, scriptId, property_id, invoice_id) VALUES ('${name}', '${number}', ${scriptId}, ${property_id}, ${invoice_id})`
);
export const SQL_INSERT_SECTION = (name: string, number: string, sectionIndex: number, scriptId: number, tag?: string) => (
    `INSERT INTO section (name, number, sectionIndex, script_id, tag) VALUES ('${name}', ${number}, ${sectionIndex}, ${scriptId}, '${(tag === null || tag === undefined) ? '' : tag}')`
);
export const SQL_INSERT_SUBSECTION = (name: string, number: number, subsectionIndex: number, scriptId: number, sectionId: number) => (
    `INSERT INTO subsection (name, number, subsectionIndex, script_id, section_id) VALUES ('${name}', ${number}, ${subsectionIndex}, ${scriptId}, ${sectionId})`
);
export const SQL_INSERT_OPTION = (name: string, number: string, scriptId: number, sectionId: number, subsectionId: number) => (
    `INSERT INTO option (name, number, script_id, section_id, subsection_id, hasAdded) VALUES ('${name === null ? '' : name}', ${number}, ${scriptId}, ${sectionId}, ${subsectionId}, 0)`
);
export const SQL_INSERT_VALUE = (isNa: number | undefined, number: number, commentListNumber: number, text: string, type: number, userText: string, 
    checked: number, scriptId: number, sectionId: number, subsectionId: number, optionId: number, isHighlighted?: number, highLightColor?: number) => (
    `INSERT INTO value (isNa, number, commentListNumber, text, type, userText, checked, script_id, section_id, subsection_id, option_id, isHighlighted, highLightColor, hasAdded) VALUES 
        (${isNa ? isNa : null}, ${number}, ${commentListNumber}, '${text}', ${type}, '${userText ?? ''}', ${checked}, ${scriptId}, ${sectionId}, ${subsectionId}, ${optionId}, ${isHighlighted ? isHighlighted : 0}, ${highLightColor ? highLightColor : 0}, 1)`
);
export const SQL_INSERT_VALUE_OPTION = (checked: number, number: number, text: string, scriptId: number, sectionId: number, subsectionId: number, optionId: number, valueId: number, hasAdded: number) => (
    `INSERT INTO value_option (checked, number, text, script_id, section_id, subsection_id, option_id, value_id, hasAdded) VALUES 
        (${checked}, ${number}, '${text}', ${scriptId}, ${sectionId}, ${subsectionId}, ${optionId}, ${valueId}, ${hasAdded})`
);
export const SQL_INSERT_VALUE_OPTION_VALUE_ARRAY = (checked: number, number: string, text: string, scriptId: number, sectionId: number, subsectionId: number, optionId: number, valueId: number) => (
    [checked, number, text, scriptId, sectionId, subsectionId, optionId, valueId, 0]
);
export const SQL_INSERT_SUBECTION_PHOTO = (filename: string, inspectionId: number, sectionId: number, subsectionId: number, optionId: number | undefined) => (
    `INSERT INTO photo (filename, inspectionId, sectionId, subsectionId, optionId) VALUES 
        ('${filename}', ${inspectionId}, ${sectionId}, ${subsectionId}, ${optionId ? optionId : null})`
);
export const SQL_INSERT_INVOICE = () => (
    `INSERT INTO invoice (totalFee) VALUES (0)`
);
export const SQL_INSERT_INVOICE_PAYMENT = (invoiceId: number) => (
    `INSERT INTO invoice_payment (paymentMethod, invoice_id) VALUES ('Cash', ${invoiceId})`
);
export const SQL_INSERT_IMAGE = (fileName: string, inspectionId?: number, accountId?: number, userId?: number) => (
    `INSERT INTO image (fileName, account_id, inspection_id, user_id)
     VALUES ('${fileName}', ${accountId ? accountId : null}, ${inspectionId ? inspectionId : null}, ${userId ? userId : null})`
);
export const SQL_INSERT_CLOUD_ACCOUNT = () => (
    `INSERT INTO cloud_account (id, isEnabled) VALUES (1, 1)`
);
export const SQL_INSERT_CLOUD_ACCOUT_ADDRESS = (addressId: number) => (
    `INSERT INTO cloud_account_address (cloud_account_id, addresses_id) VALUES (1, ${addressId})`
);
export const SQL_INSERT_CLOUD_ACCOUT_EMAIL = (emailId: number) => (
    `INSERT INTO cloud_account_email (cloud_account_id, emails_id) VALUES (1, ${emailId})`
);
export const SQL_INSERT_CLOUD_ACCOUT_PHONE_NUMBER = (phonenumberId: number) => (
    `INSERT INTO cloud_account_phonenumber (cloud_account_id, phonenumbers_id) VALUES (1, ${phonenumberId})`
);
export const SQL_INSERT_USER = () => (
    `INSERT INTO application_user (id, enabled, firstTimeAccess, account_id, userPreference_id) VALUES (1, 1, 1, 1, 1)`
);
export const SQL_INSERT_USER_ADDRESS = (addressId: number) => (
    `INSERT INTO application_user_address (application_user_id, addresses_id) VALUES (1, ${addressId})`
);
export const SQL_INSERT_USER_EMAIL = (emailId: number) => (
    `INSERT INTO application_user_email (application_user_id, emails_id) VALUES (1, ${emailId})`
);
export const SQL_INSERT_USER_PHONE_NUMBER = (phonenumberId: number) => (
    `INSERT INTO application_user_phonenumber (application_user_id, phonenumbers_id) VALUES (1, ${phonenumberId})`
);
export const SQL_INSERT_CONTACT = (firstName: string, lastName: string, tag: string) => (
    `INSERT INTO contact (firstName, lastName, displayName, tag, account_id) VALUES 
        ('${firstName}', '${lastName}', '${firstName} ${lastName}', '${tag}', 1)`
);
export const SQL_INSERT_INSPECTION_CONTACT = (contactId: number, inspectionId: number) => (
    `INSERT INTO inspection_contact (contact_id, inspection_id) VALUES 
        (${contactId}, ${inspectionId})`
);
export const SQL_INSERT_CONTACT_ADDRESS = (contactId: number, addressId: number) => (
    `INSERT INTO contact_address (contact_id, addresses_id) VALUES (${contactId}, ${addressId})`
);
export const SQL_INSERT_CONTACT_EMAIL = (contactId: number, emailId: number) => (
    `INSERT INTO contact_email (contact_id, emails_id) VALUES (${contactId}, ${emailId})`
);
export const SQL_INSERT_CONTACT_PHONE_NUMBER = (contactId: number, phonenumberId: number) => (
    `INSERT INTO contact_phonenumber (contact_id, phonenumbers_id) VALUES (${contactId}, ${phonenumberId})`
);
export const SQL_INSERT_CONTACT_LICENSE = (contactId: number, licenseId: number) => (
    `INSERT INTO contact_license (contact_id, licenses_id) VALUES (${contactId}, ${licenseId})`
);
export const SQL_INSERT_RELATED_CONTACT = (contactId: number, inspectionId: number) => (
    `INSERT INTO related_contact (contact_id, inspection_id) VALUES 
        (${contactId}, ${inspectionId})`
);
export const SQL_INSERT_COMMENT = (groupId: number, number: number, name: string, text: string) => (
    `INSERT INTO comment (name, number, text, comment_group_id) VALUES 
        ('${name}', ${number}, '${text}', ${groupId})`
);
export const SQL_INSERT_BULK_COMMENTS = (jsonString: string) => (
    `INSERT INTO comment (name, number, text, comment_group_id) VALUES ${jsonString}`
);
export const SQL_INSERT_COMMENT_GROUP = (name: string, number: number) => (
    `INSERT INTO comment_group (name, number, hasAdded) VALUES ('${name}', ${number}, 1)`
);
export const SQL_INSERT_NEW_VALUE_TO_TEMPLATE = (type: number, isNa: number, number: number, text: string,
    scriptId: number, sectionId: number, subsectionId: number, optionId: number, isHighlighted: number,
    highLightColor: number) => (
    `INSERT INTO value (isNa, number, text, type, script_id, section_id, subsection_id, option_id, isHighlighted, highLightColor, hasAdded) VALUES 
        (${isNa}, ${number}, '${text}', ${type}, ${scriptId}, ${sectionId}, ${subsectionId}, ${optionId}, ${isHighlighted}, ${highLightColor}, 1)`
);
export const SQL_INSERT_NEW_CHECKBOX_TO_TEMPLATE = (isNa: number, number: number, text: string,
    scriptId: number, sectionId: number, subsectionId: number, optionId: number, isHighlighted: number,
    highLightColor: number) => SQL_INSERT_NEW_VALUE_TO_TEMPLATE(0, isNa, number, text,
        scriptId, sectionId, subsectionId, optionId, isHighlighted, highLightColor);
export const SQL_INSERT_EVENT = (groupId: number, number: number, name: string, text: string) => (
    `INSERT INTO comment (name, number, text, comment_group_id) VALUES 
                ('${name}', ${number}, '${text}', ${groupId})`
);
export const SQL_INSERT_DB_VERSION = (versionCode: number) => (
    `INSERT INTO version_updates (versionCode, hasRun, success, lastAttempt) VALUES (${versionCode}, 1, 0, ${new Date().getTime()})`
);
export const SQL_INSERT_NEW_SERVICE = (serviceName: string) => (
    `INSERT INTO service (description, price, enabled, isCustom) VALUES ('${serviceName}', 0, 1, 1);`
);
export const SQL_INSERT_NEW_INSPECTION_SERVICE = (inspectionId: number, serviceName: string, price: number) => (
    `INSERT INTO service (description, price, discount, inspection_id) VALUES ('${serviceName}', ${price}, 0, ${inspectionId});`
);
export const SQL_INSERT_PIA = (text: string) => (
    `INSERT INTO agreement (piaText) VALUES ('${text}')`
);
export const SQL_INSERT_ERROR = (screen: string, area: string, error: string, stackTrace: string) => (
    `INSERT INTO error_log (screen, area, error, stackTrace) VALUES ('${screen}', '${area}', '${error}', '${stackTrace}')`
);

// UPDATE
export const SQL_UPDATE_CHECKBOX_VALUE = (id: number, checked: boolean) => (
    `UPDATE value SET checked = ${checked ? 1 : 0} WHERE id = ${id}`
);
export const SQL_UPDATE_CHECKBOX_VALUE_OPTION = (id: number, checked: boolean) => (
    `UPDATE value_option SET checked = ${checked ? 1 : 0} WHERE id = ${id}`
);
export const SQL_UPDATE_TEXT_VALUE = (id: number, text: string) => (
    `UPDATE value SET userText = '${text}' WHERE id = ${id}`
);
export const SQL_UPDATE_IMAGE = (id: number, fileName: string) => (
    `UPDATE image SET fileName = '${fileName}' WHERE id = ${id}`
);
export const SQL_UPDATE_STRING = (table: string, column: string, value: string, id: number) => (
    `UPDATE ${table} SET ${column} = '${value}' WHERE id = ${id}`
);
export const SQL_UPDATE_SCRIPT_OVERVIEW_SUMMARY = (id: number, overviewId: number, summaryId: number) => (
    `UPDATE script SET overview_id = ${overviewId}, summary_id = ${summaryId} WHERE id = ${id}`
);
export const SQL_UPDATE_SCRIPT = (id: number, name: string, overviewId: number, tag: string, summaryId: number, version: number) => (
    `UPDATE script SET name = '${name}', overview_id = ${overviewId}, tag = '${tag}', summary_id = ${summaryId}, version = ${version} WHERE id = ${id}`
);
export const SQL_UPDATE_PHOTO_COMMENT = (id: number, value: string) => (
    `UPDATE photo SET comment = '${value}' WHERE id = ${id}`
);
export const SQL_UPDATE_DISCOUNT = (inspectionId: number, amount: number) => (
    `UPDATE inspection SET discountAmount = ${amount} WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_FEE = (inspectionId: number, amount: number) => (
    `UPDATE inspection SET fee = ${amount} WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_INSPECTION_NAME = (name: string, inspectionId: number) => (
    `UPDATE inspection SET name = '${name}', displayName = '${name}' WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_INSPECTION_NUMBER = (number: string, inspectionId: number) => (
    `UPDATE inspection SET number = '${number}' WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_COMMENT_NUMBER = (commentId: number, number: number) => (
    `UPDATE comment SET number = ${number} WHERE id = ${commentId}`
);
export const SQL_UPDATE_ADDRESS = (address: IAddress, addressId: number) => (
    `UPDATE address SET city = '${address.city}', state = '${address.state}', 
        street = '${address.addr1}', street2 = '${address.addr2}', zipCode = '${address.zip}',
        type = '${address.type}', isPrimary = ${address.isPrimary ? 1 : 0}
        WHERE id = ${addressId}`
);
export const SQL_UPDATE_EMAIL = (email: IEmail, emailId: number) => (
    `UPDATE email SET emailAddress = '${email.email}',
        emailType = '${email.type}', isPrimary = ${email.isPrimary ? 1 : 0}
        WHERE id = ${emailId}`
);
export const SQL_UPDATE_PHONE_NUMBER = (phoneNumber: IPhonenumber, phonenumberId: number) => (
    `UPDATE phonenumber SET phoneNumber = '${phoneNumber.number}',
        phoneType = '${phoneNumber.type}', extension = '${phoneNumber.extension}',
        isPrimary = ${phoneNumber.isPrimary ? 1 : 0}
        WHERE id = ${phonenumberId}`
);
export const SQL_UPDATE_LICENSE = (license: ILicense, licenseId: number) => (
    `UPDATE license SET licenseNumber = '${license.licenseNumber}',
        startDate = ${license.startDate}, state = '${license.state}',
        type = '${license.type}'
        WHERE id = ${licenseId}`
);
export const SQL_UPDATE_STATUS = (status: string, inspectionId: number) => (
    `UPDATE inspection SET status = '${status}' WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_INSPECTION_FEE = (fee: number, inspectionId: number) => (
    `UPDATE inspection SET fee = ${fee} WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_INSPECTION_DISCOUNT = (discount: number, inspectionId: number) => (
    `UPDATE inspection SET discountAmount = ${discount} WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_INVOICE_TOTAL = (amount: number, invoiceId: number) => (
    `UPDATE invoice SET totalFee = ${amount} WHERE id = ${invoiceId}`
);
export const SQL_UPDATE_INVOICE_PAYMENT_METHOD = (method: string, invoicePaymentId: number) => (
    `UPDATE invoice_payment SET paymentMethod = '${method}' WHERE id = ${invoicePaymentId}`
);
export const SQL_UPDATE_INVOICE_AMOUNT = (amount: number, invoicePaymentId: number) => (
    `UPDATE invoice_payment SET amount = ${amount} WHERE id = ${invoicePaymentId}`
);
export const SQL_UPDATE_INVOICE_CHECK_NUMBER = (checkNumber: string, invoicePaymentId: number) => (
    `UPDATE invoice_payment SET checkNumber = '${checkNumber}' WHERE id = ${invoicePaymentId}`
);
export const SQL_UPDATE_PROPERTY_STRING_FIELD = (field: string, value: string, propertyId: number) => (
    `UPDATE property SET ${field} = '${value}' WHERE id = ${propertyId}`
);
export const SQL_UPDATE_PROPERTY_NUMBER_FIELD = (field: string, value: number, propertyId: number) => (
    `UPDATE property SET ${field} = ${value} WHERE id = ${propertyId}`
);
export const SQL_UPDATE_OVERVIEW_TEXT = (id: number, text: string) => (
    `UPDATE overview_section SET text = '${text}' WHERE id = ${id}`
);
export const SQL_UPDATE_OVERVIEW_NAME = (id: number, name: string) => (
    `UPDATE overview_section SET name = '${name}' WHERE id = ${id}`
);
export const SQL_UPDATE_OVERVIEW_NUMBER = (id: number, number: number) => (
    `UPDATE overview_section SET number = '${number}' WHERE id = ${id}`
);
export const SQL_UPDATE_OVERVIEW_COMMENT_GROUP_ID = (id: number, commentListNumber: number) => (
    `UPDATE overview_section SET commentListNumber = ${commentListNumber} WHERE id = ${id}`
);
export const SQL_UPDATE_SUMMARY_TEXT = (id: number, text: string) => (
    `UPDATE summary_section SET text = '${text}' WHERE id = ${id}`
);
export const SQL_UPDATE_SUMMARY_NAME = (id: number, name: string) => (
    `UPDATE summary_section SET name = '${name}' WHERE id = ${id}`
);
export const SQL_UPDATE_SUMMARY_COMMENT_GROUP_ID = (id: number, commentListNumber: number) => (
    `UPDATE summary_section SET commentListNumber = ${commentListNumber} WHERE id = ${id}`
);
export const SQL_UPDATE_SUMMARY_NUMBER = (id: number, number: number) => (
    `UPDATE summary_section SET number = '${number}' WHERE id = ${id}`
);
export const SQL_UPDATE_COVER_PHOTO = (coverPhotoId: number, inspectionId: number) => (
    `UPDATE inspection SET coverPhotoId = ${coverPhotoId} WHERE id = ${inspectionId}`
);
export const SQL_UPDATE_CLOUD_ACCOUNT_NAME = (name: string) => (
    `UPDATE cloud_account SET name = '${name}' where cloud_account.id = 1`
);
export const SQL_UPDATE_CLOUD_ACCOUNT_STATES_NOT_INCLUDED = (text: string) => (
    `UPDATE cloud_account SET statesNotIncluded = '${text}' where cloud_account.id = 1`
);
export const SQL_UPDATE_INSPECTOR_FIRST_NAME = (text: string) => (
    `UPDATE application_user SET firstName = '${text}' where application_user.id = 1`
);
export const SQL_UPDATE_INSPECTOR_LAST_NAME = (text: string) => (
    `UPDATE application_user SET lastName = '${text}' where application_user.id = 1`
);
export const SQL_UPDATE_INSPECTOR_DISPLAY_NAME = (firstName: string, lastName: string) => (
    `UPDATE application_user SET displayName = '${firstName} ${lastName}' where application_user.id = 1`
);
export const SQL_UPDATE_CONTACT = (contactId: number, firstName: string, lastName: string, tag: string) => (
    `UPDATE contact SET firstName = '${firstName}', lastName = '${lastName}', displayName = '${firstName} ${lastName}', tag = '${tag}'
        WHERE id = ${contactId}`
);
export const SQL_UPDATE_COMMENT = (commentId: number, name: string, text: string) => (
    `UPDATE comment SET name = '${name}', text = '${text}' where id = ${commentId}`
);
export const SQL_UPDATE_COMMENT_GROUP = (commentGroupId: number, name: string) => (
    `UPDATE comment_group SET name = '${name}' where id = ${commentGroupId}`
);
export const SQL_UPDATE_VALUE_TEXT = (id: number, title: string) => (
    `UPDATE value SET text = '${title}' WHERE id = ${id}`
);
export const SQL_UPDATE_SCRIPT_NAME = (id: number, title: string) => (
    `UPDATE script SET name = '${title}' WHERE id = ${id}`
);
export const SQL_UPDATE_OPTION_NAME = (id: number, title: string) => (
    `UPDATE option SET name = '${title}' WHERE id = ${id}`
);
export const SQL_UPDATE_SUBSECTION_NAME = (id: number, title: string) => (
    `UPDATE subsection SET name = '${title}' WHERE id = ${id}`
);
export const SQL_UPDATE_SECTION_NAME = (id: number, title: string) => (
    `UPDATE section SET name = '${title}' WHERE id = ${id}`
);
export const SQL_UPDATE_SECTION_TAG = (id: number, tag?: string) => (
    `UPDATE section SET tag = '${tag ?? ''}' WHERE id = ${id}`
);
export const SQL_UPDATE_VALUE_OPTION_NAME = (id: number, text: string) => (
    `UPDATE value_option SET text = '${text}' WHERE id = ${id}`
);
export const SQL_UPDATE_SECTION_NUMBER = (id: number, number: number) => (
    `UPDATE section SET number = ${number} WHERE id = ${id}`
);
export const SQL_UPDATE_SUBSECTION_NUMBER = (id: number, number: number) => (
    `UPDATE subsection SET number = ${number} WHERE id = ${id}`
);
export const SQL_UPDATE_OPTION_NUMBER = (id: number, number: number) => (
    `UPDATE option SET number = ${number} WHERE id = ${id}`
);
export const SQL_UPDATE_VALUE_NUMBER = (id: number, number: number) => (
    `UPDATE value SET number = ${number} WHERE id = ${id}`
);
export const SQL_UPDATE_VALUE_OPTION_NUMBER = (id: number, number: number) => (
    `UPDATE value_option SET number = ${number} WHERE id = ${id}`
);
export const SQL_APPEND_TO_SUMMARY_SECTION = (id: number, text: string) => (
    `
    UPDATE summary_section 
    SET text = CASE WHEN text is null THEN '${text}' ELSE text || '\n${text}' END
    WHERE id = ${id}
    `
);
export const SQL_UPDATE_VALUE_HIGHLIGHT = (id: number, highlight?: number) => (
    `UPDATE value SET highLightColor = ${highlight ?? 0}, isHighlighted = ${highlight ? 1 : 0} WHERE id = ${id}`
);
export const SQL_UPDATE_DB_VERSION_TIMESTAMP = (id: number) => (
    `UPDATE version_updates SET lastAttempt = ${new Date().getTime()} WHERE id = ${id}`
);
export const SQL_UPDATE_DB_VERSION_SUCCESS = (id: number) => (
    `UPDATE version_updates SET success = 1 WHERE id = ${id}`
);
export const SQL_UPDATE_INSPECTION_DATE = (id: number, date: number) => (
    `UPDATE inspection SET inspection_date = ${date} WHERE id = ${id}`
);
export const SQL_UPDATE_SIGNATURE = (id: number) => (
    `UPDATE application_user SET signatureId = '${id}' WHERE id = 1`
);
export const SQL_UPDATE_SERVICE_PRICE = (id: number, price: number) => (
    `UPDATE service SET price = ${price} WHERE id = ${id}`
);
export const SQL_UPDATE_SERVICE_ENABLED = (id: number, enabled: number) => (
    `UPDATE service SET enabled = ${enabled} WHERE id = ${id}`
);
export const SQL_UPDATE_SERVICE_DISCOUNT = (id: number, discount: number) => (
    `UPDATE service SET discount = ${discount} WHERE id = ${id}`
);
export const SQL_UPDATE_VALUE_COMMENT_GROUP = (id: number, commentListNumber: number) => (
    `UPDATE value SET commentListNumber = ${commentListNumber} WHERE id = ${id}`
);
export const SQL_UPDATE_INSPECTION_CONTACT_SIG = (contactId: number, sigPath: string) => (
    `UPDATE inspection_contact SET contactSignaturePath = '${sigPath}' WHERE id = ${contactId}`
);

// DELETE
export const SQL_DELETE_OVERVIEW_SECTION = (overviewId: number) => (
    `DELETE FROM overview_section WHERE id = ${overviewId}`
);
export const SQL_DELETE_SUMMARY_SECTIONS = (sectionIds: number[]) => {
    const ids = sectionIds.join().split(',');
    return `DELETE FROM summary_section WHERE id IN (${ids})`
};
export const SQL_DELETE_SUMMARY_SUBSECTIONS = (sectionIds: number[]) => {
    const ids = sectionIds.join().split(',');
    return `DELETE FROM summary_subsection WHERE section_id IN (${ids})`
};
export const SQL_DELETE_SECTION = (scriptId: number) => (
    `DELETE FROM section where script_id=${scriptId}`
);
export const SQL_DELETE_SUBSECTION = (scriptId: number) => (
    `DELETE FROM subsection where script_id=${scriptId}`
);
export const SQL_DELETE_OPTION = (scriptId: number) => (
    `DELETE FROM option where script_id=${scriptId}`
);
export const SQL_DELETE_VALUE = (scriptId: number) => (
    `DELETE FROM value where script_id=${scriptId}`
);
export const SQL_DELETE_VALUE_OPTION = (scriptId: number) => (
    `DELETE FROM value_option where script_id=${scriptId}`
);
export const SQL_DELETE_OVERVIEW = (scriptId: number) => (
    `DELETE FROM overview WHERE script_id = ${scriptId}`
);
export const SQL_DELETE_SUMMARY = (scriptId: number) => (
    `DELETE FROM summary WHERE script_id = ${scriptId}`
);
export const SQL_DELETE_INVOICE = (invoiceId: number) => (
    `DELETE FROM invoice WHERE id = ${invoiceId}`
);
export const SQL_DELETE_INVOICE_PAYMENTS = (invoiceId: number) => (
    `DELETE FROM invoice_payment WHERE invoice_id = ${invoiceId}`
);
export const SQL_DELETE_INSPECTION = (scriptId: number) => (
    `DELETE FROM inspection WHERE scriptId = ${scriptId}`
);
export const SQL_DELETE_SCRIPT = (scriptId: number) => (
    `DELETE FROM script WHERE id = ${scriptId}`
);
export const SQL_DELETE_PHOTO = (id: number) => (
    `DELETE FROM photo WHERE id = ${id}`
);
export const SQL_DELETE_IMAGE = (id: number) => (
    `DELETE FROM image WHERE id = ${id}`
);
export const SQL_DELETE_ADDRESS = (addressId: number) => (
    `DELETE FROM address WHERE id = ${addressId}`
);
export const SQL_DELETE_EMAIL = (emailId: number) => (
    `DELETE FROM email WHERE id = ${emailId}`
);
export const SQL_DELETE_PHONE_NUMBER = (phonenumberId: number) => (
    `DELETE FROM phonenumber WHERE id = ${phonenumberId}`
);
export const SQL_DELETE_CLOUD_ACCOUNT_ADDRESS = (addressId: number) => (
    `DELETE FROM cloud_account_address WHERE addresses_id = ${addressId}`
);
export const SQL_DELETE_CLOUD_ACCOUNT_EMAIL = (emailId: number) => (
    `DELETE FROM cloud_account_email WHERE emails_id = ${emailId}`
);
export const SQL_DELETE_CLOUD_ACCOUNT_PHONE_NUMBERS = (phonenumberId: number) => (
    `DELETE FROM cloud_account_phonenumber WHERE phonenumbers_id = ${phonenumberId}`
);
export const SQL_DELETE_USER_ADDRESS = (addressId: number) => (
    `DELETE FROM application_user_address WHERE addresses_id = ${addressId}`
);
export const SQL_DELETE_USER_EMAIL = (emailId: number) => (
    `DELETE FROM application_user_email WHERE emails_id = ${emailId}`
);
export const SQL_DELETE_USER_PHONE_NUMBERS = (phonenumberId: number) => (
    `DELETE FROM application_user_phonenumber WHERE phonenumbers_id = ${phonenumberId}`
);
export const SQL_DELETE_INSPECTION_CONTACT = (inpsectionContactId: number) => (
    `DELETE FROM inspection_contact WHERE contact_id = ${inpsectionContactId}`
);
export const SQL_DELETE_RELATED_CONTACT = (relatedContactId: number) => (
    `DELETE FROM related_contact WHERE contact_id = ${relatedContactId}`
);
export const SQL_RESET_CONTACT_ADDRESSES = (contactId: number) => (
    `DELETE FROM contact_address WHERE contact_id = ${contactId}`
);
export const SQL_RESET_CONTACT_EMAILS = (contactId: number) => (
    `DELETE FROM contact_email WHERE contact_id = ${contactId}`
);
export const SQL_RESET_CONTACT_PHONENUMBERS = (contactId: number) => (
    `DELETE FROM contact_phonenumber WHERE contact_id = ${contactId}`
);
export const SQL_RESET_CONTACT_LICENSES = (contactId: number) => (
    `DELETE FROM contact_license WHERE contact_id = ${contactId}`
);
export const SQL_DELETE_COMMENT = (commentId: number) => (
    `DELETE FROM comment WHERE id = ${commentId}`
);
export const SQL_DELETE_VALUE_BY_ID = (valueId: number) => (
    `DELETE FROM value WHERE id = ${valueId}`
);
export const SQL_DELETE_OPTION_BY_OPTION_ID = (optionId: number) => (
    `DELETE FROM option where id = ${optionId}`
);
export const SQL_DELETE_VALUE_BY_OPTION_ID = (optionId: number) => (
    `DELETE FROM value where option_id = ${optionId}`
);
export const SQL_DELETE_VALUE_OPTION_BY_OPTION_ID = (optionId: number) => (
    `DELETE FROM value_option where option_id = ${optionId}`
);
export const SQL_DELETE_VALUE_OPTION_BY_VALUE_ID = (valueId: number) => (
    `DELETE FROM value_option where value_id = ${valueId}`
);
export const SQL_DELETE_SUBSECTION_BY_SUBSECTION_ID = (subsectionId: number) => (
    `DELETE FROM subsection WHERE id = ${subsectionId}`
);
export const SQL_DELETE_OPTION_BY_SUBSECTION_ID = (subsectionId: number) => (
    `DELETE FROM option where subsection_id = ${subsectionId}`
);
export const SQL_DELETE_VALUE_BY_SUBSECTION_ID = (subsectionId: number) => (
    `DELETE FROM value_option where subsection_id = ${subsectionId}`
);
export const SQL_DELETE_VALUE_OPTION_BY_SUBSECTION_ID = (subsectionId: number) => (
    `DELETE FROM value where subsection_id = ${subsectionId}`
);
export const SQL_DELETE_SECTION_BY_SECTION_ID = (sectionId: number) => (
    `DELETE FROM section WHERE id = ${sectionId}`
);
export const SQL_DELETE_SUBSECTION_BY_SECTION_ID = (sectionId: number) => (
    `DELETE FROM subsection WHERE section_id = ${sectionId}`
);
export const SQL_DELETE_OPTION_BY_SECTION_ID = (sectionId: number) => (
    `DELETE FROM option where section_id = ${sectionId}`
);
export const SQL_DELETE_VALUE_BY_SECTION_ID = (sectionId: number) => (
    `DELETE FROM value_option where section_id = ${sectionId}`
);
export const SQL_DELETE_VALUE_OPTION_BY_SECTION_ID = (sectionId: number) => (
    `DELETE FROM value where section_id = ${sectionId}`
);
export const SQL_DELETE_VALUE_OPTION_BY_ID = (id: number) => (
    `DELETE FROM value_option where id = ${id}`
);
export const SQL_DELETE_SERVICE = (id: number) => (
    `DELETE FROM service where id = ${id}`
);
export const SQL_DELETE_INVOICE_PAYMENT = (id: number) => (
    `DELETE FROM invoice_payment where id = ${id}`
);
export const SQL_DELETE_SUMMARY_SECTION = (id: number) => (
    `DELETE FROM summary_section where id = ${id}`
);
export const SQL_DELETE_SUMMARY_SUBSECTION_BY_SECTION_ID = (id: number) => (
    `DELETE FROM summary_subsection where section_id = ${id}`
);
export const SQL_DELETE_COMMENT_GROUP = (id: number) => (
    `DELETE FROM comment_group WHERE id = ${id}`
);
export const SQL_DELETE_COMMENT_BY_COMMENT_GROUP_ID = (id: number) => (
    `DELETE FROM comment WHERE comment_group_id = ${id}`
);

// Report Generation SQL
export const SQL_GENERATE_INSPECTION_REPORT = (inspectionId: number) => (
    `SELECT address.city, address.state, address.street, address.street2, address.zipCode, inspection.number, 
    invoice.totalFee, invoice.id as invoiceId, I1.fileName as coverFileName, inspection.fee as inspectionFee, 
    inspection.discountAmount as inspectionDiscount, I2.fileName as logoFileName, inspection.inspection_date as inspectionDate,
    cloud_account.*
    from inspection
    INNER JOIN PROPERTY ON INSPECTION.property_id = PROPERTY.id
    INNER JOIN ADDRESS ON PROPERTY.address_id = ADDRESS.id
    INNER JOIN INVOICE ON INSPECTION.invoice_id = INVOICE.id
    LEFT OUTER JOIN IMAGE I1 ON INSPECTION.coverPhotoId = I1.id
    LEFT OUTER JOIN IMAGE I2 ON 1 = I2.account_id
	LEFT OUTER JOIN  cloud_account
    where inspection.id = ${inspectionId}`
);
export const SQL_GENERATE_INSPECTION_REPORT_OVERVIEW = (inspectionId: number) => (
    `SELECT distinct OVERVIEW_SECTION.*
    from inspection
    INNER JOIN SCRIPT ON INSPECTION.scriptId = SCRIPT.id 
    INNER JOIN OVERVIEW ON SCRIPT.id = OVERVIEW.script_id 
    INNER JOIN OVERVIEW_SECTION ON OVERVIEW.id = OVERVIEW_SECTION.overview_id 
    where inspection.id = ${inspectionId}
    ORDER BY overview_section.number`
);
export const SQL_GENERATE_INSPECTION_REPORT_SUMMARY = (inspectionId: number) => (
    `SELECT distinct SUMMARY_SECTION.*
    from inspection
    INNER JOIN SCRIPT ON INSPECTION.scriptId = SCRIPT.id
    INNER JOIN SUMMARY ON SCRIPT.id = SUMMARY.script_id
    INNER JOIN SUMMARY_SECTION ON SUMMARY.id = SUMMARY_SECTION.summary_id
    where inspection.id = ${inspectionId} AND summary_section.type = 0
    ORDER BY summary_section.number`
);
export const SQL_GENERATE_INSPECTION_REPORT_DATA = (inspectionId: number) => (
    `select  
    section.id as sectionId, section.name as sectionName, section.number as sectionOrder,
    subsection.id as subsectionId, subsection.name as subsectionName, subsection.number as subsectionOrder,
    option.id as optionId, option.name as optionName, option.number as optionOrder,
    value.id as valueId, value.checked as checked, value.text as valueText, value.userText as userText, value.type as valueType,
    value.number as valueOrder, value.isHighlighted as isHighlighted, value.highLightColor as highLightColor,
    value_option.value_id as valueOptionId, value_option.checked as valueOptionChecked, value_option.text as valueOptionText,
    value_option.number as valueOptionOrder
    from inspection 
    INNER JOIN SCRIPT ON INSPECTION.scriptId = SCRIPT.id
    JOIN section on section.script_id = SCRIPT.id
    JOIN subsection on subsection.section_id = section.id
    JOIN option on option.subsection_id = subsection.id
    JOIN value on value.option_id = option.id
    LEFT OUTER JOIN value_option on value_option.value_id = value.id
    where inspection.id = ${inspectionId}`
);
