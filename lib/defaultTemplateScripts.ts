import { escapeString } from "./databaseDataHelper";
import { getXML } from "./files";

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


export interface ITemplate {
    name: string
    sections: ITemplateSection[]
    tag: string
    version: number
    editable: number
}

export interface ITemplateSection {
    index: number
    name: string
    number: number
    tag: string
    subSections: ITemplateSubSection[]
}

export interface ITemplateSubSection {
    index: number
    name: string
    number: number
    options: ITemplateOption[]
}

export interface ITemplateOption {
    name: string
    number: number
    values: ITemplateValue[]
}

export interface ITemplateValue {
    commentListNumber?: number
    number: number
    type: number
    isNa: number
    value: string
    options: string
}

export const getTemplateScriptObject = (file: string): ITemplate => {
    const xml = getXML(file);
    const report = xml.getElementsByTagName('report');
    const tag = report && report[0].attributes.tag;
    const version = report && report[0].attributes.version;
    const name = `Master ${capitalizeFirstLetter(tag)}`;

    const template: ITemplate = {
        name,
        sections: [],
        tag,
        version,
        editable: 0,
    };

    report[0].children.forEach((s: any) => {
        const section: ITemplateSection = {
            index: s.attributes.index,
            name: s.attributes.name,
            number: s.attributes.number,
            tag: s.attributes.tag,
            subSections: [],
        };
        s.children.forEach((sub: any) => {
            const subsection: ITemplateSubSection = {
                index: sub.attributes.index,
                name: sub.attributes.name,
                number: sub.attributes.number,
                options: [],
            };
            sub.children.forEach((o: any) => {
                const option: ITemplateOption = {
                    name: o.attributes.name,
                    number: o.attributes.number,
                    values: [],
                };
                o.children.forEach((v: any) => {
                    const value: ITemplateValue = {
                        commentListNumber: v.attributes.button,
                        number: v.attributes.number,
                        type: v.attributes.type,
                        isNa: v.attributes.isna,
                        value: v.value,
                        options: v.attributes.options,
                    };
                    option.values.push(value);
                });
                subsection.options.push(option);
            });
            section.subSections.push(subsection);
        });
        template.sections.push(section);
    });

    return template;
}

export const getTemplateScriptSql = (template: ITemplate) => {
    return `
        INSERT INTO script (editable, master, tag, name, overview_id, summary_id, version)
        VALUES (${template.editable}, 1, '${template.tag}', '${escapeString(template.name)}', 1, 1, ${template.version})
    `;
}

export const getSectionSql = (section: ITemplateSection, scriptId: number) => {
    const tag = section.tag ? section.tag : null
    return `
        INSERT INTO section (sectionIndex, name, number, script_id, tag)
        VALUES (${section.index}, '${section.name}', ${section.number}, ${scriptId}, ${section.tag ? "'" + section.tag + "'" : null})
    `;
}

export const getSubSectionSql = (section: ITemplateSubSection, scriptId: number, sectionId: number) => {
    return `
        INSERT INTO subsection (subsectionIndex, name, number, script_id, section_id)
        VALUES (${section.index}, '${section.name}', ${section.number}, ${scriptId}, ${sectionId})
    `;
}

export const getOptionSql = (section: ITemplateOption, scriptId: number, sectionId: number, subsectionId: number) => {
    return `
        INSERT INTO option (name, number, script_id, section_id, subsection_id)
        VALUES ('${section.name}', ${section.number}, ${scriptId}, ${sectionId}, ${subsectionId})
    `;
}

export const getValueSql = (value: ITemplateValue, scriptId: number, sectionId: number, subsectionId: number, optionId: number) => {
    return `
        INSERT INTO value (type, number, commentListNumber, script_id, section_id, subsection_id, option_id, isNa, text)
        VALUES ('${value.type}', ${value.number}, ${value.commentListNumber ? value.commentListNumber : null}, ${scriptId}, 
        ${sectionId}, ${subsectionId}, ${optionId}, ${value.isNa ? value.isNa : null}, '${escapeString(value.value)}')
    `;
}

export const getValueOptionSql = (valueOption: string, number: number, scriptId: number, sectionId: number, subsectionId: number, optionId: number, valueId: number) => {
    return `
        INSERT INTO value_option (checked, number, text, script_id, section_id, subsection_id, option_id, value_id, hasAdded)
        VALUES (0, ${number}, '${escapeString(valueOption)}', ${scriptId}, ${sectionId}, ${subsectionId}, ${optionId}, ${valueId}, 0)
    `;
}