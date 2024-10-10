import * as React from 'react';
import { SQL_DELETE_OPTION_BY_OPTION_ID, SQL_DELETE_VALUE_BY_OPTION_ID, SQL_DELETE_VALUE_OPTION_BY_OPTION_ID, SQL_GET_OPTION, SQL_GET_VALUES, SQL_GET_VALUE_OPTIONS, SQL_INSERT_OPTION, SQL_INSERT_VALUE, SQL_INSERT_VALUE_OPTION, SQL_INSERT_VALUE_OPTION_VALUE_ARRAY, SQL_UPDATE_OPTION_NAME } from '../../lib/sqlCommands';
import EditableItemWrapper from './EditableItemWrapper';
import SectionHeading from '../shared/SectionHeading';
import { CopyItemModal } from '../modals/CopyItemModal';
import * as SQLite from 'expo-sqlite/next';
import { IDbProps } from '../tabs/EditableGenericSubSectionTab';
import { escapeString } from '../../lib/databaseDataHelper';

interface IProps extends IDbProps {
    id: number;
    name: string;
}

const EditableOptionHeader = (props: IProps) => {
    const [text, setText] = React.useState<string>(props.name);
    const [openCopyModal, setOpenCopyModal] = React.useState<boolean>(false);

    const onTextChange = React.useCallback((newName: string) => {
        setText(newName);
        if (props.execAsync) {
            props.execAsync(SQL_UPDATE_OPTION_NAME(props.id, newName));
        }
    }, [props.id, props.execAsync])

    const copyOption = React.useCallback(async (newName: string) => {
        let voSql = "";
        let voCounter = 0;

        const option = await props.getFirstAsync(SQL_GET_OPTION(props.id))
        const optionResult: SQLite.SQLiteRunResult = await props.runAsync(SQL_INSERT_OPTION(newName, option.number, option.script_id, option.section_id, option.subsection_id))

        const values = await props.getAllAsync(SQL_GET_VALUES(option.id))
        for (let l = 0; l < values.length; l++) {
            const value = values[l];
            const valueResult: SQLite.SQLiteRunResult = await props.runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, escapeString(value.text), value.type, 
            escapeString(value.userText), value.checked, option.script_id, option.section_id, option.subsection_id, optionResult.lastInsertRowId!))
            const value_options = await props.getAllAsync(SQL_GET_VALUE_OPTIONS(value.id))

            for (let m = 0; m < value_options.length; m++) {
                const value_option = value_options[m];
                voCounter++;
                voSql += `${SQL_INSERT_VALUE_OPTION(value_option.checked, value_option.number, value_option.text, option.script_id,
                    option.section_id, option.subsection_id, optionResult.lastInsertRowId!, valueResult.lastInsertRowId!, 1)};\n`;
            }
        }

        if (voCounter > 0) {
            await props.execAsync(`
                PRAGMA journal_mode = WAL;
                ${voSql}
            `);
        }
        setOpenCopyModal(false);
    }, [props.id, props.execAsync])

    const onCopyClick = React.useCallback(() => setOpenCopyModal(true), [])
    const onCopyCancel = React.useCallback(() => setOpenCopyModal(false), [])

    const onDelete = React.useCallback(() => {
        props.execAsync(SQL_DELETE_VALUE_OPTION_BY_OPTION_ID(props.id));
        props.execAsync(SQL_DELETE_VALUE_BY_OPTION_ID(props.id));
        props.execAsync(SQL_DELETE_OPTION_BY_OPTION_ID(props.id), true);
    }, [props.id, props.execAsync])

    return <SectionHeading>
        <EditableItemWrapper
            onCopy={onCopyClick}
            onDelete={onDelete}
            onEditName={onTextChange}
            name={text}
            type={"Option"} />
        {openCopyModal && <CopyItemModal
            type="option"
            onCancel={onCopyCancel}
            onYes={copyOption}
        />}
    </SectionHeading>
}

export default EditableOptionHeader;