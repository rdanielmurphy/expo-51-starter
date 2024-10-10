import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Headline, Modal, Portal, TextInput, Text, IconButton, Title, ProgressBar } from 'react-native-paper';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalButtons } from '../../shared/ModalButtons';

export interface IReorderItemProps {
    id: number
    text: string
}

interface IProps {
    items: IReorderItemProps[]
    disabled: boolean
    title: string
    onCancel: () => void
    onSave: (newOrder: IReorderItemProps[]) => void
}

export const ReorderItemsModal = (props: IProps) => {
    const [items, setItems] = useState<IReorderItemProps[]>([]);
    const screen = Dimensions.get("screen");

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = () => {
        props.onSave(items);
    };

    useEffect(() => {
        setItems([...props.items])
    }, [props.items])

    const renderItem = ({ item, drag, isActive }: RenderItemParams<IReorderItemProps>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.rowItem,
                        { backgroundColor: isActive ? "lightgrey" : "white" },
                    ]}>
                    <View style={{ height: 30, width: screen.width / 2, display: "flex", justifyContent: "space-between", flexDirection: 'row' }}>
                        <IconButton
                            style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                            icon="menu"
                        />
                        <Text style={{ flexBasis: "auto", flexShrink: 0, flexGrow: 1, alignSelf: "center", width: "100%" }}>
                            {item.text}
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <Portal>
            <Modal visible={true} onDismiss={onCancel} contentContainerStyle={styles.containerStyle}>
                <Headline>{props.title}</Headline>
                <ProgressBar indeterminate visible={props.disabled} />

                <View>
                    <View>
                        <GestureHandlerRootView style={{ width: '100%' }}>
                            <DraggableFlatList
                                data={items}
                                onDragEnd={({ data }) => setItems(data)}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderItem}
                                ListFooterComponent={
                                    <View>
                                        <ModalButtons
                                            confirmDisabled={props.disabled}
                                            cancelDisabled={props.disabled}
                                            confirmText={"Save"}
                                            cancelAction={onCancel}
                                            confirmAction={onSubmit} />
                                    </View>
                                }
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListFooterComponentStyle={{
                                    flex: 1,
                                    justifyContent: 'flex-end',
                                    alignContent: 'flex-end',
                                    alignItems: 'flex-end',
                                }}
                            />
                        </GestureHandlerRootView>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        height: 50,
        alignContent: "space-between",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    rowItem: {
        width: "100%",
        padding: 8,
        display: "flex"
    },
});
