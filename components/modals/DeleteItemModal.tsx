import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Headline, Modal, Portal } from 'react-native-paper';
import { ConfirmDialog } from 'react-native-simple-dialogs';

interface IProps {
    type: string
    onCancel: () => void
    onYes: () => void
}

export const DeleteItemModal = (props: IProps) => {
    const onClose = useCallback(() => props.onCancel(), [props.onCancel]);
    const onSubmit = useCallback(() => props.onYes(), [props.onYes]);

    return (
        <ConfirmDialog
            visible={true}
            title={`Are you sure you want to delete this ${props.type}?`}
            onTouchOutside={onClose}
            negativeButton={{
                title: 'No',
                onPress: onClose,
            }}
            positiveButton={{
                title: 'Yes',
                onPress: onSubmit,
            }} />
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
