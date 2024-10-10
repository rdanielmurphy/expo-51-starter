import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Divider, IconButton, ProgressBar, Surface } from 'react-native-paper';
import { SQL_DELETE_INSPECTION, SQL_DELETE_OPTION, SQL_DELETE_OVERVIEW, SQL_DELETE_SCRIPT, SQL_DELETE_SECTION, SQL_DELETE_SUBSECTION, SQL_DELETE_SUMMARY, SQL_DELETE_VALUE, SQL_DELETE_VALUE_OPTION, SQL_GET_OPTIONS, SQL_GET_MASTER_SCRIPTS, SQL_GET_SECTIONS, SQL_GET_SUBSECTIONS, SQL_GET_VALUES, SQL_GET_VALUE_OPTIONS, SQL_INSERT_OPTION, SQL_INSERT_SCRIPT, SQL_INSERT_SECTION, SQL_INSERT_SUBSECTION, SQL_INSERT_VALUE, SQL_INSERT_VALUE_OPTION_VALUE_ARRAY, SQL_UPDATE_SCRIPT_NAME } from '../../lib/sqlCommands';
import { resetInspection, updateSnackbar } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { copyInspectionTemplate } from '../../lib/databaseDataHelper';
import { IScript } from '../../hooks/useScripts';
import { DeleteItemModal } from '../modals/DeleteItemModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EditItemNameModal } from '../modals/EditItemNameModal';
import { useDbContext } from '../../contexts/DbContext';
import { ProgressDialog } from 'react-native-simple-dialogs';
import LoadingText from '../shared/ProgressText';

