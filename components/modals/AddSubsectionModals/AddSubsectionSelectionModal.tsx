import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { InspectionState } from '../../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { ModalButtons } from '../../shared/ModalButtons';
import { Dialog } from 'react-native-simple-dialogs';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSections } from '../../../hooks/useSections';
import TreeView from '../../shared/TreeView';
import { ILeafItem } from '../../shared/TreeView/components/TreeLeaf';

interface IProps {
    inFlight?: boolean
    onClose: () => void
    onDone: (subsections: number[]) => void
    onPressAddFreshSubSection: () => void
}

export const AddSubsectionSelectionModal = ({ inFlight, onPressAddFreshSubSection, onClose, onDone }: IProps) => {
    const [selectedSubsections, setSelectedSubsections] = useState<number[]>([]);
    const [subsectionTree, setSubsectionTree] = useState<Map<string, ILeafItem[]>>();
    const [loading, setLoading] = useState<boolean>(true);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const { getSections, getSubsections } = useSections();
    const screen = Dimensions.get("screen");

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const sections = await getSections(inspectionState.master_script_id!);
                const sectionNames = new Map(sections.map((s) => [s.id, s.name]));
                const subsections = await getSubsections(inspectionState.master_script_id!);
                const sectionsMap = new Map<string, ILeafItem[]>();
                for (let s of subsections) {
                    const sectionName = sectionNames.get(s.section_id);
                    if (sectionName) {
                        if (sectionsMap.get(sectionName) === undefined) {
                            sectionsMap.set(sectionName, []);
                        }
                        sectionsMap.get(sectionName)?.push({
                            id: s.id,
                            title: s.name,
                        });
                    }
                }
                setSubsectionTree(sectionsMap);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        getData();
    }, []);

    const handleOnClose = useCallback(() => onClose(), [onClose]);

    const onSave = useCallback(() => {
        onDone(selectedSubsections);
    }, [selectedSubsections, onDone]);

    const handleOnPressAddFreshSubsection = useCallback(() => {
        onPressAddFreshSubSection();
    }, [onPressAddFreshSubSection]);

    const onSelectionChange = useCallback((selectedIds: Map<string, number[]>) => {
        let selectedSubsections: number[] = [];
        selectedIds.forEach((value) => {
            selectedSubsections = [...selectedSubsections, ...value];
        });
        setSelectedSubsections(selectedSubsections);
    }, []);

    return (
        <Dialog
            visible={true}
            title="Add Subsection"
            buttons={(
                <ModalButtons
                    confirmDisabled={loading || inFlight || selectedSubsections.length === 0}
                    confirmText={"Done"}
                    cancelAction={handleOnClose}
                    cancelDisabled={loading || inFlight}
                    confirmAction={onSave} />
            )}
            onTouchOutside={handleOnClose}>
            <ScrollView style={styles.scrollView}>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Icon size={24} name="add" />
                    <Button onPress={handleOnPressAddFreshSubsection}>
                        Add New Subsection
                    </Button>
                </View>
                <View>
                    {!loading && subsectionTree && (
                        <ScrollView style={{ height: screen.height / 2 }}>
                            <TreeView
                                items={subsectionTree}
                                onSelectionChange={onSelectionChange}
                                noRootCheck={true}
                                disabled={inFlight}
                            />
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 0,
    },
    formComponent: {
        padding: 10
    },
    section: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
});
