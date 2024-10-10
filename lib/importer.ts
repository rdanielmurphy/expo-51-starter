import * as SQLite from 'expo-sqlite/next';
import {
    ITemplate,
    ITemplateOption,
    ITemplateSection,
    ITemplateSubSection,
    ITemplateValue,
    getOptionSql,
    getSectionSql,
    getSubSectionSql,
    getTemplateScriptSql,
    getValueOptionSql,
    getValueSql
} from './defaultTemplateScripts';
import { ICommentGroup } from './types';

export interface IImportableCommentGroup extends ICommentGroup {
    newId?: number
    new?: boolean
}

export const importTemplate = async (
    template: ITemplate,
    execAsync: (sqlStatement: string, log?: boolean) => Promise<boolean>,
    runAsync: (sqlStatement: string, args?: any[], log?: boolean) => Promise<SQLite.SQLiteRunResult>,
) => {
    const res1: SQLite.SQLiteRunResult = await runAsync(getTemplateScriptSql(template));
    template.sections.forEach(async (s: ITemplateSection) => {
        const res2: SQLite.SQLiteRunResult = await runAsync(getSectionSql(s, res1.lastInsertRowId!));
        s.subSections.forEach(async (sub: ITemplateSubSection) => {
            const res3: SQLite.SQLiteRunResult = await runAsync(getSubSectionSql(sub, res1.lastInsertRowId!, res2.lastInsertRowId!));
            sub.options.forEach(async (option: ITemplateOption) => {
                const res4: SQLite.SQLiteRunResult = await runAsync(getOptionSql(option, res1.lastInsertRowId!, res2.lastInsertRowId!, res3.lastInsertRowId!));
                option.values.forEach(async (v: ITemplateValue) => {
                    const res5: SQLite.SQLiteRunResult = await runAsync(getValueSql(v, res1.lastInsertRowId!, res2.lastInsertRowId!, res3.lastInsertRowId!, res4.lastInsertRowId!));
                    if (v.options && v.options.length > 0) {
                        const valueOptionsArray = v.options.split(";");
                        valueOptionsArray.forEach(async (vo: string, index: number) => {
                            await execAsync(getValueOptionSql(vo, index + 1, res1.lastInsertRowId!, res2.lastInsertRowId!, res3.lastInsertRowId!, res4.lastInsertRowId!, res5.lastInsertRowId!));
                        });
                    }
                });
            });
        });
    });
}