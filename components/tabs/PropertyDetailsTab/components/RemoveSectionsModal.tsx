import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, Text, Subheading, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG } from '../../../../lib/sqlCommands';
import { removeItemAll } from '../../../../lib/arrayHelpers';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../../../shared/ModalButtons';
import { useDbContext } from '../../../../contexts/DbContext';
import { InspectionState } from '../../../../redux/reducers/inspection';

interface IProps {
    amount: number;
    show: boolean;
    tag: string;
    onCancel: () => void;
    onDone: (sectionIds: number[]) => void;
}

export const RemoveSectionsModal = ({ amount, show, tag, onCancel, onDone }: IProps) => {
    const { ready, getAllAsync } = useDbContext();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [loading, setLoading] = useState<boolean>(true);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);

    useEffect(() => {
        if (show) {
            setSelectedSections([]);
        }
    }, [show]);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const sections = await getAllAsync(SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG(inspectionState.script_id!, tag));
                setSections(sections);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        setSelectedSections([]);

        if (ready && show) {
            getData();
        }
    }, [inspectionState.script_id, tag, ready, show, getAllAsync]);

    const handleSubmit = useCallback(() => {
        onDone(selectedSections);
    }, [selectedSections, onDone]);

    const checkboxClicked = useCallback((num: number) => {
        const index = selectedSections.indexOf(num);
        if (index > -1) {
            setSelectedSections([...removeItemAll(selectedSections, num)]);
        } else {
            setSelectedSections([num, ...selectedSections]);
        }
    }, [selectedSections, selectedSections.length]);

    const renderTheRows = useMemo(() => {
        return (sections === null || sections === undefined || sections.length === 0 || loading) ?
            <View>
                <ActivityIndicator animating={true} color={"#000"} />
            </View> :
            sections.map((s: any) => {
                const checkStatus = selectedSections.indexOf(s.id) > -1 ? "checked" : "unchecked";
                return (
                    <View key={s.id} style={styles.section}>
                        <Text style={{ flex: 4 }} onPress={() => checkboxClicked(s.id)}>
                            <Subheading>{s.name}</Subheading>
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Checkbox
                                disabled={loading}
                                status={checkStatus}
                                onPress={() => checkboxClicked(s.id)}
                            />
                        </View>
                    </View>
                )
            })
    }, [loading, selectedSections.length, sections]);

    return (
        <>
            <Dialog
                visible={show}
                title={"Remove sections"}
                buttons={(
                    <ModalButtons
                        confirmDisabled={!ready || loading || selectedSections.length !== Math.abs(amount)}
                        confirmText={"Remove Selected"}
                        cancelAction={onCancel}
                        confirmAction={handleSubmit} />
                )}
                onTouchOutside={onCancel}>
                <View>
                    <ScrollView>
                        <View>
                            <Text>You need to remove {Math.abs(amount)} sections</Text>
                        </View>
                        {renderTheRows}
                    </ScrollView>
                </View>
            </Dialog>
        </>
    )
}

const styles = StyleSheet.create({
    section: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
});
