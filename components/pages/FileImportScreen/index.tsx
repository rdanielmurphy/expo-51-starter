import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useState } from 'react'
import { View } from 'react-native';
import { IImportInspectITModalResult, ImportInspectITModal } from './components/ImportSelectionModal';
import { updateSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';
import InspectITPickerButton from './components/InspectITPickerButton';
import IntraSpectPickerButton from './components/IntraspectPickerButton';
import * as FileSystem from 'expo-file-system';
import { DATABASE_NAME } from '../../../hooks/useDatabaseNew';

export const FileImportScreen = () => {
    const [inspectITDb, setInspectITDb] = useState<DocumentPicker.DocumentPickerAsset>();
    const [intraSpectDb, setIntraSpectDb] = useState<DocumentPicker.DocumentPickerAsset>();
    const dispatch = useDispatch();

    const successSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: message,
        })(dispatch);

    const failSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message,
        })(dispatch);

    const onInspectITDbModalClose = useCallback((result?: IImportInspectITModalResult) => {
        if (result?.success === true) {
            successSnackbar(result.message);
        } else if (result?.success === false) {
            failSnackbar(result.message);
        }
        setInspectITDb(undefined);
    }, []);

    const onInspectITDbSelect = useCallback((doc: DocumentPicker.DocumentPickerResult) => {
        const theFileName = doc.assets ? doc.assets[0].name : undefined;
        if (doc.assets && theFileName && (theFileName.endsWith('.sqlite') || theFileName.endsWith('.sqlite3'))) {
            setInspectITDb(doc.assets[0]);
        } else {
            failSnackbar('Please select a valid InspectIT DB');
        }
    }, [failSnackbar]);

    const onIntraSpectDbSelect = useCallback(async (doc: DocumentPicker.DocumentPickerResult) => {
        const theFileName = doc.assets ? doc.assets[0].name : undefined;
        if (doc.assets && theFileName && (theFileName.endsWith('.db'))) {
            const db = doc.assets[0];
            setIntraSpectDb(db);
            await FileSystem.copyAsync({
                from: db.uri,
                to: `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}.db`,
            });
            successSnackbar('Imported the IntraSpect DB');
        } else {
            failSnackbar('Please select a valid IntraSpect DB');
        }
    }, [failSnackbar]);

    return (
        <View style={{ height: '100%' }}>
            <View style={{ margin: 16 }}>
                <View style={{ marginBottom: 16 }}>
                    <IntraSpectPickerButton
                        onPick={onIntraSpectDbSelect}
                    />
                </View>
                <View style={{ marginBottom: 16 }}>
                    <InspectITPickerButton
                        onPick={onInspectITDbSelect}
                    />
                </View>
            </View>
            {inspectITDb && (
                <ImportInspectITModal
                    doc={inspectITDb}
                    onClose={onInspectITDbModalClose}
                />
            )}
        </View>
    )
}
