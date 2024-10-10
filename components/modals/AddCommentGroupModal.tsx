import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SQL_INSERT_COMMENT_GROUP } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    num: number
    onClose: () => void
    onSubmit: (id?: number, name?: string) => void
}

export const AddCommentGroupModal = (props: IProps) => {
    const { ready, runAsync } = useDbContext();
    const [name, setName] = useState<string>("");

    const onClose = useCallback(() => props.onClose(), []);

    const onSubmit = useCallback(async () => {
        const result = await runAsync(SQL_INSERT_COMMENT_GROUP(name, props.num));
        props.onSubmit(result.lastInsertRowId, name);
    }, [props.num, name]);

    return (
        <Dialog
            visible={true}
            title={"Add Comment Group"}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready || name.length === 0}
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
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    formComponent: {
        padding: 10
    }
});
