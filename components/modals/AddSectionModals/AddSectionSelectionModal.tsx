import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Button, Checkbox, Subheading, Title } from 'react-native-paper';
import { InspectionState } from '../../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { ModalButtons } from '../../shared/ModalButtons';
import { Dialog } from 'react-native-simple-dialogs';
import { ISection } from '../../../lib/types';
import Icon from "react-native-vector-icons/MaterialIcons";
import { removeItemAll } from '../../../lib/arrayHelpers';
import { useSections } from '../../../hooks/useSections';

interface IProps {
    loading?: boolean
    onClose: () => void
    onDone: (sections: number[]) => void
    onPressAddFreshSection: () => void
}

export const AddSectionSelectionModal = ({ loading, onPressAddFreshSection, onClose, onDone }: IProps) => {
    const [sections, setSections] = useState<ISection[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [inFlight, setInFlight] = useState<boolean>(true);
    const [checkboxClickedNum, setCheckboxClickedNum] = useState<number>(0);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const { getSections } = useSections();
    const screen = Dimensions.get("screen");

    useEffect(() => {
        const getData = async () => {
            try {
                const sections = await getSections(inspectionState.master_script_id!);
                setSections(sections);
            } catch (error) {
                console.log(error);
            } finally {
                setInFlight(false);
            }
        }

        getData();
    }, []);

    const handleOnClose = useCallback(() => onClose(), [onClose]);

    const onSave = useCallback(() => {
        onDone(selectedSections);
    }, [selectedSections, onDone]);

    const handleOnPressAddFreshSection = useCallback(() => {
        onPressAddFreshSection();
    }, [onPressAddFreshSection]);

    const checkboxClicked = useCallback((id: number) => {
        const index = selectedSections.indexOf(id);
        if (index > -1) {
            setSelectedSections(removeItemAll(selectedSections, id));
        } else {
            setSelectedSections([id, ...selectedSections]);
        }
        setCheckboxClickedNum(checkboxClickedNum + 1);
    }, [selectedSections, checkboxClickedNum])

    const renderTheRows = useMemo(() => {
        return sections === null || sections.length === 0 ?
            <View></View> :
            sections.map((c: ISection) => {
                const checkStatus = selectedSections.indexOf(c.id) > -1 ? "checked" : "unchecked";
                return (
                    <View key={c.id} style={styles.section}>
                        <Text style={{ flex: 4 }} onPress={() => checkboxClicked(c.id)}>
                            <Subheading>{c.name}</Subheading>
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Checkbox
                                disabled={loading}
                                status={checkStatus}
                                onPress={() => checkboxClicked(c.id)}
                            />
                        </View>
                    </View>
                )
            })
    }, [sections.length, selectedSections.length, loading]);

    return (
        <Dialog
            visible={true}
            title="Add Section"
            buttons={(
                <ModalButtons
                    confirmDisabled={selectedSections.length === 0}
                    confirmText={"Done"}
                    cancelAction={handleOnClose}
                    confirmAction={onSave} />
            )}
            onTouchOutside={handleOnClose}>
            <View style={styles.formComponent}>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Icon size={24} name="add" />
                    <Button disabled={loading} onPress={handleOnPressAddFreshSection}>
                        Add New Section
                    </Button>
                </View>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Title>Select from Template:</Title>
                </View>
                <View>
                    {!inFlight &&
                        <ScrollView style={{ height: screen.height / 2 }}>
                            {renderTheRows}
                        </ScrollView>
                    }
                </View>
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    formComponent: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    section: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
});
