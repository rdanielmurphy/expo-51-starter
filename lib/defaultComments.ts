import { escapeString } from "./databaseDataHelper";
import { getXML } from "./files";

export interface ICommentGroup {
    id?: number
    description: string
    comments: IComment[]
    number: string
}

export interface IComment {
    id?: number
    name: string
    number: number
    text: string
    commentGroupId?: number
}

export const getCommentGroups = (file: string): ICommentGroup[] => {
    const xml = getXML(file);
    const infobuttons = xml.getElementsByTagName('infobuttons');

    const commentGroups: ICommentGroup[] = [];

    infobuttons[0].children.forEach((cg: any) => {
        const description = cg.attributes.description;
        const number = cg.attributes.number;

        const group: ICommentGroup = {
            description,
            number,
            comments: [],
        };
        cg.children.forEach((c: any) => {
            const name = c.attributes.name;
            const number = c.attributes.number;
            const comment: IComment = {
                name,
                number,
                text: c.value,
            };
            group.comments.push(comment);
        });
        commentGroups.push(group);
    });

    return commentGroups;
}

export const getCommentGroupInsertSql = () => "INSERT INTO comment_group (name, number, account_id)";

export const getCommentGroupValueSql = (commentGroup: ICommentGroup, last: boolean) => {
    return `('${commentGroup.description}', ${commentGroup.number}, 1)${last ? ';' : ','}`;
}

export const getCommentInsertSql = () => "INSERT INTO comment (name, number, text, comment_group_id)";

export const getCommentValueSql = (comment: IComment, groupId: number, last: boolean) => {
    return `('${escapeString(comment.name)}', ${comment.number}, '${escapeString(comment.text)}', ${groupId})${last ? ';' : ','}`;
}
