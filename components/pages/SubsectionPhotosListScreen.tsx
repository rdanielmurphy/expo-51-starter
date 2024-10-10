import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from 'react-native-paper';
import { updateCurrentPhoto } from '../../redux/actions';
import { PhotosState } from '../../redux/reducers/photos';
import PhotoPreview from '../shared/PhotoPreview';

export const SubsectionPhotosListScreen = ({ navigation: { navigate }, route }: any) => {
    const dispatch = useDispatch();
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const photosState: PhotosState = useSelector((state: any) => state.photosState);

    useEffect(() => {
        setFlatListItems(photosState.photos?.filter(p => p.subsectionId === route.params.id));
    }, [photosState.updateCounter]);

    return (
        <View style={styles.photoContainer}>
            {flatListItems && flatListItems.map((photo, index) =>
                <PhotoPreview
                    key={index}
                    onPress={() => {
                        updateCurrentPhoto({ currentPhoto: photo })(dispatch);
                        navigate("EditPhoto")
                    }}
                    photo={photo}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    photoContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
});

