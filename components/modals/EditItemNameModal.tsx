import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';

interface IProps {
    type: string
    name?: string
    customTitle?: string
    disabled?: boolean
    onClose: () => void
    onSubmit: (newName: string) => void
}

export const EditItemNameModal = (props: IProps) => {
    const [name, setName] = useState<string>(props.name || "");

    const onClose = useCallback(() => props.onClose(), []);

    const onSubmit = useCallback(() => {
        props.onSubmit(name);
    }, [props.onSubmit, name]);

    return (
        <Dialog
            visible={true}
            title={`${props.customTitle ? props.customTitle : "Edit " + props.type.toLocaleLowerCase() + " name"}`}
            buttons={(
                <ModalButtons
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <View>
                <TextInput
                    disabled={props.disabled}
                    autoComplete='off'
                    label="Name"
                    value={name}
                    onChangeText={setName}
                />
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        height: 40,
        alignContent: "space-between",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
});
