import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, ProgressBar } from 'react-native-paper';
import {
    SQL_GET_MASTER_OVERVIEW_SECTION,
    SQL_UPDATE_OVERVIEW_COMMENT_GROUP_ID,
    SQL_INSERT_OVERVIEW_SECTION,
    SQL_GET_OVERVIEW_SECTION,
    SQL_DELETE_OVERVIEW_SECTION,
    SQL_UPDATE_OVERVIEW_NAME,
    SQL_UPDATE_OVERVIEW_NUMBER,
} from '../../lib/sqlCommands';
import { updateAddOverviewModal, updateSnackbar } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteItemModal } from '../modals/DeleteItemModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useDbContext } from '../../contexts/DbContext';
import { AddSummaryOverviewModalState } from '../../redux/reducers/addSummaryOverviewModal';
import { AddEditSummaryOverviewModal, INewSummaryOverview } from '../modals/AddEditSummaryOverviewModal';

interface IReorderItemProps {
    id: number
    name: string
    commentListNumber: number
}

export const EditOverviewScreenHeader = (props: any) => {
    const dispatch = useDispatch();

    const onAddPress = useCallback(() => {
        updateAddOverviewModal({ showSummary: false, showOverview: true })(dispatch);
    }, []);

    return (
        <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{props.children}</Text>
            <IconButton
                style={{ width: 50 }}
                icon="plus-circle"
                onPress={onAddPress}
            />
        </View>
    )
}

