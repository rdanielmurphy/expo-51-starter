import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Divider, IconButton, Surface } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { SQL_GET_INSPECTIONS } from '../../lib/sqlCommands';
import { updateSection, updateSnackbar } from '../../redux/actions';
import { DeleteInspectionModal } from '../modals/DeleteInspectionModal';
import { useDbContext } from '../../contexts/DbContext';

export const ExistingReportsScreen = (navigation: any) => {
    const dispatch = useDispatch();
    const { getAllAsync, ready } = useDbContext();
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | undefined>();
    const [refreshCounter, setRefreshCounter] = useState<number>(0);

    useEffect(() => {
        updateSection({ section_id: undefined })(dispatch);
    }, [dispatch]);

    useEffect(() => {
        const getInspectionsTable = (async () => {
            const results = await getAllAsync(SQL_GET_INSPECTIONS);
            var temp = [];
            for (let i = 0; i < results.length; ++i) {
                const item = results[i];
                temp.push(item);
            }
            setFlatListItems(temp.sort((a: any, b: any) => {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            }));
        });
        getInspectionsTable();
    }, [ready, refreshCounter]);

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <FlatList
                data={flatListItems}
                ItemSeparatorComponent={Divider}
                keyExtractor={(_item, index) => index.toString()}
                renderItem={({ item, index, separators }) => (
                    <Surface key={item.name} style={styles.surface}>
                        <TouchableHighlight
                            key={item.key}
                            onPress={() => {
                                navigation.navigation.navigate("EditInspectionReport", { id: item.id })
                            }}
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            <View key={item.name} style={styles.view}>
                                <View style={{ flex: 1, flexBasis: '90%' }}>
                                    <Text style={{ fontSize: 30 }}>{item.name}</Text>
                                </View>
                                <View style={{ flex: 2, flexBasis: 50 }}>
                                    <IconButton
                                        style={{ width: 50 }}
                                        icon="delete"
                                        onPress={() => {
                                            setSelectedId(item.id);
                                            setOpenModal(true);
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                )}
            />
            {openModal && selectedId !== undefined &&
                <DeleteInspectionModal
                    onClose={() => setOpenModal(false)}
                    onSubmit={() => {
                        setRefreshCounter(refreshCounter + 1);
                        setOpenModal(false);
                        updateSnackbar({
                            show: true,
                            type: "success",
                            onDismissSnackBar: () => { },
                            message: "Deleted inspection"
                        })(dispatch);
                    }}
                    inspectionId={selectedId}
                />
            }
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

