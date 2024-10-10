import React, { useEffect, useRef } from 'react'
import { Image, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEmojiContext } from '../../contexts/EmojiContext';
import IconSticker from '../shared/IconSticker';
import { SaveButton } from '../shared/SaveButton';
import ViewShot from "react-native-view-shot";
import { ModalButton } from '../modals/ModalButton';
import { useDispatch, useSelector } from 'react-redux';
import { AddPhotoModalState, initialState } from '../../redux/reducers/addPhotoModal';
import { updateAddPhotoModal, updatePhotos, updateSnackbar } from '../../redux/actions';
import { saveToPhone } from '../../lib/camera';
import { SQL_GET_PHOTOTS_BY_INSPECTION_ID, SQL_INSERT_SUBECTION_PHOTO } from '../../lib/sqlCommands';
import { photoRowsToObjects } from '../../lib/photosHelper';
import * as SQLite from 'expo-sqlite/next';
import * as MediaLibrary from 'expo-media-library';
import { CancelButton } from '../shared/CancelButton';
import { InfoButton } from '../shared/InfoButton';
import { UndoButton } from '../shared/UndoButton';
import { useDbContext } from '../../contexts/DbContext';

const iconSize = 64;

export const MarkupStickerScreen = ({ navigation }: any) => {
    const { emojis, clearEmojis, undoLastEmoji } = useEmojiContext();
    const ref = useRef<ViewShot>(null);
    const addPhotoModalState: AddPhotoModalState = useSelector((state: any) => state.addPhotoModalState);
    const dispatch = useDispatch();
    const { execAsync, getAllAsync } = useDbContext();

    const successSnackbar = () =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: "Added photo"
        })(dispatch);

    const failSnackbar = (message?: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message ? message : "Could not add photo"
        })(dispatch);

    const onCancel = () => {
        navigation.goBack();
    }

    const onSubmit = () => {
        if (ref.current) {
            (ref.current as any).capture().then(async (uri: string) => {
                await saveToPhone(uri, (err: string) => {
                    failSnackbar(err);
                }, async (asset: MediaLibrary.Asset) => {
                    await execAsync(SQL_INSERT_SUBECTION_PHOTO(asset.uri, addPhotoModalState.inspectionId!, addPhotoModalState.sectionId!, addPhotoModalState.subsectionId!, undefined));
                    const newPhotos = await getAllAsync(SQL_GET_PHOTOTS_BY_INSPECTION_ID(addPhotoModalState.inspectionId!));
                    updatePhotos({ photos: photoRowsToObjects(newPhotos) })(dispatch);
                    successSnackbar();
                    updateAddPhotoModal(initialState)(dispatch);
                    navigation.goBack();
                });
            });
        }
    }

    const onUndo = () => {
        undoLastEmoji();
    }

    useEffect(() => {
        clearEmojis();
    }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <GestureHandlerRootView style={styles.container}>
                <ViewShot
                    style={{ flex: 1, justifyContent: 'flex-start' }}
                    ref={ref}
                    options={{ fileName: "Your-File-Name", format: "jpg", quality: 1 }}>
                    <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                        <Image
                            source={{ uri: addPhotoModalState.uri }}
                            style={{ flex: 1, width: "100%" }}
                            resizeMode="contain" />
                    </View>
                    <View style={styles.emojiView}>
                        {emojis.map((e, i) =>
                            <IconSticker
                                key={i}
                                iconName={e}
                            />
                        )}
                    </View>
                </ViewShot>
            </GestureHandlerRootView>
            <ModalButton size={iconSize} onPress={() => navigation.navigate("StickerModal")} />
            <SaveButton
                size={iconSize}
                onPress={onSubmit}
            />
            <CancelButton
                size={iconSize}
                onPress={onCancel}
            />
            <UndoButton
                size={iconSize}
                onPress={onUndo}
            />
            <InfoButton
                size={iconSize}
                onPress={() => navigation.navigate("StickerInfoModal")}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    emojiView: {
        backgroundColor: "transparent",
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        bottom: 100,
        zIndex: 3,
    },
});