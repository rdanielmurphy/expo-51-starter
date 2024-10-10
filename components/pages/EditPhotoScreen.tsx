import React, { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { SQL_DELETE_PHOTO, SQL_GET_PHOTOTS_BY_INSPECTION_ID, SQL_UPDATE_PHOTO_COMMENT } from '../../lib/sqlCommands';
import { PhotosState } from '../../redux/reducers/photos';
import * as SQLite from 'expo-sqlite/next';
import { photoRowsToObjects } from '../../lib/photosHelper';
import { updatePhotos } from '../../redux/actions';
import { InspectionState } from '../../redux/reducers/inspection';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDbContext } from '../../contexts/DbContext';

export const EditPhotoScreen = (navigation: any) => {
    const photosState: PhotosState = useSelector((state: any) => state.photosState);
    const { execAsync, getAllAsync } = useDbContext();
    const [comment, setComment] = useState<string>(photosState.currentPhoto?.comment || "")
    const dispatch = useDispatch();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    let saveTimeout: NodeJS.Timeout;
    const saveToDB = (text: string) => {
        clearTimeout(saveTimeout);
        if (!text) return;

        saveTimeout = setTimeout(() => {
            if (photosState.currentPhoto && photosState.currentPhoto.id) {
                execAsync(SQL_UPDATE_PHOTO_COMMENT(photosState.currentPhoto?.id, text));
                photosState.currentPhoto.comment = text;
            }
        }, 500);
    }

    const onTextChange = (text: string) => {
        setComment(text);
        saveToDB(text);
    };

    const onDelete = async () => {
        if (photosState.currentPhoto?.id) {
            await execAsync(SQL_DELETE_PHOTO(photosState.currentPhoto?.id));
            const newPhotos = await getAllAsync(SQL_GET_PHOTOTS_BY_INSPECTION_ID(inspectionState.id!));
            updatePhotos({ photos: photoRowsToObjects(newPhotos) })(dispatch);
            navigation.navigation.goBack();
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <GestureHandlerRootView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        source={{ uri: photosState.currentPhoto?.uri }}
                        style={{ flex: 1, width: "100%" }}
                        resizeMode="contain" />
                </View>
            </GestureHandlerRootView>
            <Button onPress={onDelete}>Delete Photo</Button>
            <TextInput
                label={"Comment"}
                value={comment}
                multiline
                onChangeText={onTextChange}
                style={{ marginTop: 5, width: "100%" }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        margin: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});
