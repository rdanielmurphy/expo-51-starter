import * as React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import { TabView, TabBar, Route, SceneRendererProps } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import {
    SQL_GET_OPTIONS_BY_SECTION_ID, SQL_GET_SUBSECTIONS, SQL_GET_VALUES_BY_SECTION_ID, SQL_GET_VALUE_OPTIONS_BY_SECTION_ID,
    SQL_UPDATE_SUBSECTION_NAME, SQL_DELETE_VALUE_OPTION_BY_SUBSECTION_ID,
    SQL_DELETE_VALUE_BY_SUBSECTION_ID, SQL_DELETE_OPTION_BY_SUBSECTION_ID, SQL_DELETE_SUBSECTION_BY_SUBSECTION_ID, SQL_GET_SUBSECTION,
    SQL_INSERT_SUBSECTION, SQL_GET_OPTIONS, SQL_INSERT_OPTION, SQL_GET_VALUE_OPTIONS, SQL_INSERT_VALUE, SQL_GET_VALUES,
    SQL_DELETE_VALUE_OPTION_BY_SECTION_ID, SQL_DELETE_VALUE_BY_SECTION_ID, SQL_DELETE_OPTION_BY_SECTION_ID, SQL_DELETE_SUBSECTION_BY_SECTION_ID,
    SQL_DELETE_SECTION_BY_SECTION_ID, SQL_UPDATE_SECTION_NAME, SQL_INSERT_VALUE_OPTION, SQL_INSERT_SECTION, SQL_UPDATE_SECTION_TAG
} from '../../lib/sqlCommands';
import { InspectionState } from '../../redux/reducers/inspection';
import * as SQLite from 'expo-sqlite/next';
import EditableGenericSubSectionTab from './EditableGenericSubSectionTab';
import { AddItemModal, IAddItem } from '../modals/AddItemModal';
import { CopyItemModal } from '../modals/CopyItemModal';
import { DeleteItemModal } from '../modals/DeleteItemModal';
import { EditItemNameModal } from '../modals/EditItemNameModal';
import { FabState } from '../../redux/reducers/fab';
import { toggleFabAddModal, toggleFabCopyModal, toggleFabDeleteModal, toggleFabDeleteSectionModal, toggleFabEditModal, toggleFabEditSectionModal, toggleFabEditSectionTagModal, updateSubsection } from '../../redux/actions';
import { memo } from 'react';
import { primary, tertiary } from '../../lib/colors';
import { useDbContext } from '../../contexts/DbContext';
import { SectionTag } from '../shared/SectionTagDropdown';
import { EditSectionTagModal } from '../modals/EditSectionTagModal';
import { escapeString } from '../../lib/databaseDataHelper';

interface ISubsectionRoute extends Route {
    subsectionId: number
}

interface IProps {
    sectionId: number
    sectionName: string
    navigate: (path: string, params: any) => any
    refreshParent: (name?: string, id?: number) => void
}