export const InpsectionTemplates = (navigation: any) => {
    const { ready, execAsync, getAllAsync, runAsync } = useDbContext();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [copying, setCopying] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>();
    const [showEditModal, setShowEditModal] = useState<boolean>();
    const [showCopyModal, setShowCopyModal] = useState<boolean>();
    const [scriptToEditDelete, setScriptToEditDelete] = useState<IScript>();
    const [scriptToCopy, setScriptToCopy] = useState<IScript>();
    const [refreshCounter, setRefreshCounter] = useState<number>(1);

    const [scripts, setScripts] = useState<IScript[]>([]);

    useEffect(() => {
        const getData = async () => {
            try {
                const scriptResults = await getAllAsync(SQL_GET_MASTER_SCRIPTS);
                setScripts(scriptResults);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to get templates', err)
            }
        }

        if (ready) {
            getData();
        }
    }, [ready, refreshCounter])

    const onScriptDelete = useCallback(
        (scriptId: number) => {
            const deleteInspectionTemplate = async () => {
                setIsLoading(true);

                try {
                    await execAsync(SQL_DELETE_SECTION(scriptId));
                    await execAsync(SQL_DELETE_SUBSECTION(scriptId));
                    await execAsync(SQL_DELETE_OPTION(scriptId));
                    await execAsync(SQL_DELETE_VALUE(scriptId));
                    await execAsync(SQL_DELETE_VALUE_OPTION(scriptId));
                    await execAsync(SQL_DELETE_OVERVIEW(scriptId));
                    await execAsync(SQL_DELETE_SUMMARY(scriptId));
                    await execAsync(SQL_DELETE_INSPECTION(scriptId));
                    await execAsync(SQL_DELETE_SCRIPT(scriptId));

                    successSnackbar("Successfully deleted template");
                } catch (e) {
                    failSnackbar("Failed to delete template");
                } finally {
                    setIsLoading(false);
                }
            }

            deleteInspectionTemplate();
        }, [execAsync, ready]
    );

    const onScriptCopy = useCallback(
        async (scriptId: number, name: string) => {
            setIsLoading(true);
            setCopying(true);

            try {
                await copyInspectionTemplate(execAsync, getAllAsync, runAsync, scriptId, name);
                successSnackbar("Successfully copied template");
                setRefreshCounter(refreshCounter + 1);
            } catch (e) {
                failSnackbar("Failed to copy template");
            } finally {
                setIsLoading(false);
                setCopying(false);
            }
        }, [ready, refreshCounter, execAsync, getAllAsync, runAsync]
    );

    const successSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: message
        })(dispatch);

    const failSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message
        })(dispatch);

    return (
        <View>
            {isLoading && <ProgressBar indeterminate={true} />}

            <View>
                <FlatList
                    data={scripts}
                    ItemSeparatorComponent={Divider}
                    keyExtractor={(_item, index) => index.toString()}
                    renderItem={({ item, index, separators }) => (
                        <Surface key={item.name} style={styles.surface}>
                            <TouchableHighlight
                                key={item.id}
                                onPress={() => {
                                    if (item.editable === 1) {
                                        resetInspection()(dispatch);
                                        navigation.navigation.navigate("EditTemplate", { id: item.id });
                                    }
                                }}
                                disabled={isLoading}
                                activeOpacity={0.6}
                                underlayColor="#DDDDDD"
                                onShowUnderlay={separators.highlight}
                                onHideUnderlay={separators.unhighlight}>
                                <View key={item.name} style={styles.view}>
                                    <View style={{ flex: 1, flexBasis: item.editable === 0 ? '90%' : '75%' }}>
                                        <View style={{ display: "flex", flexDirection: "row" }}>
                                            {item.editable === 0 && <Icon color={isLoading ? 'lightgrey' : 'black'} style={{ marginTop: "auto", marginRight: 8 }} size={30} name="lock" />}
                                            <Text style={{ fontSize: 30, color: isLoading ? "lightgrey" : "black" }}>{item.name}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 4, flexBasis: 100 }}>
                                        {item.editable === 1 && (
                                            <View style={{ flexDirection: 'row' }}>
                                                <IconButton
                                                    style={{ width: 40, marginTop: "auto" }}
                                                    icon="pencil"
                                                    disabled={isLoading}
                                                    onPress={() => {
                                                        setScriptToEditDelete(item);
                                                        setShowEditModal(true);
                                                    }}
                                                />
                                                <IconButton
                                                    style={{ width: 50, marginTop: "auto" }}
                                                    icon="delete"
                                                    disabled={isLoading}
                                                    onPress={() => {
                                                        setScriptToEditDelete(item);
                                                        setShowDeleteModal(true);
                                                    }}
                                                />
                                            </View>
                                        )}
                                        {item.editable === 0 && (<IconButton
                                            style={{ width: 50, marginTop: "auto" }}
                                            icon="clipboard"
                                            disabled={isLoading}
                                            onPress={() => {
                                                setScriptToCopy(item);
                                                setShowCopyModal(true);
                                            }}
                                        />)}
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </Surface>
                    )}
                />
                {showDeleteModal && scriptToEditDelete && scriptToEditDelete.id &&
                    <DeleteItemModal
                        type={`${scriptToEditDelete.tag} template`}
                        onCancel={() => setShowDeleteModal(false)}
                        onYes={() => {
                            if (scriptToEditDelete) {
                                setScripts(scripts.filter(v => v.id !== scriptToEditDelete.id))
                                onScriptDelete(scriptToEditDelete.id);
                            }
                            setShowDeleteModal(false);
                            setScriptToEditDelete(undefined);
                        }}
                    />}
                {showEditModal && scriptToEditDelete && scriptToEditDelete.id &&
                    <EditItemNameModal
                        type={'template'}
                        name={scriptToEditDelete.name}
                        onClose={() => {
                            setShowEditModal(false)
                            setScriptToEditDelete(undefined);
                        }}
                        onSubmit={async (newName: string) => {
                            await execAsync(SQL_UPDATE_SCRIPT_NAME(scriptToEditDelete.id, newName));
                            const scriptResults = await getAllAsync(SQL_GET_MASTER_SCRIPTS);
                            setScripts(scriptResults);
                            setShowEditModal(false)
                            setScriptToEditDelete(undefined);
                        }}
                    />}
                {showCopyModal && scriptToCopy && scriptToCopy.id &&
                    <EditItemNameModal
                        type={'template'}
                        name={scriptToCopy.name}
                        onClose={() => {
                            setShowCopyModal(false);
                            setScriptToCopy(undefined);
                        }}
                        onSubmit={(newName: string) => {
                            onScriptCopy(scriptToCopy.id, newName);
                            setShowCopyModal(false);
                            setScriptToCopy(undefined);
                        }}
                    />}
                <ProgressDialog
                    visible={copying}
                    message={<LoadingText>Copying Inspection</LoadingText>}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        padding: 20,
    }
});
