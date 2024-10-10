import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { SQL_UPDATE_VALUE_TEXT, SQL_INSERT_NEW_CHECKBOX_TO_TEMPLATE, SQL_DELETE_VALUE_BY_ID, SQL_INSERT_VALUE_OPTION } from '../../lib/sqlCommands';
import { TYPE_MAP } from '../../lib/types';
import EditableItemWrapper from './EditableItemWrapper';
import { EditValueOptionModal } from '../modals/EditValueOptionModal';

const EditableValueOption = (props: any) => {
    const theValue = props.value
    const [text, setText] = React.useState<string>(theValue.text);
    const [showModal, setShowModal] = React.useState(false);

    const onTextChange = React.useCallback((text: string) => {
        setText(text);
        props.onUpdate(SQL_UPDATE_VALUE_TEXT(theValue.id, text));
    }, [theValue.id]);

    const onDelete = React.useCallback(() => {
        props.onUpdate(SQL_DELETE_VALUE_BY_ID(theValue.id), true);
    }, [theValue.id]);

    const onCopy = React.useCallback(() => {
        props.onUpdate(SQL_INSERT_NEW_CHECKBOX_TO_TEMPLATE(
            theValue.isNa, theValue.number, theValue.text, theValue.script_id,
            theValue.section_id, theValue.subsection_id, theValue.option_id,
            theValue.isHighlighted, theValue.highLightColor), true);
    }, [theValue]);

    const onEditOptions = React.useCallback(() => {
        setShowModal(true);
    }, [theValue]);

    const hideEditOptions = React.useCallback(() => {
        setShowModal(false);
    }, [theValue]);

    return (
        <Surface elevation={1} style={styles.surface}>
            <EditableItemWrapper
                type={TYPE_MAP.get(5)!}
                name={text}
                onCopy={onCopy}
                onDelete={onDelete}
                onEditName={onTextChange}
                onEditOptions={onEditOptions}
            />
            {showModal && <EditValueOptionModal
                valueOptionId={theValue.id}
                name={text}
                onClose={hideEditOptions}
                onAddNewItem={async (text: string, number: number) => {
                    await props.onUpdate(SQL_INSERT_VALUE_OPTION(0, number, text, theValue.script_id,
                        theValue.section_id, theValue.subsection_id, theValue.option_id,
                        theValue.id, 1));
                }}
            />}
        </Surface>
    )
}

const styles = StyleSheet.create({
    surface: {
        width: 180,
        marginTop: 4,
        marginRight: 4,
        marginLeft: 4,
    },
    text: {
        marginLeft: 5,
        minWidth: 100,
        flex: 1,
        alignContent: "center",
        alignSelf: "center",
    }
});

export default React.memo(EditableValueOption);
