import { memo, useCallback, useState } from "react";
import { Menu } from "react-native-paper";
import { AddSectionModal } from "../../../../modals/AddSectionModals/AddSectionModal";
import { toggleFabAddModal } from "../../../../../redux/actions";
import { OPTION, SUBSECTION, VALUE } from "../../../../modals/AddItemModal";
import { useDispatch, useSelector } from "react-redux";
import { SectionTag } from "../../../../shared/SectionTagDropdown";
import { AddSectionSelectionModal } from "../../../../modals/AddSectionModals/AddSectionSelectionModal";
import { useSections } from "../../../../../hooks/useSections";
import { InspectionState } from "../../../../../redux/reducers/inspection";
import { AddSubsectionSelectionModal } from "../../../../modals/AddSubsectionModals/AddSubsectionSelectionModal";
import { SUBSECTIONS_STATE_CHANGE } from "../../../../../redux/constants";

const AddMenu = memo((
    {
        anchor,
        visible,
        onAddNewSection,
        onAddedSectionFromTemplate,
        onAddSubsection,
        onDimiss,
    }:
        {
            anchor: React.ReactNode | {
                x: number;
                y: number;
            },
            visible: boolean,
            onAddNewSection: (name: string, tag?: SectionTag) => void,
            onAddedSectionFromTemplate: (name: null | string, id: number) => void,
            onAddSubsection: (subSectionId?: number) => void,
            onDimiss: () => void
        }) => {
    const [addSectionModalVisible, setAddSectionModalVisible] = useState(false);
    const [addSubsectionSelectionModalVisible, setAddSubsectionSelectionModalVisible] = useState(false);
    const [addSectionSelectionModalVisible, setAddSectionSelectionModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const dispatch = useDispatch();
    const { addSection, getSections, getSubsections, addSubsection } = useSections();

    const handleAddOption = useCallback(() => {
        toggleFabAddModal({ addModal: true, defaultAddOption: OPTION })(dispatch);
    }, [dispatch])
    const handleAddSubSection = useCallback(() => {
        toggleFabAddModal({ addModal: true, defaultAddOption: SUBSECTION })(dispatch);
    }, [dispatch])
    const handleAddValue = useCallback(() => {
        toggleFabAddModal({ addModal: true, defaultAddOption: VALUE })(dispatch);
    }, [dispatch])

    const onAddSectionMenuPress = useCallback(() => {
        onDimiss()
        setAddSectionSelectionModalVisible(true)
    }, [onDimiss]);
    const onAddSubSectionMenuPress = useCallback(() => {
        onDimiss()
        setAddSubsectionSelectionModalVisible(true)
    }, [onDimiss, handleAddSubSection]);
    const onAddOptionMenuPress = useCallback(() => {
        onDimiss()
        handleAddOption()
    }, [onDimiss, handleAddOption]);
    const onAddValueMenuPress = useCallback(() => {
        onDimiss()
        handleAddValue()
    }, [onDimiss, handleAddValue]);

    const onAddSectionsFromTemplate = useCallback(async (sectionIds: number[]) => {
        setLoading(true);
        let firstSectionId = -1;
        let firstSectionName = null;

        try {
            const sections = await getSections(inspectionState.script_id!);
            const masterSections = await getSections(inspectionState.master_script_id!);
            for (let i = 0; i < sectionIds.length; i++) {
                const section = masterSections.find(s => s.id === sectionIds[i]);
                const regexString = `${section?.name}( \d)?`;
                const count = sections.filter(s => s.name.match(regexString) !== null).length;
                if (section) {
                    const newSection = await addSection(inspectionState.script_id!, section, count + 1);
                    if (firstSectionId === -1) {
                        firstSectionId = newSection.id;
                    }
                    if (firstSectionName === null) {
                        firstSectionName = newSection.name;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            onAddedSectionFromTemplate(firstSectionName, firstSectionId);
            setLoading(false);
            onDimiss();
            setAddSectionSelectionModalVisible(false);
        }
    }, [onDimiss, addSection, inspectionState.script_id, getSections, onAddedSectionFromTemplate]);
    const onAddSectionSave = useCallback((name: string, tag?: SectionTag) => {
        onAddNewSection(name, tag);
        onDimiss();
        setAddSectionModalVisible(false);
    }, [onDimiss, onAddNewSection]);
    const onAddSectionCancel = useCallback(() => {
        onDimiss();
        setAddSectionModalVisible(false);
    }, [onDimiss]);
    const onAddSectionSelectionCancel = useCallback(() => {
        onDimiss();
        setAddSectionSelectionModalVisible(false);
    }, [onDimiss]);
    const onPressAddFreshSection = useCallback(() => {
        onDimiss();
        setAddSectionSelectionModalVisible(false);
        setAddSectionModalVisible(true);
    }, [onDimiss]);

    const onAddSubsectionsFromTemplate = useCallback(async (subsectionIds: number[]) => {
        try {
            setLoading(true);
            const subSections = await getSubsections(inspectionState.script_id!);
            const masterSubsections = await getSubsections(inspectionState.master_script_id!);
            let lastNumber = subSections.map(s => s.number).sort((a, b) => b - a)[0] || 0;
            const newSubsections = [...subSections];
            let newSubsectionId = undefined;
            for (let i = 0; i < subsectionIds.length; i++) {
                const masterSubsection = masterSubsections.find(s => s.id === subsectionIds[i]);
                const regexString = `${masterSubsection?.name} \\d+`;
                const count = subSections.filter(s => s.name.match(regexString) !== null).length;
                if (masterSubsection && inspectionState.section_id) {
                    const newSubsection = await addSubsection(inspectionState.script_id!, inspectionState.section_id,
                        masterSubsection, lastNumber, count);
                    newSubsections.push(newSubsection);
                    if (newSubsectionId === undefined) {
                        newSubsectionId = newSubsection.id;
                    }
                    lastNumber++;
                }
            }
            dispatch({
                type: SUBSECTIONS_STATE_CHANGE,
                currentInspection: {
                    subsections: newSubsections,
                } as InspectionState,
                loading: true,
            });
            onAddSubsection(newSubsectionId);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            onDimiss();
            setAddSubsectionSelectionModalVisible(false);
        }
    }, [onDimiss, addSection, inspectionState.script_id, getSections, inspectionState.section_id]);
    const onAddSubsectionSelectionCancel = useCallback(() => {
        setAddSubsectionSelectionModalVisible(false);
    }, [onDimiss]);
    const onPressAddFreshSubsection = useCallback(() => {
        setAddSubsectionSelectionModalVisible(false)
        handleAddSubSection();
    }, [handleAddSubSection]);

    const isOnASection = inspectionState.section_id && inspectionState.section_id >= 0;

    return (
        <>
            <Menu
                visible={visible}
                onDismiss={onDimiss}
                anchor={anchor}>
                <Menu.Item onPress={onAddSectionMenuPress} title="Add Section" />
                {isOnASection && <Menu.Item onPress={onAddSubSectionMenuPress} title="Add Subsection" />}
                {isOnASection && <Menu.Item onPress={onAddOptionMenuPress} title="Add Option" />}
                {isOnASection && <Menu.Item onPress={onAddValueMenuPress} title="Add Value" />}
            </Menu>
            {addSectionModalVisible && <AddSectionModal
                onClose={onAddSectionCancel}
                onSave={onAddSectionSave}
                loading={loading}
            />}
            {addSectionSelectionModalVisible && <AddSectionSelectionModal
                onClose={onAddSectionSelectionCancel}
                onDone={onAddSectionsFromTemplate}
                onPressAddFreshSection={onPressAddFreshSection}
                loading={loading}
            />}
            {addSubsectionSelectionModalVisible && <AddSubsectionSelectionModal
                onClose={onAddSubsectionSelectionCancel}
                onDone={onAddSubsectionsFromTemplate}
                onPressAddFreshSubSection={onPressAddFreshSubsection}
                inFlight={loading}
            />}
        </>
    )
}, (prevProps, nextProps) => {
    return prevProps.visible === nextProps.visible
});

export default AddMenu;