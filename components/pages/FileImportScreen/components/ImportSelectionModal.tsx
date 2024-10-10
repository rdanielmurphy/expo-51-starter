import React, { useCallback, useEffect } from 'react'
import { Dialog } from 'react-native-simple-dialogs';
import * as DocumentPicker from 'expo-document-picker';
import * as SQLite from 'expo-sqlite/next';
import * as FileSystem from "expo-file-system";
import TreeView from '../../../shared/TreeView';
import { ILeafItem } from '../../../shared/TreeView/components/TreeLeaf';
import { ScrollView } from 'react-native-gesture-handler';
import { ModalButtons } from '../../../shared/ModalButtons';
import { ProgressBar } from 'react-native-paper';
import {
    SQL_GET_ALL_COMMENTS, SQL_GET_COMMENT_GROUPS, SQL_GET_CONTACT_ADDRESSES, SQL_GET_CONTACT_EMAILS,
    SQL_GET_CONTACT_LICENSES, SQL_GET_CONTACT_PHONENUMBERS, SQL_GET_MASTER_OVERVIEW_SECTION, SQL_GET_MASTER_SUMMARY_SECTION,
    SQL_GET_MAX_COMMENT_GROUP_NUMBER, SQL_GET_OPTIONS_BY_SECTIONS, SQL_GET_SECTIONS, SQL_GET_SUBSECTIONS_BY_SECTIONS,
    SQL_GET_VALUES_BY_SECTIONS, SQL_GET_VALUE_OPTIONS_BY_SECTIONS, SQL_INSERT_ADDRESS,
    SQL_INSERT_COMMENT, SQL_INSERT_COMMENT_GROUP, SQL_INSERT_CONTACT, SQL_INSERT_CONTACT_ADDRESS, SQL_INSERT_CONTACT_EMAIL,
    SQL_INSERT_CONTACT_LICENSE, SQL_INSERT_CONTACT_PHONE_NUMBER, SQL_INSERT_EMAIL, SQL_INSERT_LICENSE,
    SQL_INSERT_OVERVIEW_SECTION, SQL_INSERT_PHONE_NUMBER, SQL_INSERT_SUMMARY_SECTION
}
    from '../../../../lib/sqlCommands';
import LoadingText from '../../../shared/ProgressText';
import { View } from 'react-native';
import { ITemplate, ITemplateOption, ITemplateSection, ITemplateSubSection, ITemplateValue } from '../../../../lib/defaultTemplateScripts';
import { IImportableCommentGroup, importTemplate } from '../../../../lib/importer';
import { getRandomInt } from '../../../../lib/random';
import { useDbContext } from '../../../../contexts/DbContext';
import { ICommentGroup, IOverviewSection, ISummarySection } from '../../../../lib/types';
import { IComment } from '../../../../lib/defaultComments';
import { escapeString } from '../../../../lib/databaseDataHelper';

export interface IImportInspectITModalResult {
    success: boolean
    message: string
}

export interface IImportInspectITModalProps {
    doc?: DocumentPicker.DocumentPickerAsset
    onClose: (result?: IImportInspectITModalResult) => void
}

const INSPECTIT_DB_NAME = `inspectIT+${getRandomInt(1, 999)}.db`;
const INSPECTIT_DB_DIR = FileSystem.documentDirectory + 'SQLite';
const INSPECTIT_DB_PATH = INSPECTIT_DB_DIR + '/' + INSPECTIT_DB_NAME;

const IMPORT_SCRIPTS_KEY = 'Inspection Templates';
const IMPORT_CONTACTS_KEY = 'Contacts';
const IMPORT_SUMMARY_KEY = 'Summary';
const IMPORT_OVERVIEW_KEY = 'Overview';

const getDBRows = async (db: SQLite.SQLiteDatabase, sqlQuery: string): Promise<any[]> => {
    return db ? db.getAllAsync(sqlQuery) : [];
}

