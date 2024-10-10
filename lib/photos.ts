import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export const PHOTO_ALBUM = 'RevSpect';

export const replaceWithCorrectUri = (uri: string) => {
    if (Platform.OS === 'ios') {
        return uri;
    }
    return uri.includes("file:///storage/emulated/0/DCIM") ? uri.replace('DCIM', `Pictures/${PHOTO_ALBUM}`) :
        `file:///storage/emulated/0/Pictures/${PHOTO_ALBUM}/${uri}`
}

export const getAssetFromAlbum = async (uri: string): Promise<MediaLibrary.Asset | null> => {
    const album = await MediaLibrary.getAlbumAsync(PHOTO_ALBUM);
    const data = await MediaLibrary.getAssetsAsync({ album: album.id, first: 1000 });

    const index = data.assets.findIndex((a) => uri.toLowerCase().endsWith(a.filename.toLowerCase()));
    if (index >= 0) {
        return data.assets[index]
    }
    return null
}

export const deleteAssetFromAlbum = async (asset: MediaLibrary.Asset): Promise<boolean> => {
    const album = await MediaLibrary.getAlbumAsync(PHOTO_ALBUM);
    return album === null ? false : await MediaLibrary.removeAssetsFromAlbumAsync(asset, album);
}

export const convertLocalIdentifierToAssetLibrary = (uri: string) => {
    const hash = uri.replace('ph://', '').split('/')[0];
    return `assets-library://asset/asset.png?id=${hash}&ext=png`;
};

// export const convertLocalIdentifierToAssetLibrary = (localIdentifier: any, ext: any) => {
//     const hash = localIdentifier.split('/')[0];
//     return `assets-library://asset/asset.${ext}?id=${hash}&ext=${ext}`;
// };

// export const GetAssets = async (params = { first: 11 }) => {
//     let result = await CameraRoll.getPhotos({ ...params, assetType: 'All' })
//     result.edges.map(async (edge: any) => {
//         if (Platform.OS === 'ios') {
//             edge.node.image.uri = convertLocalIdentifierToAssetLibrary(edge.node.image.uri.replace('ph://', ''), edge.node.type === 'image' ? 'jpg' : 'mov')
//         }
//         return
//     })
//     return result
// };