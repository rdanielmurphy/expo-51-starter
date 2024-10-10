import { useState, useEffect, useCallback } from 'react';
import { Asset } from 'expo-asset';
import { readAsset } from '../lib/files';
import * as SQLite from 'expo-sqlite/next';
import { SQL_GET_ALL_TABLES, SQL_GET_DB_VERSION, SQL_GET_INSPECTION_TYPES, SQL_GET_REPORT_DEFINITIONS, SQL_INSERT_DB_VERSION, SQL_INSERT_PIA, SQL_UPDATE_DB_VERSION_SUCCESS, SQL_UPDATE_DB_VERSION_TIMESTAMP } from '../lib/sqlCommands';
import { getDefaultOverviewData, getDefaultDocumentsSql, getDefaultInspectionTypesSql, getDefaultReportDefinitionsSql, getDefaultStatesSql, getDefaultUserFieldsSql, getOverviewSql, getOverviewSectionSql, getDefaultSummaryData, getSummarySql, getSummarySectionSql, getSummarySubSectionSql } from '../lib/defaultDataHelper';
import { getTemplateScriptObject, ITemplate } from '../lib/defaultTemplateScripts';
import { getCommentGroupInsertSql, getCommentGroups, getCommentGroupValueSql, getCommentInsertSql, getCommentValueSql, ICommentGroup } from '../lib/defaultComments';
import * as migrationsJson from '../lib/migrations.json';
import { importTemplate } from '../lib/importer';
import { escapeString } from '../lib/databaseDataHelper';

export const DATABASE_NAME = 'revSpect';

