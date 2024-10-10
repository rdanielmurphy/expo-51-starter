import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Headline } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import { InspectionState } from '../../redux/reducers/inspection';
import { useDispatch, useSelector } from 'react-redux';
import { updateAddPhotoModal, updateCurrentPhoto, updateAddPhotoUri, updateSnackbar } from '../../redux/actions';
import { IPhoto, PhotosState } from '../../redux/reducers/photos';
import PhotoPreview from '../shared/PhotoPreview';
import { launchCamera, launchPicker } from '../../lib/camera';

interface IPhotosOptionProps {
    navigate: any;
    sectionId: number;
    subsectionId: number;
    subsectionName: string;
}

const PhotosOption = (props: IPhotosOptionProps) => {
    const dispatch = useDispatch();
    const photosState: PhotosState = useSelector((state: any) => state.photosState);

    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    const failSnackbar = (message?: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message ? message : "Could not add photo"
        })(dispatch);

    const markupImage = async (uri: string) => {
        updateAddPhotoUri({
            uri: uri,
        })(dispatch);
        props.navigate("MarkupStickerScreen")
    };

    const pickImage = () => {
        updateAddPhotoModal({
            show: true,
            name: props.subsectionName,
            inspectionId: inspectionState.id!,
            sectionId: props.sectionId,
            subsectionId: props.subsectionId,
            onCameraClick: () => launchCamera(failSnackbar, markupImage),
            onExisitingClick: () => launchPicker(markupImage)
        })(dispatch);
    }

    const photos: IPhoto[] = photosState.photos?.filter((p) => p.subsectionId === props.subsectionId) || []
    return (
        <View key={`${props.subsectionName}-photos`}>
            <View style={styles.titleContainer}>
                <View style={styles.title}>
                    <Headline>{`${props.subsectionName} Photos`}</Headline>
                </View>
                <View style={styles.icon}>
                    <IconButton
                        icon="camera"
                        size={24}
                        onPress={pickImage}
                    />
                </View>
            </View>
            <View style={styles.imageContainer}>
                {(photos && photos.length > 0) && photos.map((photo, index) =>
                    <PhotoPreview
                        key={index}
                        onPress={() => {
                            updateCurrentPhoto({ currentPhoto: photo })(dispatch);
                            props.navigate("EditPhoto")
                        }}
                        photo={photo}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    icon: {
        flexGrow: 1
    },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    title: {
        flexGrow: 5,
        marginTop: 8,
    },
    titleContainer: {
        flexDirection: "row",
        display: "flex",
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
    },
});

export default PhotosOption;