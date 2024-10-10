import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export const launchCamera = async (onFail: (err: string) => void, onSuccess: (uri: string) => void) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            onSuccess(result.assets[0].uri);
        }
    } else {
        onFail("Must grant permission");
    }
}

export const launchPicker = async (onSuccess: (uri: string) => void) => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true
    });
    if (!result.canceled) {
        onSuccess(result.assets[0].uri);
    }
}

export const saveToPhone = async (uri: string, onFail: (err: string) => void, onSuccess: (asset: MediaLibrary.Asset) => void) => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
        try {
            const asset = await MediaLibrary.createAssetAsync(uri);
            const album = await MediaLibrary.getAlbumAsync('RevSpect');
            if (album === null) {
                MediaLibrary.createAlbumAsync('RevSpect', asset, false)
                    .then(async () => {
                        onSuccess(asset);
                    })
                    .catch(() => {
                        onFail("Failed to read image");
                    });
            } else {
                MediaLibrary.addAssetsToAlbumAsync(asset, album)
                    .then(async () => {
                        onSuccess(asset);
                    })
                    .catch(() => {
                        onFail("Failed to read image");
                    });
            }
        } catch (error) {
            onFail("Failed to read image");
        }
    } else {
        onFail("Must grant permission");
    }
};
