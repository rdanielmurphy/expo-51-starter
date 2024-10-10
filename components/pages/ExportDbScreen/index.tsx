import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Platform, TouchableHighlight, View } from 'react-native';
import { Subheading, Surface } from 'react-native-paper';
import { updateSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import { DATABASE_NAME } from '../../../hooks/useDatabaseNew';
import * as Sharing from 'expo-sharing';
import { startActivityAsync } from 'expo-intent-launcher';

export const ExportDbScreen = () => {
    const dispatch = useDispatch();
    const [filesList, setFilesList] = useState<{ uri: string, name: string, size: number }[]>([]);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);

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

    const exportDb = useCallback(async () => {
        const dbUri = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}.db`;
        const currentTimestamp = new Date().getTime();

        try {
            await FileSystem.copyAsync({
                from: dbUri,
                to: `${FileSystem.documentDirectory}backups/${DATABASE_NAME}-${currentTimestamp}.db`,
            });
            setRefreshCounter(refreshCounter + 1);
            successSnackbar("DB Exported");
        } catch (e) {
            failSnackbar("DB Export Failed");
        }
    }, [refreshCounter, successSnackbar]);

    const getAllFilesInfo = useCallback(async () => {
        let dir = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'backups');

        const filesList: { uri: string, name: string, size: number }[] = [];
        for (const file of dir) {
            const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'backups/' + file);
            filesList.push({
                name: file,
                size: 1100,
                uri: fileInfo.uri,
            });
        }
        setFilesList(filesList);
    }, []);

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

    useEffect(() => {
        getAllFilesInfo();
    }, [refreshCounter]);

    const renderFileItem = ({ item }: { item: { uri: string, name: string, size: number } }) => (
        <View style={{ margin: 16 }}>
            <Surface style={{ padding: 16 }} onTouchStart={() => openFile(item.uri, 'db')}>
                <Subheading>Name: {item.name}</Subheading>
                <Subheading>Size: {item.size}</Subheading>
            </Surface>
        </View>
    );

    return (
        <View style={{ height: '100%' }}>
            <View style={{ margin: 16 }}>
                <Surface>
                    <TouchableHighlight
                        onPress={exportDb}
                        activeOpacity={0.6}
                        style={{ height: 50, width: "100%", justifyContent: 'center', alignItems: 'center' }}
                        underlayColor="#DDDDDD">
                        <View>
                            <Subheading>Export DB</Subheading>
                        </View>
                    </TouchableHighlight>
                </Surface>
                <FlatList
                    data={filesList}
                    renderItem={renderFileItem}
                    keyExtractor={(item) => item.name}
                />
            </View>
        </View>
    )
}

export default ExportDbScreen;
