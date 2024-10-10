import { useDbContext } from "../contexts/DbContext";
import { SQL_GET_OPTIONS, SQL_GET_SECTIONS, SQL_GET_SUBSECTIONS, SQL_GET_SUBSECTIONS_BY_SCRIPT_ID, SQL_GET_VALUES, SQL_GET_VALUE_OPTIONS, SQL_INSERT_OPTION, SQL_INSERT_SECTION, SQL_INSERT_SUBSECTION, SQL_INSERT_VALUE, SQL_INSERT_VALUE_OPTION } from "../lib/sqlCommands";
import * as SQLite from 'expo-sqlite/next';
import { ISection, ISubsection } from "../lib/types";
import { escapeString } from "../lib/databaseDataHelper";

export function useSections() {
    const { execAsync, getAllAsync, runAsync } = useDbContext();

    const addSection = async (scriptId: number, section: any, count?: number): Promise<ISection> => {
        let voSql = "";
        let voCounter = 0;

        const newSectionName = section.name + (count && count > 1 ? ` ${count}` : "")
        const sectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SECTION(newSectionName, section.number, section.sectionIndex, scriptId, section.tag));
        const subSections = await getAllAsync(SQL_GET_SUBSECTIONS(section.id));
        for (let j = 0; j < subSections.length; j++) {
            const subsection = subSections[j];
            const subsectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SUBSECTION(subsection.name, subsection.number, subsection.subsectionIndex, scriptId, sectionResult.lastInsertRowId!));

            const options = await getAllAsync(SQL_GET_OPTIONS(subsection.id));
            for (let k = 0; k < options.length; k++) {
                const option = options[k];
                const optionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_OPTION(option.name, option.number, scriptId, sectionResult.lastInsertRowId!, subsectionResult.lastInsertRowId!));

                const values = await getAllAsync(SQL_GET_VALUES(option.id))
                for (let l = 0; l < values.length; l++) {
                    const value = values[l]
                    const valueResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, 
                        escapeString(value.text), 
                        value.type, escapeString(value.userText), value.checked, scriptId, 
                        sectionResult.lastInsertRowId!, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!))

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

        if (voCounter > 0) {
            await execAsync(`
                PRAGMA journal_mode = WAL;
                ${voSql}
            `);
        }

        return {
            id: sectionResult.lastInsertRowId,
            name: newSectionName,
            number: section.number,
            tag: section.tag,
            script_id: scriptId,
        }
    }

    const addSubsection = async (
        scriptId: number,
        sectionId: number,
        subSection: ISubsection,
        order: number,
        count?: number): Promise<ISubsection> => {
        let voSql = "";
        let voCounter = 0;

        const newSubsectionName = subSection.name + (count && count > 1 ? ` ${count}` : "")
        const subsectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SUBSECTION(newSubsectionName, order,
            subSection.subsectionIndex, scriptId, sectionId), undefined, true);
        const options = await getAllAsync(SQL_GET_OPTIONS(subSection.id), undefined, true);
        for (let k = 0; k < options.length; k++) {
            const option = options[k];
            const optionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_OPTION(option.name, option.number, scriptId, sectionId, subsectionResult.lastInsertRowId!), undefined, true);

            const values = await getAllAsync(SQL_GET_VALUES(option.id))
            for (let l = 0; l < values.length; l++) {
                const value = values[l]
                const valueResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, 
                    escapeString(value.text), value.type, escapeString(value.userText), value.checked, scriptId, 
                    sectionId, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!), undefined, true);

                const value_options = await getAllAsync(SQL_GET_VALUE_OPTIONS(value.id))
                for (let m = 0; m < value_options.length; m++) {
                    const value_option = value_options[m];
                    voCounter++;
                    voSql += `${SQL_INSERT_VALUE_OPTION(value_option.checked, value_option.number, value_option.text,
                        scriptId, sectionId, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!,
                        valueResult.lastInsertRowId!, 0)};\n`;
                }
            }
        }

        if (voCounter > 0) {
            await execAsync(`
                PRAGMA journal_mode = WAL;
                ${voSql}
            `);
        }

        return {
            id: subsectionResult.lastInsertRowId!,
            name: newSubsectionName,
            number: order,
            script_id: scriptId,
            section_id: sectionId,
            subsectionIndex: subSection.subsectionIndex,
        }
    }

    const getSections = async (scriptId: number): Promise<ISection[]> => {
        const sections = await getAllAsync(SQL_GET_SECTIONS(scriptId));
        return sections.map((s: any) => {
            return {
                id: s.id,
                name: s.name,
                number: s.number,
                sectionIndex: s.sectionIndex,
                tag: s.tag,
                script_id: s.script_id,
            } as ISection
        });
    }

    const getSubsections = async (scriptId: number): Promise<ISubsection[]> => {
        const subsections = await getAllAsync(SQL_GET_SUBSECTIONS_BY_SCRIPT_ID(scriptId));
        return subsections.map((s: any) => ({
            id: s.id,
            name: s.name,
            number: s.number,
            script_id: s.script_id,
            section_id: s.section_id,
            subsectionIndex: s.subsectionIndex,
        } as ISubsection));
    }

    return { addSection, getSections, getSubsections, addSubsection };
}
