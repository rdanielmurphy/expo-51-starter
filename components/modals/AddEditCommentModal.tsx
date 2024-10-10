import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { IComment } from '../../lib/defaultComments';
import { SQL_INSERT_COMMENT, SQL_UPDATE_COMMENT } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';
import { escapeString } from '../../lib/databaseDataHelper';

interface IProps {
    mode: "Add" | "Edit"
    groupId: number
    num: number
    commentId?: number
    name?: string
    text?: string
    onClose: () => void
    onSubmit: (newComment: IComment) => void
}

export const AddEditCommentModal = (props: IProps) => {
    const { ready, execAsync, runAsync } = useDbContext();
    const [name, setName] = useState<string>(props.name ?? "");
    const [text, setText] = useState<string>(props.text ?? "");

    const onClose = useCallback(() => props.onClose(), []);

    const mode = props.mode

    const onSubmit = useCallback(async () => {
        if (mode === "Edit" && props.commentId !== undefined) {
            await execAsync(SQL_UPDATE_COMMENT(props.commentId, escapeString(name), escapeString(text)));
            props.onSubmit({
                id: props.commentId,
                name: name,
                number: props.num,
                text: text,
            } as IComment);
            return;
        } else if (mode === "Add") {
            const result = await runAsync(SQL_INSERT_COMMENT(props.groupId, props.num, escapeString(name), escapeString(text)));
            props.onSubmit({
                id: result.lastInsertRowId,
                name: name,
                number: props.num,
                text: text,
            } as IComment);
        }
    }, [props.num, props.groupId, props.commentId, text, name, mode]);

    return (
        <Dialog
            visible={true}
            title={`${props.mode} Comment`}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready || name.length === 0 || text.length === 0}
                    confirmText={"Save"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <View>
                <View style={styles.formComponent}>
                    <TextInput
                        autoComplete='off'
                        label="Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View style={styles.formComponent}>
                    <TextInput
                        numberOfLines={15}
                        autoFocus
                        value={text}
                        onChangeText={(v: string) => {
                            setText(v)
                        }}
                        multiline
                    />
                </View>
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 0,
    },
    button: {
        margin: 10,
        width: 400,
    },
    buttons: {
        flexDirection: 'row',
        height: 50,
        alignContent: "space-between",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    formComponent: {
        padding: 10
    }
});
