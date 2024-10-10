import React, { useCallback, useEffect, useMemo } from 'react'
import { GestureResponderEvent, View } from 'react-native';
import { toggleFabAddModal, toggleFabCopyModal, toggleFabDeleteModal, toggleFabDeleteSectionModal, toggleFabEditModal, toggleFabEditSectionModal, toggleFabEditSectionTagModal, toggleFabState, updateInspection, updateMasterScript, updateScript, updateSection, updateSnackbar, updateSubsection, updateTemplateInspection } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
    SQL_GET_OPTIONS_BY_SCRIPT_ID,
    SQL_GET_SCRIPT,
    SQL_GET_SECTIONS,
    SQL_GET_SUBSECTIONS_BY_SCRIPT_ID,
    SQL_GET_VALUES_BY_SCRIPT_ID,
    SQL_GET_VALUE_OPTIONS_BY_SCRIPT_ID,
    SQL_INSERT_OPTION,
    SQL_INSERT_SECTION,
    SQL_INSERT_SUBSECTION,
    SQL_INSERT_VALUE,
} from '../../../lib/sqlCommands';
import { FAB, Menu, Portal, ProgressBar } from 'react-native-paper';
import { copyInspectionTemplate, escapeString } from '../../../lib/databaseDataHelper';
import { FabState } from '../../../redux/reducers/fab';
import { ReorderItemsParentModal, ReorderType } from '../../modals/ReorderModals/ReorderItemsParentModal';
import { EditItemNameModal } from '../../modals/EditItemNameModal';
import InspectionNavigationDrawer, { GENERIC_EDIT_ROUTE_KEY } from '../InspectionReportEditorScreen/components/InspectionNavigationDrawer';
import AddMenu from '../InspectionReportEditorScreen/components/AddMenu';
import { useDbContext } from '../../../contexts/DbContext';
import { SectionTag } from '../../shared/SectionTagDropdown';
import { InspectionState } from '../../../redux/reducers/inspection';
import { OPTIONS_STATE_CHANGE, SUBSECTIONS_STATE_CHANGE, VALUES_STATE_CHANGE, VALUE_OPTIONS_STATE_CHANGE } from '../../../redux/constants';
import { AddItemModal, IAddItem } from '../../modals/AddItemModal';
import { CommentModal } from '../../modals/CommentModal';

interface IListItem {
    label: string,
    order: number,
    id: number,
}