export const ImportInspectITModal = ({ doc, onClose }: IImportInspectITModalProps) => {
    const [uiReady, setUiReady] = React.useState<boolean>(false);
    const [importing, setImporting] = React.useState<boolean>(false);
    const [itemsMap, setItemsMap] = React.useState<Map<string, ILeafItem[]>>();
    const [scripts, setScripts] = React.useState<any[]>();
    const [contacts, setContacts] = React.useState<any[]>();
    const [summary, setSummary] = React.useState<any[]>();
    const [overview, setOverview] = React.useState<any[]>();
    const [importProgress, setImportProgress] = React.useState<number>(0);
    const [confirmDisabled, setConfirmedDisabled] = React.useState<boolean>(true);
    const [sqliteDb, setSqliteDb] = React.useState<SQLite.SQLiteDatabase>();
    const [sqliteDbPath, setSqliteDbPath] = React.useState<string>();
    const [selectedIds, setSelectedIds] = React.useState<Map<string, number[]>>();
    const { ready, execAsync, getFirstAsync, runAsync } = useDbContext();

    async function deleteDatabaseIfExists(): Promise<void> {
        if ((await FileSystem.getInfoAsync(INSPECTIT_DB_PATH)).exists) {
            await FileSystem.deleteAsync(INSPECTIT_DB_PATH);
        }
    }

    async function openDatabase(pathToDatabaseFile: string): Promise<SQLite.SQLiteDatabase> {
        if (!(await FileSystem.getInfoAsync(INSPECTIT_DB_DIR)).exists) {
            await FileSystem.makeDirectoryAsync(INSPECTIT_DB_DIR);
        }
        deleteDatabaseIfExists();
        await FileSystem.copyAsync({
            from: pathToDatabaseFile,
            to: INSPECTIT_DB_PATH
        });
        return SQLite.openDatabaseAsync(INSPECTIT_DB_NAME);
    }

    useEffect(() => {
        const getData = async () => {
            setUiReady(false);

            try {
                if (doc && doc.uri) {
                    const db = await openDatabase(doc?.uri);
                    setSqliteDb(db);
                    setSqliteDbPath(doc.uri);

                    const theItemsMap = new Map<string, ILeafItem[]>();

                    // Get scripts
                    const scriptsRows = await getDBRows(db, 'SELECT * FROM script WHERE master = 1;');
                    theItemsMap.set(IMPORT_SCRIPTS_KEY, scriptsRows.map(r => ({
                        title: r.name,
                        id: r.id,
                    } as ILeafItem)))
                    setScripts(scriptsRows);

                    // Get Summary
                    const summaryRows = await getDBRows(db, 'SELECT * FROM summary_section where type = 0;');
                    theItemsMap.set(IMPORT_SUMMARY_KEY, summaryRows.map(r => ({
                        title: r.name,
                        id: r.id,
                    } as ILeafItem)))
                    setSummary(summaryRows);

                    // Get Overview
                    const overviewRows = await getDBRows(db, 'SELECT * FROM overview_section;');
                    theItemsMap.set(IMPORT_OVERVIEW_KEY, overviewRows.map(r => ({
                        title: r.name,
                        id: r.id,
                    } as ILeafItem)))
                    setOverview(overviewRows);

                    // Get contacts
                    const contactsRows = await getDBRows(db, 'SELECT * FROM contact;');
                    theItemsMap.set(IMPORT_CONTACTS_KEY, contactsRows.map(r => ({
                        title: r.displayName,
                        id: r.id,
                    } as ILeafItem)))
                    setContacts(contactsRows);

                    setItemsMap(theItemsMap);
                    setUiReady(true);
                } else {
                    onClose({
                        success: false,
                        message: "Failed to read InspectIT database"
                    });
                }
            } catch (e: any) {
                console.error('Failed to read InspectIT DB', e);
                onClose({
                    success: false,
                    message: "Failed to read InspectIT database"
                });
            } finally {
                setUiReady(true);
            }
        }

        getData();
    }, []);

    const handleClose = useCallback(() => {
        if (sqliteDb) {
            sqliteDb.closeAsync();
            if (sqliteDbPath) {
                SQLite.deleteDatabaseAsync(sqliteDbPath);
            }
        }
        onClose();
    }, [sqliteDb, sqliteDbPath, onClose]);

    const handleSubmit = useCallback(async () => {
        const commentGroupsMap: Map<number, IImportableCommentGroup> = new Map();
        const commentsMap: Map<number, IComment[]> = new Map();

        try {
            setImporting(true);
            setImportProgress(0);

            if (ready && sqliteDb) {
                // calculate progress
                const total = (selectedIds?.get(IMPORT_SCRIPTS_KEY)?.length ?? 0) + (selectedIds?.get(IMPORT_CONTACTS_KEY)?.length ?? 0);
                let progress = 0;

                // import scripts
                const scriptIdsToImport = selectedIds?.get(IMPORT_SCRIPTS_KEY);
                const scriptsToImport = scripts?.filter(s => scriptIdsToImport?.includes(s.id));
                const commentGroups = await getDBRows(sqliteDb, SQL_GET_COMMENT_GROUPS());
                const comments = await getDBRows(sqliteDb, SQL_GET_ALL_COMMENTS);
                const maxCommentListNumberRes = await getFirstAsync(SQL_GET_MAX_COMMENT_GROUP_NUMBER());
                let maxCommentListNumber: number = maxCommentListNumberRes["max"] as number + 1;
                for (let c of comments) {
                    const cg = commentGroups.find((cg: ICommentGroup) => cg.id === c.comment_group_id);
                    if (!commentsMap.has(cg.number)) {
                        commentsMap.set(cg.number, []);
                    }
                    commentsMap.get(cg.number)?.push({
                        name: c.name,
                        number: c.number,
                        text: c.text,
                    });
                }

                const commentGroupCheck = async (commentListNumber: number | undefined) => {
                    let newCommentListNumber: undefined | number = undefined;
                    if (commentListNumber && commentListNumber >= 0) {
                        if (!commentGroupsMap.has(commentListNumber)) {
                            const cg = commentGroups.find((cg: ICommentGroup) => cg.number === commentListNumber);
                            if (cg) {
                                newCommentListNumber = maxCommentListNumber++;
                                const newCommentGroup = await runAsync(SQL_INSERT_COMMENT_GROUP(cg.name, newCommentListNumber));
                                commentGroupsMap.set(cg.number, {
                                    ...cg,
                                    id: newCommentGroup.lastInsertRowId,
                                    number: newCommentListNumber,
                                });
                            }
                        } else {
                            newCommentListNumber = commentGroupsMap.get(commentListNumber)?.number;
                        }
                    }

                    return newCommentListNumber
                }

                if (scriptsToImport) {
                    for (let script of scriptsToImport) {
                        const sections = await getDBRows(sqliteDb, SQL_GET_SECTIONS(script.id));
                        const sectionIds = sections.map((s: any) => s.id as number);
                        const subsections = await getDBRows(sqliteDb, SQL_GET_SUBSECTIONS_BY_SECTIONS(sectionIds));
                        const options = await getDBRows(sqliteDb, SQL_GET_OPTIONS_BY_SECTIONS(sectionIds));
                        const values = await getDBRows(sqliteDb, SQL_GET_VALUES_BY_SECTIONS(sectionIds));
                        const valueOptions = await getDBRows(sqliteDb, SQL_GET_VALUE_OPTIONS_BY_SECTIONS(sectionIds));

                        const template: ITemplate = {
                            name: script.name,
                            sections: [],
                            tag: script.tag,
                            version: script.version,
                            editable: 1,
                        };

                        for (let s of sections) {
                            const section: ITemplateSection = {
                                index: s.sectionIndex,
                                name: s.name,
                                number: s.number,
                                tag: s.tag,
                                subSections: [],
                            };
                            for (let sub of subsections.filter((sub: any) => sub.section_id === s.id)) {
                                const subsection: ITemplateSubSection = {
                                    index: sub.subsectionIndex,
                                    name: sub.name,
                                    number: sub.number,
                                    options: [],
                                };
                                for (let o of options.filter((o: any) => o.subsection_id === sub.id)) {
                                    const option: ITemplateOption = {
                                        name: o.name,
                                        number: o.number,
                                        values: [],
                                    };
                                    for (let v of values.filter((v: any) => v.option_id === o.id)) {
                                        let options = "";
                                        const vo = valueOptions.filter((vo: any) => vo.value_id === v.id);
                                        if (vo.length > 0) {
                                            options = vo.map((vo: any) => vo.text).join(";");
                                        }
                                        let commentListNumber: undefined | number = undefined;
                                        if (v.commentListNumber >= 0) {
                                            commentListNumber = await commentGroupCheck(v.commentListNumber)
                                        }
                                        const value: ITemplateValue = {
                                            commentListNumber: commentListNumber ?? -1,
                                            number: v.number,
                                            type: v.type,
                                            isNa: v.isna,
                                            value: v.text,
                                            options: options,
                                        };
                                        option.values.push(value);
                                    }
                                    subsection.options.push(option);
                                }
                                section.subSections.push(subsection);
                            }
                            template.sections.push(section);
                        }

                        await importTemplate(template, execAsync, runAsync);

                        progress++;
                        setImportProgress(progress / total);
                    }
                }

                let bulkSql = "";
                let bulkCounter = 0;

                // import summary
                const summaryIdsToImport = selectedIds?.get(IMPORT_SUMMARY_KEY);
                const summaryToImport = summary?.filter(s => summaryIdsToImport?.includes(s.id));
                if (summaryToImport && summaryToImport.length > 0) {
                    const summaryMasterResults = await getFirstAsync(SQL_GET_MASTER_SUMMARY_SECTION);
                    const id = summaryMasterResults.id;
                    const summaries: ISummarySection[] = [];
                    for (let s of summaryToImport) {
                        const commentListNumber = await commentGroupCheck(s.commentListNumber);
                        summaries.push({
                            commentListNumber: commentListNumber ?? -1,
                            name: s.name,
                            number: s.number,
                            text: s.text,
                            summary_id: id,
                        });
                    }
                    for (let s of summaries) {
                        bulkCounter++;
                        bulkSql += `${SQL_INSERT_SUMMARY_SECTION(s.summary_id, s.commentListNumber, s.number, s.name, '', 0)};\n`;
                    }
                }

                // import overview
                const overviewIdsToImport = selectedIds?.get(IMPORT_OVERVIEW_KEY);
                const overviewToImport = overview?.filter(s => overviewIdsToImport?.includes(s.id));
                if (overviewToImport && overviewToImport.length > 0) {
                    const overviewMasterResults = await getFirstAsync(SQL_GET_MASTER_OVERVIEW_SECTION);
                    const id = overviewMasterResults.id;
                    const overviews: IOverviewSection[] = [];
                    for (let o of overviewToImport) {
                        const commentListNumber = await commentGroupCheck(o.commentListNumber);
                        overviews.push({
                            commentListNumber: commentListNumber ?? -1,
                            name: o.name,
                            number: o.number,
                            text: o.text,
                            overview_id: id,
                        });
                    }
                    for (let o of overviews) {
                        bulkCounter++;
                        bulkSql += `${SQL_INSERT_OVERVIEW_SECTION(o.overview_id, o.commentListNumber, o.number, o.name)};\n`;
                    }
                }

                // import comments
                const allCommentsToImport: IComment[] = [];
                for (let cg of commentGroupsMap) {
                    const comments = commentsMap.get(cg[0]);
                    if (comments && comments.length > 0) {
                        allCommentsToImport.push(...comments.map((c: any) => (
                            {
                                name: c.name,
                                number: c.number,
                                text: c.text,
                                commentGroupId: cg[1].id,
                            } as IComment
                        )));
                    }
                }
                for (let c of allCommentsToImport) {
                    bulkCounter++;
                    bulkSql += `${SQL_INSERT_COMMENT(c.commentGroupId!, c.number, escapeString(c.name), escapeString(c.text))};\n`;
                }

                // import contacts
                const contactsIdsToImport = selectedIds?.get(IMPORT_CONTACTS_KEY);
                const contactsToImport = contacts?.filter(s => contactsIdsToImport?.includes(s.id));
                if (contactsToImport && contactsToImport.length > 0) {
                    for (let contact of contactsToImport) {
                        const contactInsertRes = await runAsync(SQL_INSERT_CONTACT(contact.firstName, contact.lastName, contact.tag));
                        const newContactId = contactInsertRes.lastInsertRowId;
                        if (newContactId !== undefined) {
                            const contactAddresses = await getDBRows(sqliteDb, SQL_GET_CONTACT_ADDRESSES(contact.id));
                            const contactEmails = await getDBRows(sqliteDb, SQL_GET_CONTACT_EMAILS(contact.id));
                            const contactPhoneNumbers = await getDBRows(sqliteDb, SQL_GET_CONTACT_PHONENUMBERS(contact.id));
                            const contactLicenses = await getDBRows(sqliteDb, SQL_GET_CONTACT_LICENSES(contact.id));
                            if (contactAddresses.length > 0) {
                                for (let contactAddress of contactAddresses) {
                                    const newAddressRes = await runAsync(SQL_INSERT_ADDRESS(contactAddress.city, contactAddress.isPrimary, contactAddress.state,
                                        contactAddress.street, contactAddress.street2, contactAddress.type, contactAddress.zip));
                                    await execAsync(SQL_INSERT_CONTACT_ADDRESS(newContactId, newAddressRes.lastInsertRowId!));
                                }
                            }
                            if (contactEmails.length > 0) {
                                for (let contactEmail of contactEmails) {
                                    const newEmailRes = await runAsync(SQL_INSERT_EMAIL(contactEmail.emailAddress, contactEmail.isPrimary, contactEmail.emailType));
                                    await execAsync(SQL_INSERT_CONTACT_EMAIL(newContactId, newEmailRes.lastInsertRowId!));
                                }
                            }
                            if (contactPhoneNumbers.length > 0) {
                                for (let contactPN of contactPhoneNumbers) {
                                    const newPNRes = await runAsync(SQL_INSERT_PHONE_NUMBER(contactPN.phoneNumber, contactPN.extension, contactPN.isPrimary, contactPN.phoneType));
                                    await execAsync(SQL_INSERT_CONTACT_PHONE_NUMBER(newContactId, newPNRes.lastInsertRowId!));
                                }
                            }
                            if (contactLicenses.length > 0) {
                                for (let contactLicense of contactLicenses) {
                                    const newLicenseRes = await runAsync(SQL_INSERT_LICENSE(contactLicense.licenseNumber, contactLicense.state, contactLicense.startDate, contactLicense.type, newContactId));
                                    await execAsync(SQL_INSERT_CONTACT_LICENSE(newContactId, newLicenseRes.lastInsertRowId!));
                                }
                            }
                        }
                        progress++;
                        setImportProgress(progress / total);
                    }
                }

                if (bulkCounter > 0) {
                    await execAsync(`
                        PRAGMA journal_mode = WAL;
                        ${bulkSql}
                    `);
                }

                setImportProgress(1);
                sqliteDb.closeAsync();
                if (sqliteDbPath) {
                    SQLite.deleteDatabaseAsync(sqliteDbPath);
                }
                onClose({
                    success: true,
                    message: "Successfully imported InspectIT database"
                });
            }
        } catch (e) {
            onClose({
                success: false,
                message: "Failed to import InspectIT database"
            });
        } finally {
            setImporting(false);
        }
    }, [execAsync, runAsync, ready, sqliteDb, sqliteDbPath, onClose, selectedIds, scripts, contacts]);

    const onSelectionChange = useCallback((selectedIds: Map<string, number[]>) => {
        if ((selectedIds.get(IMPORT_SCRIPTS_KEY) === undefined &&
            selectedIds.get(IMPORT_CONTACTS_KEY) === undefined &&
            selectedIds.get(IMPORT_SUMMARY_KEY) === undefined &&
            selectedIds.get(IMPORT_OVERVIEW_KEY) === undefined) ||
            (selectedIds.get(IMPORT_SCRIPTS_KEY)?.length === 0 &&
                selectedIds.get(IMPORT_CONTACTS_KEY)?.length === 0 &&
                selectedIds.get(IMPORT_SUMMARY_KEY)?.length === 0 &&
                selectedIds.get(IMPORT_OVERVIEW_KEY)?.length === 0)) {
            setConfirmedDisabled(true);
        } else {
            setConfirmedDisabled(false);
        }
        setSelectedIds(selectedIds);
    }, []);

    return (
        <Dialog
            visible={true}
            title="Import from InspectIT DB"
            buttons={(
                <ModalButtons
                    cancelAction={handleClose}
                    confirmAction={handleSubmit}
                    cancelDisabled={importing}
                    confirmDisabled={confirmDisabled || importing} />
            )}
            onTouchOutside={handleClose}>
            <ScrollView>
                {!uiReady && <ProgressBar indeterminate />}
                {importing && <ProgressBar indeterminate={importProgress === 0} progress={importProgress} />}
                {uiReady && !importing && (
                    <TreeView
                        items={itemsMap}
                        onSelectionChange={onSelectionChange} />
                )}
                {importing && (
                    <View
                        style={{
                            display: "flex",
                        }}>
                        <View style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
                            <LoadingText>Importing data</LoadingText>
                        </View>
                    </View>
                )}
            </ScrollView>
        </Dialog>
    )
}