export const EditOverviewScreen = () => {
    const { ready, execAsync, getFirstAsync, getAllAsync } = useDbContext();
    const dispatch = useDispatch();
    const addSummaryOverviewModalState: AddSummaryOverviewModalState = useSelector((state: any) => state.addSummaryOverviewModalState);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>();
    const [showEditModal, setShowEditModal] = useState<boolean>();
    const [overviewToDelete, setOverviewToDelete] = useState<any>();
    const [overviewToEdit, setOverviewToEdit] = useState<any>();
    const [refreshCounter, setRefreshCounter] = useState<number>(1);
    const [overviewId, setOverviewId] = useState<number>();
    const [lastNumber, setLastNumber] = useState<number>(1);

    const [items, setItems] = useState<IReorderItemProps[]>([]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                const overviewMasterResult = await getFirstAsync(SQL_GET_MASTER_OVERVIEW_SECTION);
                const id = overviewMasterResult.id;
                setOverviewId(id);
                const overviewResults = await getAllAsync(SQL_GET_OVERVIEW_SECTION(id));
                const overviewItems = overviewResults
                    .sort((a: any, b: any) => a.number - b.number);
                setItems(overviewItems.map((item: any) => ({ id: item.id, name: item.name, commentListNumber: item.commentListNumber })));
                setLastNumber(overviewItems[overviewItems.length - 1].number)
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to get overview', err)
            }
        }

        if (ready) {
            getData();
        }
    }, [ready, refreshCounter]);

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

    const onOverviewDelete = useCallback(
        (overviewSectionId: number) => {
            const deleteInspectionTemplate = async () => {
                setIsLoading(true);

                try {
                    await execAsync(SQL_DELETE_OVERVIEW_SECTION(overviewSectionId));
                    successSnackbar("Successfully deleted overview subsection");
                } catch (e) {
                    failSnackbar("Failed to delete overview subsection");
                } finally {
                    setIsLoading(false);
                }
            }

            deleteInspectionTemplate();
        }, [ready]
    );

    const renderItem = ({ item, drag, isActive }: RenderItemParams<IReorderItemProps>) => {
        const screen = Dimensions.get("screen");
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    onPress={() => {
                        setOverviewToEdit(item);
                        setShowEditModal(true);
                    }}
                    style={[
                        styles.rowItem,
                        { backgroundColor: isActive ? "lightgrey" : "white" },
                    ]}>
                    <View style={{ height: 30, width: screen.width - 16, display: "flex", justifyContent: "space-between", flexDirection: 'row' }}>
                        <IconButton
                            style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                            icon="menu"
                        />
                        <Text style={{ flexBasis: "auto", width: screen.width - 124, flexShrink: 0, flexGrow: 1, alignSelf: "center" }}>
                            {item.name}
                        </Text>
                        <IconButton
                            style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                            icon="delete"
                            onPress={() => {
                                setOverviewToDelete(item);
                                setShowDeleteModal(true);
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    const onDragEnd = useCallback(({ data }: { data: IReorderItemProps[] }) => {
        setItems(data);

        data.forEach((item, index) => {
            execAsync(SQL_UPDATE_OVERVIEW_NUMBER(item.id, index + 1));
        });
    }, []);

    const onAddOverviewClose = useCallback(() => {
        updateAddOverviewModal({ showSummary: false, showOverview: false })(dispatch);
    }, []);

    const onAddOverviewSubmit = useCallback(async (value: INewSummaryOverview) => {
        if (overviewId === undefined) {
            return;
        }

        setIsLoading(true);
        updateAddOverviewModal({ showSummary: false, showOverview: false })(dispatch);
        await execAsync(SQL_INSERT_OVERVIEW_SECTION(overviewId, value.commentListNumber ?? null, lastNumber + 1, value.name));
        setRefreshCounter(refreshCounter + 1);
        setShowEditModal(false);
    }, [lastNumber, refreshCounter, overviewId]);

    const onCancelOverviewSectionEdit = useCallback(() => {
        updateAddOverviewModal({ showSummary: false, showOverview: false })(dispatch);
        setShowEditModal(false);
        setOverviewToEdit(undefined);
    }, []);

    const overviewToEditId = overviewToEdit?.id;
    const onOverviewSectionEdit = useCallback(async (value: INewSummaryOverview) => {
        if (overviewId === undefined) {
            return;
        }

        setIsLoading(true);
        await execAsync(SQL_UPDATE_OVERVIEW_NAME(overviewToEditId, value.name));
        if (value.commentListNumber !== undefined) {
            await execAsync(SQL_UPDATE_OVERVIEW_COMMENT_GROUP_ID(overviewToEditId, value.commentListNumber));
        }
        setRefreshCounter(refreshCounter + 1);
        setShowEditModal(false);
        setOverviewToEdit(undefined);
    }, [overviewToEditId, refreshCounter]);

    return (
        <View>
            {isLoading && <ProgressBar indeterminate={true} />}

            <View>
                <GestureHandlerRootView style={{ width: '100%' }}>
                    <DraggableFlatList
                        data={items}
                        onDragEnd={onDragEnd}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={
                            <View style={styles.footer}>
                                <Text>Note: Changes made here will only effect new inspections</Text>
                            </View>
                        }
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListFooterComponentStyle={styles.footerContainer}
                    />
                </GestureHandlerRootView>
                {showDeleteModal && overviewToDelete && overviewToDelete.id &&
                    <DeleteItemModal
                        type={`overview section (${overviewToDelete.name})`}
                        onCancel={() => {
                            setShowDeleteModal(false);
                            setOverviewToDelete(undefined);
                        }}
                        onYes={() => {
                            setRefreshCounter(refreshCounter + 1);
                            setShowDeleteModal(false);
                            setOverviewToDelete(undefined);
                            onOverviewDelete(overviewToDelete.id);
                        }}
                    />}
                {showEditModal && overviewToEdit && overviewToEdit.id &&
                    <AddEditSummaryOverviewModal
                        mode={"edit"}
                        type='overview'
                        currentGroupId={overviewToEdit.commentListNumber}
                        currentName={overviewToEdit.name}
                        onClose={onCancelOverviewSectionEdit}
                        onSubmit={onOverviewSectionEdit}
                    />
                }
                {addSummaryOverviewModalState.showOverview && (
                    <AddEditSummaryOverviewModal
                        type='overview'
                        mode={"add"}
                        onClose={onAddOverviewClose}
                        onSubmit={onAddOverviewSubmit}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    rowItem: {
        width: "100%",
        padding: 8,
        display: "flex"
    },
    footer: {
        width: "100%",
        padding: 8,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "white",
    },
    footerContainer: {
        flex: 1,
        paddingTop: 8,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
    }
});