export function useDatabaseNew() {
    const [db, setDB] = useState<SQLite.SQLiteDatabase | undefined>(undefined);
    const [ready, setReady] = useState<boolean>(false);
    const [checkedDb, setCheckedDb] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("Init");
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | undefined>(undefined);
    const [scripts, setScripts] = useState<Asset[]>();
    const [migrations, setMigrations] = useState<Asset[]>();
    const [defaults, setDefaults] = useState<Asset[]>();
    const [comments, setComments] = useState<Asset>();
    const [xml, setXml] = useState<Asset[]>();

    useEffect(() => {
        const run = async () => {
            try {
                const createSchema = await Asset.fromModule(require('../assets/default_sql/create_schema.sql'));
                const addTableIndexes = await Asset.fromModule(require('../assets/default_sql/add_table_indexes.sql'));
                const colors = await Asset.fromModule(require('../assets/default_sql/colors.sql'));
                const addTableTriggers = await Asset.fromModule(require('../assets/default_sql/add_table_triggers.sql'));
                setScripts([createSchema, addTableIndexes, colors, addTableTriggers]);
            } catch (e: any) {
                setError(`Could not read default_sql: ${e.message}`);
            }

            try {
                // ADD MIGRATION FILES HERE
                const migrationFile1 = await Asset.fromModule(require('../assets/migration_scripts/db.migration-1.sql'));
                const migrationFile2 = await Asset.fromModule(require('../assets/migration_scripts/db.migration-2.sql'));
                const migrationFile3 = await Asset.fromModule(require('../assets/migration_scripts/db.migration-3.sql'));
                const migrationFile4 = await Asset.fromModule(require('../assets/migration_scripts/db.migration-4.sql'));
                const migrationFile5 = await Asset.fromModule(require('../assets/migration_scripts/db.migration-5.sql'));
                setMigrations([migrationFile1, migrationFile2, migrationFile3, migrationFile4, migrationFile5]);
            } catch (e: any) {
                console.error(e);
                setError(`Could not read migration file: ${e.message}`);
            }

            try {
                const d1 = await Asset.fromModule(require('../assets/default_data/default_states.txt'));
                const d2 = await Asset.fromModule(require('../assets/default_data/default_inspection_types.txt'));
                const d3 = await Asset.fromModule(require('../assets/default_data/default_user_fields.txt'));
                const d4 = await Asset.fromModule(require('../assets/default_data/default_report_definitions.txt'));
                const d5 = await Asset.fromModule(require('../assets/default_data/default_documents.txt'));
                const d6 = await Asset.fromModule(require('../assets/default_data/default_overview.txt'));
                const d7 = await Asset.fromModule(require('../assets/default_data/default_summary.txt'));
                const d8 = await Asset.fromModule(require('../assets/default_data/texas_summary_data.txt'));
                setDefaults([d1, d2, d3, d4, d5, d6, d7, d8]);
            } catch (e: any) {
                setError(`Could not read default_data: ${e.message}`);
            }

            try {
                const comments = await Asset.fromModule(require('../assets/default_comments/default_comments.txt'));
                setComments(comments);
            } catch (e: any) {
                setError(`Could not read default_data: ${e.message}`);
            }

            try {
                const x1 = await Asset.fromModule(require('../assets/default_scripts/Master_Checklist.txt'));
                const x2 = await Asset.fromModule(require('../assets/default_scripts/Master_Narrative.txt'));
                // require('../assets/default_scripts/Master_Texas.xml'),
                setXml([x1, x2]);
            } catch (e: any) {
                setError(`Could not read default_scripts: ${e.message}`);
            }
        }
        // run();
    }, []);

    // `runAsync()` is useful when you want to execute some write operations.
    const runAsync = useCallback(async (sqlStatement: string, args?: SQLite.SQLiteBindParams, log: boolean = false) => {
        if (log) {
            console.log('sqlStatement', sqlStatement);
        }

        let result: SQLite.SQLiteRunResult = { changes: 0, lastInsertRowId: -1 };
        try {
            if (db !== undefined) {
                result = await db.runAsync(sqlStatement, args ?? []);
            }
        } catch (e: any) {
            console.error("Could not execute SQL statement", sqlStatement, e);
            setError("Could not execute SQL statement: " + sqlStatement)
        }

        return result;
    }, [db])

    // `getFirstAsync()` is useful when you want to get a single row from the database.
    const getFirstAsync = useCallback(async (sqlStatement: string, args?: SQLite.SQLiteBindParams, log: boolean = false) => {
        if (log) {
            console.log('sqlStatement', sqlStatement);
        }

        let result: any | undefined
        try {
            result = await db?.getFirstAsync(sqlStatement, args ?? []);
        } catch (e: any) {
            console.error("Could not execute SQL statement", sqlStatement, e);
            setError("Could not execute SQL statement: " + sqlStatement)
        }

        return result;
    }, [db])

    // `getAllAsync()` is useful when you want to get all results as an array of objects.
    const getAllAsync = useCallback(async (sqlStatement: string, args?: SQLite.SQLiteBindParams, log: boolean = false) => {
        if (log) {
            console.log('sqlStatement', sqlStatement);
        }

        let result: any[] = []
        try {
            if (db !== undefined) {
                result = await db.getAllAsync(sqlStatement, args ?? []);
            }
        } catch (e: any) {
            console.error("Could not execute SQL statement", sqlStatement, e);
            setError("Could not execute SQL statement: " + sqlStatement)
        }

        return result;
    }, [db])

    // `execAsync()` is useful for bulk queries when you want to execute altogether, don't care about results. 
    const execAsync = useCallback(async (sqlStatement: string, log: boolean = false) => {
        if (log) {
            console.log('sqlStatement', sqlStatement);
        }

        try {
            await db?.execAsync(sqlStatement);
        } catch (e: any) {
            console.error("Could not execute SQL statement", sqlStatement, e);
            setError("Could not execute SQL statement: " + sqlStatement);
            return false;
        }

        return true;
    }, [db])

    const deleteDB = async () => {
        try {
            const results = await getAllAsync(SQL_GET_ALL_TABLES)
            for (const row of results) {
                const tableName = row.name;
                if (tableName !== 'sqlite_sequence' && tableName !== 'android_metadata') {
                    await execAsync(`DROP TABLE ${row.name}`);
                }
            }
            setMessage('DB Deleted');
        } catch (_error) { }
    }

    useEffect(() => {
        const run = async () => {
            setMessage('Opening DB');
            try {
                const res = await SQLite.openDatabaseAsync('revSpect.db')
                setDB(res);
                setMessage('Opened DB');
            } catch (e: any) {
                setError(`Could not open DB: ${e.message}`);
            }
        }
        run();
    }, [])

    useEffect(() => {
        const runAllCommandsInFile = async (file: string, splitter: string = ";") => {
            await execAsync(`
                PRAGMA journal_mode = WAL;
                ${file}
            `);
        }

        const downloadScripts = async (assets: Asset[]) => {
            setMessage('Starting downloading scripts!');
            const promiseArray: Promise<string>[] = [];
            try {
                assets.forEach((a: Asset) => {
                    promiseArray.push(readAsset(a));
                });
                const result = await Promise.all(promiseArray);
                await runAllCommandsInFile(result[0]);
                await runAllCommandsInFile(result[1]);
                await runAllCommandsInFile(result[2]);
                await runAllCommandsInFile(result[3], "END;");
                setMessage('Finished downloading scripts');
            } catch (e: any) {
                console.error('SQL Error', e);
                setError('downloadScripts error. asset - ' + assets[0].uri + '. ' + assets[0].type + '. ' + assets[0].hash + '. ' + e.message);
            }
        }

        const downloadDefaults = async (assets: Asset[], defaultPreInspectionAgreementText: string) => {
            setMessage('Starting downloading defaults');
            const promiseArray: Promise<string>[] = [];
            assets.forEach((a: Asset) => {
                promiseArray.push(readAsset(a));
            });
            const result = await Promise.all(promiseArray);

            try {
                await execAsync(getDefaultStatesSql(result[0]));
                await execAsync(getDefaultInspectionTypesSql(result[1]));
                await execAsync(getDefaultUserFieldsSql(result[2]));
                const inspectionTypes = await getAllAsync(SQL_GET_INSPECTION_TYPES);
                await execAsync(getDefaultReportDefinitionsSql(result[3], inspectionTypes));
                const reportDefinitions = await getAllAsync(SQL_GET_REPORT_DEFINITIONS);
                await execAsync(getDefaultDocumentsSql(result[4], reportDefinitions));
                const overviewData = getDefaultOverviewData(result[5]);
                (overviewData.items as []).forEach(async (i: any) => {
                    const res = await runAsync(getOverviewSql(i));
                    i.sections.forEach(async (s: any) => {
                        await execAsync(getOverviewSectionSql(s, res?.lastInsertRowId!));
                    });
                });
                const summaryData = getDefaultSummaryData(result[6]);
                (summaryData.items as []).forEach(async (i: any) => {
                    const res1 = await runAsync(getSummarySql(i));
                    i.sections.forEach(async (s: any) => {
                        const res2 = await runAsync(getSummarySectionSql(s, res1?.lastInsertRowId!));
                        if (s.subSections && s.subSections.length > 0) {
                            s.subSections.forEach(async (su: any) => {
                                await execAsync(getSummarySubSectionSql(su, res2?.lastInsertRowId!));
                            });
                        }
                    });
                });
                const texasSummaryData = getDefaultSummaryData(result[7]);
                (texasSummaryData.items as []).forEach(async (i: any) => {
                    const res1 = await runAsync(getSummarySql(i));
                    i.sections.forEach(async (s: any) => {
                        const res2 = await runAsync(getSummarySectionSql(s, res1?.lastInsertRowId!));
                        if (s.subSections && s.subSections.length > 0) {
                            s.subSections.forEach(async (su: any) => {
                                await execAsync(getSummarySubSectionSql(su, res2?.lastInsertRowId!));
                            });
                        }
                    });
                });
                await execAsync(SQL_INSERT_PIA(escapeString(defaultPreInspectionAgreementText)));
                setMessage('Finished downloading defaults');
            } catch (e: any) {
                console.error('SQL Error', e);
                setError('downloadDefaults error');
            }
        }

        const downloadTemplates = async (assets: Asset[]) => {
            setMessage('Starting downloading templates');

            try {
                const promiseArray: Promise<string>[] = [];
                assets.forEach((a: Asset) => {
                    promiseArray.push(readAsset(a));
                });
                const result = await Promise.all(promiseArray);

                for (let i = 0; i < result.length; i++) {
                    const template: ITemplate = getTemplateScriptObject(result[i]);
                    await importTemplate(template, execAsync, runAsync);
                }

                setMessage('Finished downloading templates');
            } catch (e: any) {
                console.error('SQL Error', e);
                setError('downloadTemplates error: ' + e.message);
            }
        }

        const downloadComments = async (asset: Asset) => {
            setMessage('Starting downloading comments');

            try {
                const result = await readAsset(asset);
                const commentGroups: ICommentGroup[] = getCommentGroups(result);
                let commentGroupInsert = getCommentGroupInsertSql();
                commentGroupInsert += " VALUES ";
                for (var i = 0; i < commentGroups.length; i++) {
                    const cg = commentGroups[i];
                    commentGroupInsert += getCommentGroupValueSql(cg, i === commentGroups.length - 1);

                    let commentsInsert = getCommentInsertSql();
                    commentsInsert += " VALUES ";
                    for (var j = 0; j < cg.comments.length; j++) {
                        const c = cg.comments[j];
                        commentsInsert += getCommentValueSql(c, Number.parseInt(cg.number), j === cg.comments.length - 1);
                    }
                    if (cg.comments.length > 0) {
                        await execAsync(commentsInsert);
                    }
                }
                await execAsync(commentGroupInsert);
                setMessage('Finished downloading comments');
            } catch (e: any) {
                console.error('SQL Error', e);
                setError('downloadTemplates error: ' + e.message);
            }
        }

        const loadDB = async () => {
            console.log('Start load DB');
            const startTime = performance.now();
            if (comments && scripts && defaults && xml) {
                setProgress(0);
                await downloadScripts(scripts);
                setProgress(20);
                await downloadDefaults(defaults, "Please add a pre-inspection agreement here");
                setProgress(40);
                await downloadTemplates(xml);
                setProgress(60);
                await downloadComments(comments);
                setProgress(80);
                await runMigrations(false);
                setProgress(100);
                console.log('Finished loading DB');
                setReady(error === undefined || error.length === 0);
            }

            const finishTime = performance.now();
            console.log(`It took me ${finishTime - startTime} milliseconds setup the DB!`)
        }

        const runMigration = async (file: string, versionCode: number, rowId?: number): Promise<boolean> => {
            try {
                const migrationScript = migrations?.find(m => m.name === file);
                let id = rowId;
                if (migrationScript) {
                    if (!id) {
                        const result = await runAsync(SQL_INSERT_DB_VERSION(versionCode));
                        id = result?.lastInsertRowId;
                    } else {
                        await execAsync(SQL_UPDATE_DB_VERSION_TIMESTAMP(id));
                    }
                    const script = await readAsset(migrationScript);
                    await runAllCommandsInFile(script);
                    await execAsync(SQL_UPDATE_DB_VERSION_SUCCESS(id!));
                }
                return true;
            } catch (e) {
                console.log('Could not run migration for script ' + file, e);
                return false;
            }
        }

        const runMigrations = async (setReadyState: boolean) => {
            setMessage('Starting database migrations');

            const versionRows = await getAllAsync(SQL_GET_DB_VERSION);
            let success = true;
            let migrationNeeded = false;
            for (const s of migrationsJson.scripts) {
                const versionRow = versionRows.find(i => i.versionCode === s.version)
                if ((!versionRow || versionRow.success === 0) && migrations) {
                    migrationNeeded = true;
                    if (setReadyState) {
                        setProgress(50);
                    }
                    const result = await runMigration(s.fileName, s.version, versionRow?.id);
                    if (!result) {
                        success = false;
                        break;
                    }
                }
            }
            if (success) {
                if (setReadyState) {
                    setReady(true);
                    setProgress(100);
                }
                setMessage(migrationNeeded ? "Ran DB migration(s)" : "DB has already been setup");
            } else {
                setError("Error running DB migration(s)");
            }
        }

        // if (db && comments && scripts && scripts.length > 0 &&
        //     defaults && defaults.length > 0 &&
        //     migrations && migrations.length > 0 &&
        //     xml && xml.length > 0 && !checkedDb) {
        //     setCheckedDb(true);
        //     // Check if the db is setup or not
        //     getAllAsync(SQL_GET_ALL_TABLES).then((results) => {
        //         if (results.length < 4) {
        //             // setup the DB
        //             setMessage('Setup DB');
        //             loadDB();
        //         } else {
        //             runMigrations(true);
        //         }
        //     }).catch((e) => {
        //         console.log("Could not load DB", e);
        //         setError('Could not load DB error');
        //         return false
        //     });
        // }

        setReady(true)
    }, [comments, defaults, scripts, db, ready, xml, migrations]);

    return { deleteDB, execAsync, getFirstAsync, getAllAsync, runAsync, ready, message, progress, error };
}
