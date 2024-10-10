import * as SQLite from 'expo-sqlite/next';
import { SQL_GET_OPTIONS, SQL_GET_SECTIONS, SQL_GET_SUBSECTIONS, SQL_GET_VALUES, SQL_GET_VALUE_OPTIONS, SQL_INSERT_MASTER_SCRIPT, SQL_INSERT_OPTION, SQL_INSERT_SECTION, SQL_INSERT_SUBSECTION, SQL_INSERT_VALUE, SQL_INSERT_VALUE_OPTION, SQL_INSERT_VALUE_OPTION_VALUE_ARRAY } from './sqlCommands';

export const escapeString = (text: string) => text ? text.split("'").join("''") : "";

export const copyInspectionTemplate = async (
    execAsync: (sqlStatement: string, log?: boolean) => Promise<boolean>,
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any[]>,
    runAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<SQLite.SQLiteRunResult>,
    scriptId: number,
    name: string,
) => {
    let voSql = "";
    let voCounter = 0;
    const scriptResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_MASTER_SCRIPT(name, scriptId, "", 1));

    // create sections
    const sectionsResult = await getAllAsync(SQL_GET_SECTIONS(scriptId))
    for (let i = 0; i < sectionsResult.length; i++) {
        const section = sectionsResult[i]
        const sectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SECTION(section.name, section.number, section.sectionIndex, scriptResult.lastInsertRowId!, section.tag))

        const subSections = await getAllAsync(SQL_GET_SUBSECTIONS(section.id))
        for (let j = 0; j < subSections.length; j++) {
            const subsection = subSections[j]
            const subsectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SUBSECTION(subsection.name, subsection.number, subsection.subsectionIndex, scriptResult.lastInsertRowId!, sectionResult.lastInsertRowId!))
            const options = await getAllAsync(SQL_GET_OPTIONS(subsection.id))
            for (let k = 0; k < options.length; k++) {
                const option = options[k]
                const optionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_OPTION(option.name, option.number, scriptResult.lastInsertRowId!, sectionResult.lastInsertRowId!, subsectionResult.lastInsertRowId!))

                const values = await getAllAsync(SQL_GET_VALUES(option.id))
                for (let l = 0; l < values.length; l++) {
                    const value = values[l]
                    const valueResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, 
                        escapeString(value.text), value.type, 
                        escapeString(value.userText), value.checked, scriptResult.lastInsertRowId!, sectionResult.lastInsertRowId!, 
                        subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!))

                    const value_options = await getAllAsync(SQL_GET_VALUE_OPTIONS(value.id))
                    for (let m = 0; m < value_options.length; m++) {
                        const value_option = value_options[m];
                        voCounter++;
                        voSql += `${SQL_INSERT_VALUE_OPTION(value_option.checked, value_option.number, value_option.text,
                            scriptId, sectionResult.lastInsertRowId!, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!,
                            valueResult.lastInsertRowId!, 0)};\n`;
                    }
                }
            }
        }
    }

    if (voCounter > 0) {
        await execAsync(`
            PRAGMA journal_mode = WAL;
            ${voSql}
        `);
    }
}