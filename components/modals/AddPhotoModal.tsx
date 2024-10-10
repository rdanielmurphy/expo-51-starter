import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Headline, Modal, Portal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateAddPhotoModal } from '../../redux/actions';
import { AddPhotoModalState } from '../../redux/reducers/addPhotoModal';
import { initialState } from '../../redux/reducers/addPhotoModal';

export const AddPhotoModal = () => {
    const dispatch = useDispatch();
    const addPhotoModalState: AddPhotoModalState = useSelector((state: any) => state.addPhotoModalState);

    const closeModal = () => updateAddPhotoModal(initialState)(dispatch);

    const handleTakePhoto = useCallback(() => {
        if (addPhotoModalState.onCameraClick) {
            addPhotoModalState.onCameraClick()
        }
    }, [addPhotoModalState.onCameraClick])

    const handleSelectExisting = useCallback(() => {
        if (addPhotoModalState.onExisitingClick) {
            addPhotoModalState.onExisitingClick()
        }
    }, [addPhotoModalState.onExisitingClick])

    return (
        <Portal>
            <Modal visible={addPhotoModalState.show === true} onDismiss={() => closeModal()} contentContainerStyle={styles.containerStyle}>
                <Headline>Add {addPhotoModalState.name} Photo</Headline>
                <View style={styles.container}>
                    <View style={styles.buttons}>
                        <Button onPress={handleTakePhoto}>
                            Take Photo
                        </Button>
                        <Button onPress={handleSelectExisting}>
                            Select Existing Photo
                        </Button>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 25,
    },
    container: {
        height: 75,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
});