export const EditTemplateScreen = ({ navigation, route }: any) => {
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [initialRoute, setInitialRoute] = React.useState<string | undefined>(undefined);
    const [initialRouteId, setInitialRouteId] = React.useState<number | string | undefined>(GENERIC_EDIT_ROUTE_KEY);
    const { execAsync, getAllAsync, getFirstAsync, runAsync, ready: dbReady } = useDbContext();
    const fabState: FabState = useSelector((state: any) => state.fabState);
    const [dynamicItems, setDynamicItems] = React.useState<IListItem[]>([]);
    const [threeDotsVisible, setThreeDotsVisible] = React.useState(false);
    const [addMenuVisible, setAddMenuVisible] = React.useState(false);
    const [threeDotsMenuAnchor, setThreeDotsMenuAnchor] = React.useState({ x: 0, y: 0 })
    const [addMenuAnchor, setAddMenuAnchor] = React.useState({ x: 0, y: 0 })
    const [refreshCounter, setRefreshCounter] = React.useState(0);
    const [lastSectionNum, setLastSectionNum] = React.useState(0);
    const [openReorderModal, setOpenReorderModal] = React.useState(false);
    const [showExportModal, setShowExportModal] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const [hideFab, setHideFab] = React.useState(false);

    const scriptId = route.params.id;

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setHideFab(false);
        });

        return unsubscribe;
    }, [navigation]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setHideFab(true);
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (!route.params.isInspection) {
            updateInspection({ script_id: route.params.id })(dispatch);
        }
        updateMasterScript({ master_script_id: route.params.id })(dispatch);
    }, [route.params.id, route.params.isInspection, dispatch]);

    const openThreeDotsMenu = useCallback(() => setThreeDotsVisible(true), []);
    const closeThreeDotsMenu = useCallback(() => setThreeDotsVisible(false), []);
    const openAddMenu = useCallback(() => setAddMenuVisible(true), []);
    const closeAddMenu = useCallback(() => setAddMenuVisible(false), []);
    const handleEditSubSectionName = React.useCallback(() => {
        toggleFabEditModal({ editModal: true })(dispatch);
    }, [])
    const handleEditSectionName = React.useCallback(() => {
        toggleFabEditSectionModal({ editSectionModal: true })(dispatch);
    }, []);
    const onEditSectionTag = useCallback(() => {
        toggleFabEditSectionTagModal({ editSectionTagModal: true })(dispatch);
    }, []);
    const handleCopySubSection = React.useCallback(() => {
        toggleFabCopyModal({ copyModal: true })(dispatch);
    }, [])
    const handleDeleteSubSection = React.useCallback(() => {
        toggleFabDeleteModal({ deleteModal: true })(dispatch);
    }, [])
    const handleDeleteSection = React.useCallback(() => {
        toggleFabDeleteSectionModal({ deleteSectionModal: true })(dispatch);
    }, [])
    const handleAddItem = React.useCallback(() => {
        toggleFabAddModal({ addModal: true, defaultAddOption: undefined })(dispatch);
    }, [])

    const updateSections = React.useCallback(async (scriptId: number) => {
        const sections = await getAllAsync(SQL_GET_SECTIONS(scriptId));
        const scriptSections = sections.map((v) => ({
            id: v.id,
            label: v.name,
            order: v.number,
        } as IListItem))
        setDynamicItems([...scriptSections].sort((a, b) => a.order - b.order));

        return scriptSections;
    }, [getAllAsync]);

    const updateSubsections = useCallback(async (scriptId: number) => {
        const subsectionsResult = await getAllAsync(SQL_GET_SUBSECTIONS_BY_SCRIPT_ID(scriptId));
        dispatch({
            type: SUBSECTIONS_STATE_CHANGE,
            currentInspection: {
                subsections: subsectionsResult,
            } as InspectionState,
            loading: true,
        });
    }, [getAllAsync]);

    const updateOptions = useCallback(async (scriptId: number) => {
        const optionsResult = await getAllAsync(SQL_GET_OPTIONS_BY_SCRIPT_ID(scriptId));
        dispatch({
            type: OPTIONS_STATE_CHANGE, currentInspection: {
                options: optionsResult,
            } as InspectionState, loading: true
        });
    }, [getAllAsync]);

    const updateValues = useCallback(async (scriptId: number) => {
        const valuesResult = await getAllAsync(SQL_GET_VALUES_BY_SCRIPT_ID(scriptId));
        dispatch({
            type: VALUES_STATE_CHANGE, currentInspection: {
                values: valuesResult,
            } as InspectionState, loading: true
        });
    }, [getAllAsync]);

    const updateValueOptions = useCallback(async (scriptId: number) => {
        const valueOptionsResult = await getAllAsync(SQL_GET_VALUE_OPTIONS_BY_SCRIPT_ID(scriptId));
        dispatch({
            type: VALUE_OPTIONS_STATE_CHANGE, currentInspection: {
                valueOptions: valueOptionsResult,
            } as InspectionState, loading: true
        });
    }, [getAllAsync]);

    const updateData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const scriptSections = await updateSections(scriptId);
            if (scriptSections.length > 0) {
                setLastSectionNum(scriptSections[scriptSections.length - 1].order);
            }
            if (refreshCounter === 0) {
                updateSection({ section_id: undefined })(dispatch);
                updateScript({ script_id: scriptId })(dispatch);
            } else {
                if (initialRouteId && typeof initialRouteId === 'number') {
                    updateSection({ section_id: initialRouteId })(dispatch);
                } else {
                    if (route.params.isInspection) {
                        updateSection({ section_id: scriptSections.length > 0 ? scriptSections[0].id : undefined })(dispatch);
                    } else {
                        setInitialRoute(undefined);
                        setInitialRouteId(GENERIC_EDIT_ROUTE_KEY);
                        updateSection({ section_id: undefined })(dispatch);
                    }
                }
            }
            await updateSubsections(scriptId);
            await updateOptions(scriptId);
            await updateValues(scriptId);
            await updateValueOptions(scriptId);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [getFirstAsync, initialRouteId, scriptId, refreshCounter, route.params.isInspection, updateSections, updateSubsections, updateOptions, updateValues, updateValueOptions]);

    useEffect(() => {
        if (dbReady) {
            updateData();
        }
    }, [dbReady, refreshCounter, updateData]);

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

    const onReorderPress = useCallback(() => {
        closeThreeDotsMenu();
        setOpenReorderModal(true);
    }, [closeThreeDotsMenu]);

    const onExport = useCallback(async (name: string) => {
        setIsLoading(true);

        try {
            await copyInspectionTemplate(execAsync, getAllAsync, runAsync, scriptId, name);
            successSnackbar("Successfully exported template");
        } catch (e) {
            failSnackbar("Failed to export template");
        } finally {
            setThreeDotsVisible(false);
            setIsLoading(false);
        }
    }, [execAsync, getAllAsync, runAsync, scriptId]);

    const onExportPress = useCallback(() => {
        closeThreeDotsMenu();
        setShowExportModal(true);
    }, [closeThreeDotsMenu]);

    const onEditModePress = useCallback(() => {
        closeThreeDotsMenu();
        setEditMode(true);
    }, [closeThreeDotsMenu]);

    const onEndEditModePress = useCallback(() => {
        closeThreeDotsMenu();
        setEditMode(false);
    }, [closeThreeDotsMenu]);

    const onExit = useCallback(() => {
        setEditMode(false);
        navigation.navigate("InspectionTemplates");
    }, [navigation.navigate]);

    const onFinishedEditing = useCallback(() => {
        updateTemplateInspection({
            templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
        })(dispatch);
        setThreeDotsVisible(false);
        route.params.isInspection && route.params.inspectionId ?
            navigation.navigate("EditInspectionReport", { id: route.params.inspectionId }) : navigation.navigate("Main");
    }, [navigation.navigate, route.params.isInspection, inspectionState.templateRefreshCounter, route.params.inspectionId]);

    useEffect(() => {
        if (route.params.isInspection) {
            setEditMode(true);
        }
    }, [route.params.isInspection]);

    const ThreeDotMenu = useMemo(() => {
        if (route.params.isInspection) {
            return (
                <Menu
                    visible={threeDotsVisible}
                    onDismiss={closeThreeDotsMenu}
                    anchor={threeDotsMenuAnchor}>
                    <Menu.Item
                        onPress={onReorderPress}
                        title="Reorder"
                    />
                    <Menu.Item
                        onPress={onExportPress}
                        title="Export Template"
                    />
                    <Menu.Item
                        onPress={onFinishedEditing}
                        title="Finish Editing"
                    />
                </Menu>
            )
        }

        return editMode ? (
            <Menu
                visible={threeDotsVisible}
                onDismiss={closeThreeDotsMenu}
                anchor={threeDotsMenuAnchor}>
                <Menu.Item
                    onPress={onReorderPress}
                    title="Reorder"
                />
                <Menu.Item
                    onPress={onExportPress}
                    title="Export Template"
                />
                <Menu.Item
                    onPress={onEndEditModePress}
                    title="Stop Edit Template"
                />
                <Menu.Item
                    onPress={onExit}
                    title="Exit"
                />
            </Menu>
        ) : (
            <Menu
                visible={threeDotsVisible}
                onDismiss={closeThreeDotsMenu}
                anchor={threeDotsMenuAnchor}>
                <Menu.Item
                    onPress={onReorderPress}
                    title="Reorder"
                />
                <Menu.Item
                    onPress={onExportPress}
                    title="Export Template"
                />
                <Menu.Item
                    onPress={onEditModePress}
                    title="Start Edit Template"
                />
                <Menu.Item
                    onPress={onExit}
                    title="Exit"
                />
            </Menu>
        )
    }, [threeDotsMenuAnchor, threeDotsVisible, route.params.inspectionId, route.params.isInspection, editMode]);

    const refreshData = useCallback((routeName?: null | string, routeId?: number) => {
        if (routeName) {
            setInitialRoute(routeName);
        } else {
            setInitialRoute(undefined);
        }
        if (routeId) {
            setInitialRouteId(routeId);
        } else {
            setInitialRouteId(undefined);
        }
        setRefreshCounter(refreshCounter + 1);
    }, [refreshCounter])

    const handleAddSection = useCallback(async (name: string, tag?: SectionTag) => {
        const newId = lastSectionNum + 1;
        const result = await runAsync(SQL_INSERT_SECTION(name, `${newId}`, 0, route.params.id, tag));
        refreshData(name, result.lastInsertRowId);
    }, [dispatch, lastSectionNum, refreshCounter, route.params.id, refreshData, updateSection])

    const handleAddSectionFromTemplate = useCallback((name: null | string, sectionId: number) => {
        refreshData(name, sectionId);
    }, [dispatch, refreshData, updateSection]);

    const onExportModalClose = useCallback(() => {
        setShowExportModal(false);
    }, []);

    const onExportModalSubmit = useCallback((name: string) => {
        onExport(name);
        setShowExportModal(false);
    }, [onExport]);

    const onReoderModalClose = useCallback(() => {
        setOpenReorderModal(false);
    }, []);

    const onReorderModalSubmit = useCallback(async (type: ReorderType) => {
        try {
            setIsLoading(true);
            await updateSections(scriptId);
            setOpenReorderModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [scriptId, refreshCounter]);

    const onShapeCirclePlusPress = useCallback((event: GestureResponderEvent) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setAddMenuAnchor(anchor);
        openAddMenu();
    }, []);

    const onDotsVerticalPress = useCallback((event: GestureResponderEvent) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setThreeDotsMenuAnchor(anchor);
        openThreeDotsMenu();
    }, []);

    const executeAdd = React.useCallback(async (addItem: IAddItem) => {
        if (addItem.type === "Value" && addItem.valueType !== undefined) {
            const sql = SQL_INSERT_VALUE(undefined, 1, -1, escapeString(addItem.name), addItem.valueType, '', 0,
                inspectionState.script_id!, inspectionState.section_id!, inspectionState.subsection_id!,
                addItem.optionId!);
            await execAsync(sql);
            await updateValues(inspectionState.script_id!);
        }
        if (addItem.type === "Option") {
            const sql = SQL_INSERT_OPTION(addItem.name, "1", inspectionState.script_id!, inspectionState.section_id!, inspectionState.subsection_id!);
            await execAsync(sql);
            await updateOptions(inspectionState.script_id!);
        }
        if (addItem.type === "Subsection") {
            const sql = SQL_INSERT_SUBSECTION(addItem.name, 1, 1, inspectionState.script_id!, inspectionState.section_id!);
            const res = await runAsync(sql);
            updateSubsections(inspectionState.script_id!);
            updateSubsection({ subsection_id: res.lastInsertRowId })(dispatch);
        }
        toggleFabAddModal({ addModal: false })(dispatch);
        updateTemplateInspection({
            templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
        })(dispatch);
    }, [inspectionState.subsection_id, inspectionState.script_id, inspectionState.section_id, inspectionState.templateRefreshCounter,
        execAsync, runAsync, updateOptions, updateSubsections, updateValues]);

    return (
        <>
            {!isLoading ? (
                <>
                    <InspectionNavigationDrawer
                        drawerItems={{
                            dynamicItems,
                            hash: dynamicItems.map((v) => v.id + ";" + v.label).join(";")
                        }}
                        initialRoute={initialRoute}
                        onDotsVerticalPress={onDotsVerticalPress}
                        onShapeCirclePlusPress={onShapeCirclePlusPress}
                        onRefreshData={refreshData}
                        editMode={editMode}
                        templateMode={!route.params.isInspection}
                    />
                    <Portal>
                        {inspectionState.section_id !== undefined && !hideFab && editMode && (
                            <FAB.Group
                                open={!!fabState.open}
                                icon={fabState.open ? 'close' : 'note-edit'}
                                actions={[
                                    { icon: 'plus', size: 'medium', label: 'Add item', onPress: handleAddItem },
                                    { icon: 'pencil', size: 'medium', label: 'Edit subsection name', onPress: handleEditSubSectionName },
                                    { icon: 'pencil-outline', size: 'medium', label: 'Edit section name', onPress: handleEditSectionName },
                                    { icon: 'tag', size: 'medium', label: 'Edit section tag', onPress: onEditSectionTag },
                                    { icon: 'content-copy', size: 'medium', label: 'Copy subsection', onPress: handleCopySubSection },
                                    { icon: 'delete', size: 'medium', label: 'Delete subsection', onPress: handleDeleteSubSection },
                                    { icon: 'delete-outline', size: 'medium', label: 'Delete section', onPress: handleDeleteSection },
                                ]}
                                onStateChange={({ open }: { open: boolean }) => toggleFabState({ open })(dispatch)}
                                visible
                            />
                        )}
                    </Portal>
                    <AddMenu
                        anchor={addMenuAnchor}
                        visible={addMenuVisible}
                        onAddNewSection={handleAddSection}
                        onAddedSectionFromTemplate={handleAddSectionFromTemplate}
                        onDimiss={closeAddMenu}
                        onAddSubsection={(subSectionId?: number | undefined) => {
                            setTimeout(() => {
                                updateSubsection({ subsection_id: subSectionId })(dispatch);
                            }, 500)
                        }} />
                    {ThreeDotMenu}
                </>
            ) : (
                <View>
                    <ProgressBar indeterminate={true} />
                </View>
            )}
            {openReorderModal && scriptId && (
                <ReorderItemsParentModal
                    scriptId={scriptId}
                    onClose={onReoderModalClose}
                    onSave={onReorderModalSubmit}
                    disabled={false}
                />
            )}
            <CommentModal />
            {showExportModal &&
                <EditItemNameModal
                    type={'template'}
                    name={"New Template"}
                    onClose={onExportModalClose}
                    disabled={isLoading}
                    onSubmit={onExportModalSubmit}
                />}
            {fabState.addModal && inspectionState.section_id &&
                <AddItemModal
                    onClose={() => toggleFabAddModal({ addModal: false })(dispatch)}
                    sectionId={inspectionState.section_id}
                    subSectionId={inspectionState.subsection_id}
                    defaultType={fabState.defaultAddOption}
                    noMultiCheckbox
                    onSubmit={executeAdd} />}
        </>
    )
}
