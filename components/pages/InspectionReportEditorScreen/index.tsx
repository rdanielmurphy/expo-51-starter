import React, { useCallback, useEffect, useMemo } from 'react'
import { Dimensions, GestureResponderEvent, StyleSheet, View } from 'react-native';
import { toggleFabAddModal, updateCopyValueModal, updateInspection, updateInspectionValue, updateMasterScript, updatePhotos, updateScript, updateSection, updateSubsection, updateTemplateInspection } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import * as SQLite from 'expo-sqlite/next';
import { SQL_GET_INSPECTION, SQL_GET_OPTIONS_BY_SCRIPT_ID, SQL_GET_PHOTOTS_BY_INSPECTION_ID, SQL_GET_SCRIPT, SQL_GET_SECTIONS, SQL_GET_SUBSECTIONS_BY_SCRIPT_ID, SQL_GET_VALUES_BY_SCRIPT_ID, SQL_GET_VALUE_OPTIONS_BY_SCRIPT_ID, SQL_INSERT_OPTION, SQL_INSERT_SECTION, SQL_INSERT_SUBSECTION, SQL_INSERT_VALUE, SQL_INSERT_VALUE_OPTION } from '../../../lib/sqlCommands';
import { ActivityIndicator, Menu, ProgressBar } from 'react-native-paper';
import { AddPhotoModal } from '../../modals/AddPhotoModal';
import { photoRowsToObjects } from '../../../lib/photosHelper';
import { CreateDocumentsModal } from '../../modals/CreateDocumentsModal';
import { CommentModal } from '../../modals/CommentModal';
import { ReorderItemsParentModal, ReorderType } from '../../modals/ReorderModals/ReorderItemsParentModal';
import { CopyToSummaryModalContainer } from '../../modals/CopyToSummaryModal';
import { OPTIONS_STATE_CHANGE, SECTIONS_STATE_CHANGE, SUBSECTIONS_STATE_CHANGE, VALUES_STATE_CHANGE, VALUE_OPTIONS_STATE_CHANGE } from '../../../redux/constants';
import { InspectionState } from '../../../redux/reducers/inspection';
import { HighlightModal } from '../../modals/HighlightModal';
import { CopyItemModal } from '../../modals/CopyItemModal';
import { AddItemToInspectionState } from '../../../redux/reducers/addItemToInspectionModals';
import InspectionNavigationDrawer, { IListItem } from './components/InspectionNavigationDrawer';
import AddMenu from './components/AddMenu';
import { AddItemModal, IAddItem } from '../../modals/AddItemModal';
import { FabState } from '../../../redux/reducers/fab';
import { useDbContext } from '../../../contexts/DbContext';
import { SectionTag } from '../../shared/SectionTagDropdown';
import { PreInspectionAgreementModal } from '../../modals/PreInspectionAgreementModal';
import { escapeString } from '../../../lib/databaseDataHelper';

