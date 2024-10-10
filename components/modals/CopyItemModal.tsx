import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';

interface IProps {
    type: string
    onCancel: () => void
    onYes: (text: string) => void
}

export const CopyItemModal = (props: IProps) => {
    const [text, setText] = React.useState<string>("");

    const onClose = useCallback(() => props.onCancel(), [props.onCancel]);
    const onSubmit = useCallback(() => props.onYes(text), [props.onYes, text]);

    return (
        <Dialog
            visible={true}
            title={`Copy ${props.type}`}
            buttons={(
                <ModalButtons
                    cancelAction={onClose}
                    confirmAction={onSubmit}
                    confirmText='Copy' />
            )}>
            <View>
                <>
                    <TextInput
                        label={"Name"}
                        value={text}
                        onChangeText={setText}
                        placeholder={`${props.type} name`}
                        style={{ marginLeft: 5, width: '100%' }}
                    />
                </>
            </View>
        </Dialog >
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        height: 50,
        marginTop: 8,
        alignContent: "space-between",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
});
