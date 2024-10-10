import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, ProgressBar } from 'react-native-paper';
import {
    SQL_DELETE_SUMMARY_SECTION, SQL_DELETE_SUMMARY_SUBSECTION_BY_SECTION_ID, SQL_GET_MASTER_SUMMARY_SECTION,
    SQL_GET_SUMMARY_SECTION, SQL_UPDATE_SUMMARY_NUMBER, SQL_UPDATE_SUMMARY_NAME, SQL_INSERT_SUMMARY_SECTION, SQL_UPDATE_SUMMARY_COMMENT_GROUP_ID
} from '../../lib/sqlCommands';
import { updateAddSummaryModal, updateSnackbar } from '../../redux/actions';
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

export const EditSummaryScreenHeader = (props: any) => {
    const dispatch = useDispatch();

    const onAddPress = useCallback(() => {
        updateAddSummaryModal({ showOverview: false, showSummary: true })(dispatch);
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

export const EditSummaryScreen = () => {
    const { ready, execAsync, getFirstAsync, getAllAsync } = useDbContext();
    const dispatch = useDispatch();
    const addSummaryModalState: AddSummaryOverviewModalState = useSelector((state: any) => state.addSummaryOverviewModalState);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>();
    const [showEditModal, setShowEditModal] = useState<boolean>();
    const [summaryToDelete, setSummaryToDelete] = useState<any>();
    const [summaryToEdit, setSummaryToEdit] = useState<any>();
    const [refreshCounter, setRefreshCounter] = useState<number>(1);
    const [summaryId, setSummaryId] = useState<number>();
    const [lastNumber, setLastNumber] = useState<number>(1);

    const [items, setItems] = useState<IReorderItemProps[]>([]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                const summaryMasterResult = await getFirstAsync(SQL_GET_MASTER_SUMMARY_SECTION);
                const id = summaryMasterResult.id;
                setSummaryId(id);
                const summaryResults = await getAllAsync(SQL_GET_SUMMARY_SECTION(id));
                const summaryItems = summaryResults.filter((item: any) => item.type === 0)
                    .sort((a: any, b: any) => a.number - b.number);
                setItems(summaryItems.map((item: any) => ({ id: item.id, name: item.name, commentListNumber: item.commentListNumber })));
                setLastNumber(summaryItems[summaryItems.length - 1].number)
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to get summary', err)
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

    const onSummaryDelete = useCallback(
        (summarySectionId: number) => {
            const deleteInspectionTemplate = async () => {
                setIsLoading(true);

                try {
                    await execAsync(SQL_DELETE_SUMMARY_SECTION(summarySectionId));
                    await execAsync(SQL_DELETE_SUMMARY_SUBSECTION_BY_SECTION_ID(summarySectionId));

                    successSnackbar("Successfully deleted summary subsection");
                } catch (e) {
                    failSnackbar("Failed to delete summary subsection");
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
                        setSummaryToEdit(item);
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
                                setSummaryToDelete(item);
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
            execAsync(SQL_UPDATE_SUMMARY_NUMBER(item.id, index + 1));
        });
    }, []);

    const onAddSummaryClose = useCallback(() => {
        updateAddSummaryModal({ showSummary: false, showOverview: false })(dispatch);
    }, []);

    const onAddSummarySubmit = useCallback(async (value: INewSummaryOverview) => {
        if (summaryId === undefined) {
            return;
        }

        setIsLoading(true);
        updateAddSummaryModal({ showSummary: false, showOverview: false })(dispatch);
        await execAsync(SQL_INSERT_SUMMARY_SECTION(summaryId, value.commentListNumber ?? null, lastNumber + 1, value.name, '', 0));
        setRefreshCounter(refreshCounter + 1);
        setShowEditModal(false);
    }, [lastNumber, refreshCounter, summaryId]);

    const onCancelSummarySectionEdit = useCallback(() => {
        updateAddSummaryModal({ showSummary: false, showOverview: false })(dispatch);
        setShowEditModal(false);
        setSummaryToEdit(undefined);
    }, []);

    const summaryToEditId = summaryToEdit?.id;
    const onSummarySectionEdit = useCallback(async (value: INewSummaryOverview) => {
        if (summaryId === undefined) {
            return;
        }

        setIsLoading(true);
        await execAsync(SQL_UPDATE_SUMMARY_NAME(summaryToEditId, value.name));
        if (value.commentListNumber !== undefined) {
            await execAsync(SQL_UPDATE_SUMMARY_COMMENT_GROUP_ID(summaryToEditId, value.commentListNumber));
        }
        setRefreshCounter(refreshCounter + 1);
        setShowEditModal(false);
        setSummaryToEdit(undefined);
    }, [summaryToEditId, refreshCounter]);

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
                {showDeleteModal && summaryToDelete && summaryToDelete.id &&
                    <DeleteItemModal
                        type={`summary section (${summaryToDelete.name})`}
                        onCancel={() => {
                            setShowDeleteModal(false);
                            setSummaryToDelete(undefined);
                        }}
                        onYes={() => {
                            setRefreshCounter(refreshCounter + 1);
                            setShowDeleteModal(false);
                            setSummaryToDelete(undefined);
                            onSummaryDelete(summaryToDelete.id);
                        }}
                    />}
                {showEditModal && summaryToEdit && summaryToEdit.id &&
                    <AddEditSummaryOverviewModal
                        mode={"edit"}
                        type='summary'
                        currentGroupId={summaryToEdit.commentListNumber}
                        currentName={summaryToEdit.name}
                        onClose={onCancelSummarySectionEdit}
                        onSubmit={onSummarySectionEdit}
                    />
                }
                {addSummaryModalState.showSummary && (
                    <AddEditSummaryOverviewModal
                        type='summary'
                        mode={"add"}
                        onClose={onAddSummaryClose}
                        onSubmit={onAddSummarySubmit}
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