export const EditableGenericSectionTab = memo((props: IProps) => {
    const dispatch = useDispatch();
    const { execAsync, getAllAsync, getFirstAsync, runAsync } = useDbContext();
    const layout = useWindowDimensions();
    const [ready, setReady] = React.useState<boolean>(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [index, setIndex] = React.useState(0);
    const [refreshCounter, setRefreshCounter] = React.useState(0);
    const [routes, setRoutes] = React.useState<ISubsectionRoute[]>([]);
    const [scenes, setScenes] = React.useState<any>();
    const [sceneCounter, setSceneCounter] = React.useState<any>();
    const [showLoading, setShowLoading] = React.useState<boolean>(false);
    const fabState: FabState = useSelector((state: any) => state.fabState);

    const sectionId = props.sectionId;
    const sectionName = props.sectionName;

    const handleRunAsync = React.useCallback((sql?: string, args?: any[] | undefined, refresh?: boolean, log?: boolean): Promise<SQLite.SQLiteRunResult> => {
        const runSQL = async () => {
            try {
                const result = sql ? await runAsync(sql, args, log) : undefined
                if (refresh) {
                    setShowLoading(true);
                    setRefreshCounter(refreshCounter + 1)
                }
                return result
            } catch (e) {
                setShowLoading(false);
                return {
                    rowsAffected: 0,
                    rows: {},
                } as any
            }
        }
        return runSQL();
    }, [runAsync, refreshCounter])

    const handleExecAsync = React.useCallback((sql?: string, refresh?: boolean, log?: boolean): Promise<boolean> => {
        const runSQL = async () => {
            try {
                let res = false
                if (sql) {
                    res = await execAsync(sql, log)
                    if (refresh) {
                        setShowLoading(true);
                        setRefreshCounter(refreshCounter + 1)
                    }
                }
                return res
            } catch (e) {
                setShowLoading(false);
                return false
            }
        }
        return runSQL();
    }, [runAsync, refreshCounter])

    const handleIndexChange = React.useCallback((i: number) => {
        setIndex(i);
        const route = routes[i];
        updateSubsection({ subsection_id: route.subsectionId })(dispatch);
    }, [refreshCounter, routes]);

    const getData = React.useCallback(async () => {
        try {
            const subsectionsResult = await getAllAsync(SQL_GET_SUBSECTIONS(sectionId));
            const optionsResult = await getAllAsync(SQL_GET_OPTIONS_BY_SECTION_ID(sectionId));
            const valuesResult = await getAllAsync(SQL_GET_VALUES_BY_SECTION_ID(sectionId));
            const valueOptionsResult = await getAllAsync(SQL_GET_VALUE_OPTIONS_BY_SECTION_ID(sectionId));

            const theRoutes: ISubsectionRoute[] = []
            const theScenes = {}
            subsectionsResult.sort((a, b) => a.number - b.number).forEach((r) => {
                const key = `subsection-${r.id}`
                theRoutes.push({ key: key, title: r.name, subsectionId: r.id })
                // @ts-ignore
                theScenes[key] = (
                    <EditableGenericSubSectionTab
                        sectionId={sectionId}
                        subsectionId={r.id}
                        subsectionName={r.name}
                        options={optionsResult}
                        values={valuesResult}
                        valueOptions={valueOptionsResult}
                        getAllAsync={getAllAsync}
                        getFirstAsync={getFirstAsync}
                        runAsync={handleRunAsync}
                        execAsync={handleExecAsync}
                        navigate={props.navigate}
                    />)
            })

            setScenes(theScenes);
            setRoutes(theRoutes);

            if (refreshCounter === 0 && theRoutes.length > 0) {
                const route = theRoutes[0];
                updateSubsection({ subsection_id: route.subsectionId })(dispatch);
            }

            setSceneCounter(sceneCounter + 1);
            setReady(true);
        } catch (e) {
            console.error(e);
        } finally {
            setShowLoading(false);
        }
    }, [sectionId, props.navigate, getAllAsync, getFirstAsync, handleRunAsync, handleExecAsync]);

    React.useEffect(() => {
        getData();
    }, [getData, refreshCounter, inspectionState.templateRefreshCounter]);

    const executeNameChange = React.useCallback((name: string) => {
        if (ready && inspectionState.subsection_id) {
            handleExecAsync(SQL_UPDATE_SUBSECTION_NAME(inspectionState.subsection_id, name), false);
            routes[index].title = name;
        }
        toggleFabEditModal({ editModal: false })(dispatch);
    }, [ready, inspectionState.subsection_id, refreshCounter, handleExecAsync]);

    const executeSectionNameChange = React.useCallback((name: string) => {
        if (ready && sectionId) {
            handleExecAsync(SQL_UPDATE_SECTION_NAME(sectionId, name), false);
        }
        toggleFabEditSectionModal({ editSectionModal: false })(dispatch);
        props.refreshParent(name, inspectionState.section_id);
    }, [ready, sectionId, inspectionState.section_id, handleExecAsync]);

    const executeSectionTagChange = React.useCallback((tag?: SectionTag) => {
        if (ready && sectionId) {
            handleExecAsync(SQL_UPDATE_SECTION_TAG(sectionId, tag), false);
        }
        toggleFabEditSectionTagModal({ editSectionTagModal: false })(dispatch);
    }, [ready, sectionId, inspectionState.section_id, handleExecAsync]);

    const executeDeleteSubsection = React.useCallback(() => {
        const subsectionId = inspectionState.subsection_id
        if (ready && subsectionId !== undefined) {
            handleExecAsync(SQL_DELETE_VALUE_OPTION_BY_SUBSECTION_ID(subsectionId));
            handleExecAsync(SQL_DELETE_VALUE_BY_SUBSECTION_ID(subsectionId));
            handleExecAsync(SQL_DELETE_OPTION_BY_SUBSECTION_ID(subsectionId));
            handleExecAsync(SQL_DELETE_SUBSECTION_BY_SUBSECTION_ID(subsectionId), undefined, true);
        }
        toggleFabDeleteModal({ deleteModal: false })(dispatch);
        setRefreshCounter(refreshCounter + 1);
    }, [ready, inspectionState.subsection_id, refreshCounter, handleExecAsync]);

    const executeDeleteSection = React.useCallback(() => {
        if (ready && sectionId !== undefined) {
            handleExecAsync(SQL_DELETE_VALUE_OPTION_BY_SECTION_ID(sectionId));
            handleExecAsync(SQL_DELETE_VALUE_BY_SECTION_ID(sectionId));
            handleExecAsync(SQL_DELETE_OPTION_BY_SECTION_ID(sectionId));
            handleExecAsync(SQL_DELETE_SUBSECTION_BY_SECTION_ID(sectionId));
            handleExecAsync(SQL_DELETE_SECTION_BY_SECTION_ID(sectionId));
        }
        toggleFabDeleteSectionModal({ deleteModal: false })(dispatch);
        props.refreshParent();
        setRefreshCounter(refreshCounter + 1);
    }, [ready, sectionId, sectionName, handleExecAsync, refreshCounter]);

    const executeCopy = React.useCallback(async (name: string) => {
        let voSql = "";
        let voCounter = 0;

        const subsectionId = inspectionState.subsection_id
        const subSections = await getAllAsync(SQL_GET_SUBSECTION(subsectionId!))
        for (let j = 0; j < subSections.length; j++) {
            const subsection = subSections[j];
            const subsectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SUBSECTION(name, subsection.number, subsection.subsectionIndex, subsection.script_id, subsection.section_id))
            const options = await getAllAsync(SQL_GET_OPTIONS(subsection.id))
            for (let k = 0; k < options.length; k++) {
                const option = options[k];
                const optionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_OPTION(option.name, option.number, subsection.script_id, subsection.section_id, subsectionResult.lastInsertRowId!))

                const values = await getAllAsync(SQL_GET_VALUES(option.id))
                for (let l = 0; l < values.length; l++) {
                    const value = values[l];
                    const valueResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_VALUE(value.isNa, value.number, value.commentListNumber, 
                        escapeString(value.text), value.type, 
                        '', 0, subsection.script_id, subsection.section_id, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!));

                    const value_options = await getAllAsync(SQL_GET_VALUE_OPTIONS(value.id))
                    for (let m = 0; m < value_options.length; m++) {
                        const value_option = value_options[m];
                        voCounter++;
                        voSql += `${SQL_INSERT_VALUE_OPTION(value_option.checked, value_option.number, value_option.text,
                            subsection.script_id, subsection.section_id, subsectionResult.lastInsertRowId!, optionResult.lastInsertRowId!,
                            valueResult.lastInsertRowId!, 1)};\n`;
                    }
                }
            }
        }

        if (voCounter > 0) {
            await execAsync(`
                PRAGMA journal_mode = WAL;
                ${voSql}
            `);
        }

        toggleFabCopyModal({ copyModal: false })(dispatch);
        setRefreshCounter(refreshCounter + 1);
    }, [runAsync, getAllAsync, ready, inspectionState.subsection_id, refreshCounter]);

    const executeAdd = React.useCallback(async (addItem: IAddItem) => {
        if (ready && addItem.type === "Value" && addItem.valueType !== undefined) {
            const sql = SQL_INSERT_VALUE(undefined, 1, -1, escapeString(addItem.name), addItem.valueType, "", 0, inspectionState.script_id!, inspectionState.section_id!, 
                inspectionState.subsection_id!, addItem.optionId!);
            await handleExecAsync(sql, true);
        }
        if (ready && addItem.type === "Option") {
            const sql = SQL_INSERT_OPTION(addItem.name, "1", inspectionState.script_id!, inspectionState.section_id!, inspectionState.subsection_id!);
            await handleExecAsync(sql, true);
        }
        if (ready && addItem.type === "Subsection") {
            const sql = SQL_INSERT_SUBSECTION(addItem.name, 1, 1, inspectionState.script_id!, inspectionState.section_id!);
            await handleExecAsync(sql, true);
            props.refreshParent(sectionName, inspectionState.section_id);
        }
        if (ready && addItem.type === "Section") {
            const sql = SQL_INSERT_SECTION(addItem.name, "1", 1, inspectionState.script_id!, "");
            await handleExecAsync(sql, true);
        }
        toggleFabAddModal({ addModal: false })(dispatch);
    }, [ready, inspectionState.subsection_id, inspectionState.script_id, inspectionState.section_id, handleExecAsync]);

    const renderScene = React.useCallback((props: SceneRendererProps & {
        route: ISubsectionRoute;
    }) => {
        return scenes[props.route.key];
    }, [sceneCounter, scenes]);

    return (
        !ready ? (
            <View>
                <ProgressBar indeterminate={true} />
            </View>
        ) : (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <TabView
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={handleIndexChange}
                            initialLayout={{ width: layout.width }}
                            renderTabBar={props => (
                                <TabBar
                                    {...props}
                                    scrollEnabled={true}
                                    tabStyle={{ width: layout.width / 2 }}
                                    pressColor={tertiary}
                                    indicatorStyle={{ backgroundColor: tertiary }}
                                    indicatorContainerStyle={{ backgroundColor: primary }}
                                />
                            )}
                        />
                    </View>
                    {showLoading &&
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                opacity: .5,
                            }}
                        >
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    }
                </View>
                {inspectionState.section_id === sectionId && fabState.editModal &&
                    <EditItemNameModal
                        type={'subsection'}
                        name={routes[index]?.title}
                        onClose={() => toggleFabEditModal({ editModal: false })(dispatch)}
                        onSubmit={executeNameChange}
                    />}
                {inspectionState.section_id === sectionId && fabState.editSectionModal &&
                    <EditItemNameModal
                        type={'section'}
                        name={sectionName}
                        onClose={() => toggleFabEditSectionModal({ editSectionModal: false })(dispatch)}
                        onSubmit={executeSectionNameChange}
                    />}
                {inspectionState.section_id === sectionId && fabState.editSectionTagModal &&
                    <EditSectionTagModal
                        sectionId={sectionId}
                        onClose={() => toggleFabEditSectionTagModal({ editSectionTagModal: false })(dispatch)}
                        onSubmit={executeSectionTagChange}
                    />}
                {inspectionState.section_id === sectionId && fabState.deleteModal &&
                    <DeleteItemModal
                        type={`subsection  - ${routes[index]?.title}`}
                        onCancel={() => toggleFabDeleteModal({ deleteModal: false })(dispatch)}
                        onYes={executeDeleteSubsection}
                    />}
                {inspectionState.section_id === sectionId && fabState.deleteSectionModal &&
                    <DeleteItemModal
                        type={`section  - ${sectionName}`}
                        onCancel={() => toggleFabDeleteSectionModal({ deleteModal: false })(dispatch)}
                        onYes={executeDeleteSection}
                    />}
                {inspectionState.section_id === sectionId && fabState.copyModal &&
                    <CopyItemModal
                        type="subsection"
                        onCancel={() => toggleFabCopyModal({ copyModal: false })(dispatch)}
                        onYes={executeCopy}
                    />}
                {inspectionState.section_id === sectionId && fabState.addModal &&
                    <AddItemModal
                        onClose={() => toggleFabAddModal({ addModal: false })(dispatch)}
                        sectionId={sectionId}
                        subSectionId={inspectionState.subsection_id}
                        defaultType={fabState.defaultAddOption}
                        onSubmit={executeAdd} />}
            </View>
        )
    )
}, (prevProps, nextProps) => {
    return prevProps.sectionId === nextProps.sectionId && prevProps.sectionName === nextProps.sectionName
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