export const InspectionReportEditorScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
    const { execAsync, getAllAsync, getFirstAsync, runAsync, ready: dbReady } = useDbContext();
    const [dynamicItems, setDynamicItems] = React.useState<IListItem[]>([]);
    const [visible, setVisible] = React.useState(false);
    const [scriptId, setScriptId] = React.useState<number | undefined>(undefined);
    const [openDocumentsModal, setOpenDocumentsModal] = React.useState(false);
    const [openReorderModal, setOpenReorderModal] = React.useState(false);
    const [openPreInspectionModal, setOpenPreInspectionModal] = React.useState(false);
    const [menuAnchor, setMenuAnchor] = React.useState({ x: 0, y: 0 });
    const [addMenuAnchor, setAddMenuAnchor] = React.useState({ x: 0, y: 0 });
    const [addMenuVisible, setAddMenuVisible] = React.useState(false);
    const [lastSectionNum, setLastSectionNum] = React.useState(0);
    const [initialRoute, setInitialRoute] = React.useState("Details");

    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const fabState: FabState = useSelector((state: any) => state.fabState);
    const addItemToInspectionModalState: AddItemToInspectionState = useSelector((state: any) => state.addItemToInspectionModalState);
    const screen = Dimensions.get("screen");

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const updateSections = useCallback(async (scriptId: number) => {
        const sectionArray = await getAllAsync(SQL_GET_SECTIONS(scriptId));
        const scriptSections = sectionArray.sort((a, b) => a.number - b.number).map((v) => ({
            id: v.id,
            label: v.name,
            order: v.number,
        } as IListItem));
        setDynamicItems([...scriptSections]);
        if (scriptSections.length > 0) {
            setLastSectionNum(scriptSections[scriptSections.length - 1].order);
        }
        dispatch({
            type: SECTIONS_STATE_CHANGE,
            currentInspection: {
                sections: sectionArray,
            } as InspectionState,
            loading: true,
        });
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

    useEffect(() => {
        const getData = async (inspectionId: number) => {
            try {
                setIsLoading(true);
                const inspection = await getFirstAsync(SQL_GET_INSPECTION(inspectionId));
                const theScriptId = inspection.scriptId;
                setScriptId(theScriptId);
                const script = await getFirstAsync(SQL_GET_SCRIPT(theScriptId));
                const theMasterScriptId = script.originalScriptId;
                updateMasterScript({ master_script_id: theMasterScriptId })(dispatch);
                await updateSections(theScriptId);
                const newPhotos = await getAllAsync(SQL_GET_PHOTOTS_BY_INSPECTION_ID(inspectionId));
                updatePhotos({ photos: photoRowsToObjects(newPhotos) })(dispatch);
                updateScript({ script_id: theScriptId })(dispatch);
                await updateSubsections(theScriptId);
                await updateOptions(theScriptId);
                await updateValues(theScriptId);
                await updateValueOptions(theScriptId);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }

        if (dbReady) {
            const inspectionId = route.params.id;
            updateInspection({ id: inspectionId })(dispatch);

            getData(inspectionId);
        }
    }, [dbReady, route.params.id, inspectionState.templateRefreshCounter, getFirstAsync, getFirstAsync]);

    const executeCopy = useCallback(async (newName: string): Promise<void> => {
        updateCopyValueModal({ copyModal: false })(dispatch);

        setIsUpdating(true);
        try {
            const value = inspectionState.values?.find((v) => v.id === addItemToInspectionModalState.copyId);
            if (value) {
                const valueResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, 
                    escapeString(newName), value.type, value.userText ? escapeString(value.userText) : "", value.checked ?? 0,
                    value.script_id, value.section_id, value.subsection_id, value.option_id, value.isHighlighted, value.highLightColor));
                if (value.type === 5) {
                    const valueOptions = inspectionState.valueOptions?.filter((v) => v.value_id === addItemToInspectionModalState.copyId);
                    if (valueOptions) {
                        for (let i = 0; i < valueOptions.length; i++) {
                            const valueOption = valueOptions[i];
                            await execAsync(SQL_INSERT_VALUE_OPTION(valueOption.checked, valueOption.number, valueOption.text, valueOption.script_id,
                                valueOption.section_id, valueOption.subsection_id, valueOption.option_id, valueResult.lastInsertRowId!, 1));
                        }
                    }
                }
                if (scriptId) {
                    await updateValues(scriptId);
                    if (value.type === 5) {
                        await updateValueOptions(scriptId);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    }, [addItemToInspectionModalState.copyId, scriptId, execAsync, runAsync, inspectionState.templateRefreshCounter, updateValues, updateValueOptions]);

    const onCopyCancel = useCallback(() => {
        updateCopyValueModal({ copyModal: false })(dispatch);
    }, [dispatch]);

    const executeHighlight = useCallback(async (id: number, color: number): Promise<void> => {
        const value = inspectionState.values?.find((v) => v.id === id);
        if (value) {
            value.isHighlighted = 1;
            value.highLightColor = color;
            updateInspectionValue({
                updatedValue: value,
            })(dispatch);
        }
    }, [inspectionState.valuesRefreshCounter, scriptId]);

    const createDocumentsPress = useCallback(() => {
        setVisible(false);
        setOpenDocumentsModal(true);
    }, []);

    const reorderItemsPress = useCallback(() => {
        setVisible(false);
        setOpenReorderModal(true);
    }, []);

    const editTemplatePress = useCallback(() => {
        setVisible(false);
        if (scriptId) {
            navigation.navigate("EditTemplate", { id: scriptId, inspectionId: route.params.id, isInspection: true });
        }
    }, [route.params.id, scriptId]);

    const exitPress = useCallback(() => {
        updateSection({ section_id: undefined })(dispatch);
        setVisible(false);
        navigation.navigate("Main");
    }, [dispatch]);

    const openAddMenu = useCallback(() => setAddMenuVisible(true), []);
    const closeAddMenu = useCallback(() => setAddMenuVisible(false), []);

    const onDotsVerticalPress = useCallback((event: any) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setMenuAnchor(anchor);
        openMenu();
    }, []);

    const onShapeCirclePlusPress = useCallback((event: GestureResponderEvent) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setAddMenuAnchor(anchor);
        openAddMenu();
    }, [openAddMenu]);

    const handleAddSection = useCallback(async (name: string, tag?: SectionTag) => {
        if (scriptId) {
            const res = await runAsync(SQL_INSERT_SECTION(name, `${lastSectionNum + 1}`, 0, scriptId, tag));
            setInitialRoute(name);
            updateTemplateInspection({
                templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
            })(dispatch);
            updateSection({ section_id: res.lastInsertRowId })(dispatch);
        }
    }, [lastSectionNum, inspectionState.templateRefreshCounter, scriptId, runAsync]);

    const handleAddSectionFromTemplate = useCallback(async (name: null | string, id: number) => {
        if (name) {
            setInitialRoute(name);
        }
        updateTemplateInspection({
            templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
        })(dispatch);
        updateSection({ section_id: id })(dispatch);
    }, [inspectionState.templateRefreshCounter]);

    const handleAddSubsection = useCallback(async (subSectionId?: number) => {
        if (scriptId) {
            setIsUpdating(true);
            await updateOptions(scriptId);
            await updateValues(scriptId);
            await updateValueOptions(scriptId);
            if (subSectionId) {
                setTimeout(() => {
                    updateSubsection({ subsection_id: subSectionId })(dispatch);
                }, 200);
            }
            setIsUpdating(false);
        }
    }, [inspectionState.templateRefreshCounter, scriptId, runAsync]);

    const onReorderCancel = useCallback(() => {
        setOpenReorderModal(false);
    }, []);

    const onReorderSubmit = useCallback(async (type: ReorderType) => {
        if (!scriptId) return;

        try {
            setIsUpdating(true);
            if (type === ReorderType.Sections) {
                await updateSections(scriptId);
            } else if (type === ReorderType.Subsections) {
                await updateSubsections(scriptId);
            } else if (type === ReorderType.Options) {
                await updateOptions(scriptId);
            } else if (type === ReorderType.Values) {
                await updateValues(scriptId);
            }
            setOpenReorderModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    }, [scriptId]);

    const InspectionMenu = useMemo(() => (
        <>
            <Menu.Item onPress={createDocumentsPress} title="Create Documents" />
            <Menu.Item onPress={reorderItemsPress} title="Reorder Items" />
            <Menu.Item onPress={editTemplatePress} title="Edit template" />
            <Menu.Item onPress={exitPress} title="Exit" />
        </>
    ), [createDocumentsPress, editTemplatePress, exitPress, reorderItemsPress]);

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
    }, [inspectionState.subsection_id, inspectionState.script_id, inspectionState.section_id, execAsync, runAsync, updateOptions, updateSubsections, updateValues]);

    const closeCreateDocumentsModal = useCallback((openPreInspectionModal?: boolean) => {
        setOpenDocumentsModal(false);

        if (openPreInspectionModal) {
            setOpenPreInspectionModal(true);
        }
    }, []);

    return (
        <>
            <InspectionNavigationDrawer
                drawerItems={isLoading ? {
                    dynamicItems: [],
                    hash: "",
                } : {
                    dynamicItems,
                    hash: dynamicItems.map((v) => v.id + ";" + v.label).join(";")
                }}
                editMode={false}
                initialRoute={initialRoute}
                onDotsVerticalPress={onDotsVerticalPress}
                onShapeCirclePlusPress={onShapeCirclePlusPress} />
            {isLoading && (
                <View>
                    <ProgressBar indeterminate={true} />
                </View>
            )}
            <AddPhotoModal />
            <CommentModal />
            <CopyToSummaryModalContainer />
            <AddMenu
                anchor={addMenuAnchor}
                visible={addMenuVisible}
                onAddNewSection={handleAddSection}
                onAddedSectionFromTemplate={handleAddSectionFromTemplate}
                onAddSubsection={handleAddSubsection}
                onDimiss={closeAddMenu} />
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={menuAnchor}>
                {InspectionMenu}
            </Menu>
            {openDocumentsModal && <CreateDocumentsModal inspectionId={route.params.id} onClose={closeCreateDocumentsModal} />}
            {openPreInspectionModal && <PreInspectionAgreementModal inspectionId={route.params.id} onClose={() => setOpenPreInspectionModal(false)} />}
            {
                openReorderModal && scriptId && (
                    <ReorderItemsParentModal
                        scriptId={scriptId}
                        disabled={isUpdating}
                        onClose={onReorderCancel}
                        onSave={onReorderSubmit}
                    />
                )
            }
            <HighlightModal onSave={executeHighlight} />
            {addItemToInspectionModalState.copyModal &&
                <CopyItemModal
                    type="value"
                    onCancel={onCopyCancel}
                    onYes={executeCopy}
                />}
            {fabState.addModal && inspectionState.section_id &&
                <AddItemModal
                    onClose={() => toggleFabAddModal({ addModal: false })(dispatch)}
                    sectionId={inspectionState.section_id}
                    subSectionId={inspectionState.subsection_id}
                    defaultType={fabState.defaultAddOption}
                    noMultiCheckbox
                    onSubmit={executeAdd} />}
            {isUpdating && (
                <View style={{ height: screen.height, width: screen.width, position: 'absolute', backgroundColor: '#000000AA' }}>
                    <View style={styles.container}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                </View>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
