import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Headline, Modal, Portal, Subheading } from 'react-native-paper';

interface IProps {
    itemId: number
    itemName: string
    onCancel: () => void
    onYes: () => void
}

export const DeleteValueOptionItem = (props: IProps) => {
    const onClose = useCallback(() => props.onCancel(), []);
    const onSubmit = useCallback(() => {
        // executeSQL(SQL_DELETE_COMMENT(props.commentId));
        props.onYes();
    }, [props.itemId]);

    return (
        <Portal>
            <Modal visible={true} onDismiss={onClose} contentContainerStyle={styles.containerStyle}>
                <Headline>Are you sure you want to delete this option?</Headline>
                <Subheading>{props.itemName}</Subheading>

                <View style={styles.buttons}>
                    <Button mode="text" onPress={onClose}>Cancel</Button>
                    <Button mode="text" onPress={onSubmit}>Yes</Button>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
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
});
