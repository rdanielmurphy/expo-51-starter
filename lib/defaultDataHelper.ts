import { getJson } from '../lib/files';
import * as SQLite from 'expo-sqlite/next';

export const getDefaultDocumentsSql = (file: string, reportDefinitions: any[]): string => {
    const json: any = getJson(file, false);

    let sql = `
        INSERT INTO document (defaultType, isDefault, reportDefinition_id)
        VALUES 
    `;

    const map: any = {};
    for (const row of reportDefinitions) {
        const item = row;
        map[item.name] = item.id;
    }

    (json.items as any[]).forEach((i, index) => {
        sql = sql + `('${i.defaultType}','${i.isDefault}',${map[i.reportDefinition_name]})${json.items.length - 1 === index ? ';' : ','}`;
    });

    return sql;
}

export const getDefaultInspectionTypesSql = (file: string): string => {
    const json: any = getJson(file, false);

    let sql: string = `
        INSERT INTO inspection_type (name)
        VALUES 
    `;

    (json.items as any[]).forEach((i, index) => {
        sql = sql + `('${i.name}')${json.items.length - 1 === index ? ';' : ','}
        `;
    });

    return sql;
}

export const getDefaultOverviewData = (file: string): any => {
    return getJson(file, false);
}

export const getOverviewSql = (obj: any): string => {
    return `
        INSERT INTO overview (master, lastModified)
        VALUES (${obj.master}, ${obj.lastModified})
    `;
}

export const getOverviewSectionSql = (obj: any, insertId: number): string => {
    return `
        INSERT INTO overview_section (name, number, commentListNumber, overview_id)
        VALUES ('${obj.name}', ${obj.number}, ${obj.commentListNumber}, ${insertId})
    `;
}

export const getDefaultReportDefinitionsSql = (file: string, inspectionTypes: any[]): string => {
    const json: any = getJson(file, false);

    let sql: string = `
        INSERT INTO report_definition (name, location, versionNumber, inspectionType_id)
        VALUES 
    `;

    const map: any = {};
    for (const row of inspectionTypes) {
        const item = row;
        map[item.name] = item.id;
    }

    (json.items as any[]).forEach((i, index) => {
        sql = sql + `('${i.name}','${i.location}',${i.versionNumber},${map[i.inspectionType_name]})${json.items.length - 1 === index ? ';' : ','}`;
    });

    return sql;
}

export const getDefaultStatesSql = (file: string): string => {
    const json: any = getJson(file, true);

    let sql: string = `
        INSERT INTO state (abbr, name, country)
        VALUES 
    `;

    (json.items as any[]).forEach((i, index) => {
        sql = sql + `('${i.abbr}','${i.name}','${i.country}')${json.items.length - 1 === index ? ';' : ','}
        `;
    });

    return sql;
}

export const getDefaultSummaryData = (file: string): any => {
    return getJson(file, false);
}

export const getSummarySql = (obj: any): string => {
    return `
        INSERT INTO summary (master, lastModified)
        VALUES (${obj.master ? obj.master : null}, ${obj.lastModified ? obj.lastModified : null})
    `;
}

export const getSummarySectionSql = (obj: any, insertId: number): string => {
    return `
        INSERT INTO summary_section (name, number, type, commentListNumber, summary_id)
        VALUES ('${obj.name}', ${obj.number}, ${obj.type}, ${obj.commentListNumber ? obj.commentListNumber : null}, ${insertId})
    `;
}

export const getSummarySubSectionSql = (obj: any, insertId: number): string => {
    return `
        INSERT INTO summary_subsection (name, number, type, commentListNumber, section_id)
        VALUES ('${obj.name}', ${obj.number}, ${obj.type}, ${obj.commentListNumber ? obj.commentListNumber : null}, ${insertId})
    `;
}

export const getDefaultUserFieldsSql = (file: string): string => {
    const json: any = getJson(file, true);

    let sql: string = `
        INSERT INTO userdefinedfields (displayOrder, fieldType, fieldValue, fieldLabel, visible)
        VALUES 
    `;

    (json.items as any[]).forEach((i, index) => {
        sql = sql + `(${i.displayOrder},'${i.fieldType}',${i.fieldValue},'${i.fieldLabel}',${i.visible})${json.items.length - 1 === index ? ';' : ','}
        `;
    });

    return sql;
}


export const getTexasSummarySql = (file: string): string => {
    const json = getJson(file, true);

    return "";
}
