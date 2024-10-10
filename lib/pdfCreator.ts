import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { encode as btoa } from 'base-64';
import { startActivityAsync } from 'expo-intent-launcher';
import { Platform } from 'react-native';

const openFile = async (fileUri: string, type: string) => {
    try {
        if (Platform.OS === 'android') {
            await startActivityAsync('android.intent.action.VIEW', {
                data: fileUri,
                flags: 1,
                type,
            });
        } else {
            await Sharing.shareAsync(fileUri, {
                UTI: type,
                mimeType: type,
            });
        }
    } catch (error) {
        // do something with error 
        console.error("Could not open file", error);
        Sharing.shareAsync(fileUri);
    }
};

export const saveAndSharePdf = async (fileName: string, pdfBytes: Uint8Array) => {
    const arrayToBase64 = (bytes: Uint8Array): string => {
        var binary = '';
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, arrayToBase64(pdfBytes), { encoding: FileSystem.EncodingType.Base64 });
    if (__DEV__) {
        // do dev stuff 🤘
        Sharing.shareAsync(fileUri);
    } else {
        openFile(fileUri, "application/pdf");
    }
}