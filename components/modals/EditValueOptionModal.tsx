import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Headline, IconButton, Modal, Portal, Subheading, Text, Title } from 'react-native-paper';
import { DeleteValueOptionItem } from './DeleteValueOptionItem';
import { SQL_DELETE_VALUE_OPTION_BY_ID, SQL_GET_VALUE_OPTIONS, SQL_UPDATE_VALUE_OPTION_NAME, SQL_UPDATE_VALUE_OPTION_NUMBER } from '../../lib/sqlCommands';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { EditItemNameModal } from './EditItemNameModal';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    valueOptionId: number,
    name: string
    onClose: () => void
    onAddNewItem: (text: string, number: number) => void
}

export const EditValueOptionModal = (props: IProps) => {
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [inFlight, setInFlight] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newItemNumber, setNewItemNumber] = useState<number>(1);
    const [valueOptions, setValueOptions] = useState<any[] | undefined>(undefined);
    const { ready, execAsync, getAllAsync } = useDbContext();
    const screen = Dimensions.get("screen");
    const [selectedItemForEditing, setSelectedItemForEditing] = useState<any | undefined>(undefined);

    const refreshData = useCallback(async () => {
        setInFlight(true);
        const values = await getAllAsync(SQL_GET_VALUE_OPTIONS(props.valueOptionId));
        const theValueOptions = values.sort((a, b) => a.number - b.number);
        setValueOptions(theValueOptions);
        if (theValueOptions && theValueOptions.length > 0) {
            setNewItemNumber(Math.max(...theValueOptions.map(c => c.number)) + 1);
        }
        setInFlight(false);
    }, [props.valueOptionId, getAllAsync])

    useEffect(() => {
        if (ready) {
            refreshData();
        }
    }, [ready]);

    const onClose = useCallback(() => props.onClose(), []);

    const onSubmit = useCallback(async () => {
        // re-order
        for (let i = 0; valueOptions && i < valueOptions?.length; i++) {
            const item = valueOptions[i];
            await execAsync(SQL_UPDATE_VALUE_OPTION_NUMBER(item.id, i + 1));
        }

        onClose();
    }, [onClose, valueOptions]);

    const onChildModalClose = useCallback(() => {
        setSelectedItemForEditing(undefined);
        setShowDeleteModal(false);
        setShowEditModal(false);
        setShowAddModal(false);
    }, []);

    const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive || inFlight}
                    style={[
                        styles.rowItem,
                        { backgroundColor: isActive ? "lightgrey" : "white" },
                    ]}>
                    <View style={{ width: screen.width / 2, display: "flex", flexDirection: 'row' }}>
                        <View style={{ width: "100%", height: 50, justifyContent: "center", alignItems: "flex-start" }}>
                            <View style={{ display: "flex", flexDirection: 'row' }}>
                                <IconButton
                                    disabled={inFlight}
                                    icon="menu"
                                />
                                <Text style={{ alignSelf: "center" }}>{item.text}</Text>
                            </View>
                        </View>
                        <View style={{ width: 100, height: 50 }}>
                            <View style={{ display: "flex", flexDirection: 'row' }}>
                                <IconButton
                                    disabled={inFlight}
                                    icon="pencil"
                                    onPress={() => {
                                        setSelectedItemForEditing(item);
                                        setShowEditModal(true);
                                    }}
                                />
                                <IconButton
                                    disabled={inFlight}
                                    icon="delete"
                                    onPress={() => {
                                        setSelectedItemForEditing(item);
                                        setShowDeleteModal(true);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <Portal>
            <Modal visible={true} onDismiss={onClose} contentContainerStyle={styles.containerStyle}>
                <Headline>Edit multi-checkbox options</Headline>

                <View>
                    <GestureHandlerRootView style={{ width: '100%' }}>
                        <DraggableFlatList
                            ListHeaderComponent={
                                <View>
                                    <Title>{props.name}</Title>
                                    {!valueOptions || valueOptions.length === 0 && <Subheading>Add options by clicking add button</Subheading>}
                                </View>
                            }
                            data={valueOptions ?? []}
                            onDragEnd={({ data }) => setValueOptions(data)}
                            keyExtractor={(item) => item.id?.toString() || item.number.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={
                                <View style={styles.buttons}>
                                    <Button mode="text" onPress={onClose}>Cancel</Button>
                                    <Button mode="text" onPress={onSubmit}>Done</Button>
                                    <Button mode="text" onPress={() => setShowAddModal(true)}>Add</Button>
                                </View>
                            }
                            contentContainerStyle={{ flexGrow: 1 }}
                            ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                        />
                    </GestureHandlerRootView>
                </View>
            </Modal>
            {showDeleteModal && selectedItemForEditing && selectedItemForEditing.id &&
                <DeleteValueOptionItem
                    itemId={selectedItemForEditing.id}
                    itemName={selectedItemForEditing.text}
                    onCancel={onChildModalClose}
                    onYes={async () => {
                        const id = selectedItemForEditing.id;
                        await execAsync(SQL_DELETE_VALUE_OPTION_BY_ID(id));
                        onChildModalClose();
                        await refreshData();
                    }}
                />}
            {showEditModal && selectedItemForEditing && selectedItemForEditing.id &&
                <EditItemNameModal
                    type={'option'}
                    name={selectedItemForEditing.text}
                    onClose={onChildModalClose}
                    onSubmit={async (newName: string) => {
                        const id = selectedItemForEditing.id;
                        await execAsync(SQL_UPDATE_VALUE_OPTION_NAME(id, newName));
                        onChildModalClose();
                        await refreshData();
                    }}
                />}
            {showAddModal &&
                <EditItemNameModal
                    type={'option'}
                    name={""}
                    customTitle='Add new option'
                    onClose={onChildModalClose}
                    onSubmit={async (text: string) => {
                        await props.onAddNewItem(text, newItemNumber);
                        onChildModalClose();
                        await refreshData();
                    }}
                />}
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        height: 40,
        alignContent: "space-between",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    formComponent: {
        padding: 10
    },
    rowItem: {
        width: "100%",
        padding: 8,
        display: "flex"
    },
});
