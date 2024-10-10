import React, { useCallback, useEffect, useMemo } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Headline, Modal, Portal, Text, Subheading, ProgressBar } from 'react-native-paper';
import { SQL_APPEND_TO_SUMMARY_SECTION, SQL_GET_SUMMARY_BY_SCRIPT_ID } from '../../lib/sqlCommands';
import { useDispatch, useSelector } from 'react-redux';
import { InspectionState } from '../../redux/reducers/inspection';
import { CopyToSummaryModalState, initialState } from '../../redux/reducers/copyToSummaryModal';
import { updateCopyToSummaryModal } from '../../redux/actions';
import { removeItemAll } from '../../lib/arrayHelpers';
import { useDbContext } from '../../contexts/DbContext';

export const CopyToSummaryModalContainer = () => {
    const { execAsync, getAllAsync } = useDbContext();
    const dispatch = useDispatch();
    const copyToSummaryState: CopyToSummaryModalState = useSelector((state: any) => state.copyToSummaryState);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    const onClose = () => updateCopyToSummaryModal(initialState)(dispatch);

    return (
        <Portal>
            <CopyToSummaryModal
                execAsync={execAsync}
                getAllAsync={getAllAsync}
                text={copyToSummaryState.text}
                show={copyToSummaryState.show}
                scriptId={inspectionState.script_id!}
                onClose={onClose} />
        </Portal>
    )
}

interface iCopyToSummaryModalProps {
    text: string
    scriptId: number
    show: boolean
    onClose: () => void
    execAsync: (sqlStatement: string, log?: boolean) => Promise<boolean>
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any[]>
}

export const CopyToSummaryModal = ({ text, show, scriptId, onClose, execAsync, getAllAsync }: iCopyToSummaryModalProps) => {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [summarySections, setSummarySections] = React.useState<any[]>();
    const [selectedSummarySections, setSelectedSummarySections] = React.useState<number[]>([]);
    const [checkboxClickedNum, setCheckboxClickedNum] = React.useState<number>(0);
    const screen = Dimensions.get("screen");

    const onSubmitPressed = () => {
        selectedSummarySections.forEach(s => execAsync(SQL_APPEND_TO_SUMMARY_SECTION(s, text)));
        onClose();
    }

    useEffect(() => {
        const getSummaryItems = async () => {
            setLoading(true)
            try {
                const results = await getAllAsync(SQL_GET_SUMMARY_BY_SCRIPT_ID(scriptId));
                setSummarySections(results);
            } catch (e) {
                console.error('error loading summary sections', e)
            } finally {
                setLoading(false)
            }
        }

        if (show) {
            getSummaryItems()
        }
    }, [getAllAsync, show])

    const checkboxClicked = useCallback((num: number) => {
        const index = selectedSummarySections.indexOf(num);
        if (index > -1) {
            setSelectedSummarySections(removeItemAll(selectedSummarySections, num));
        } else {
            setSelectedSummarySections([num, ...selectedSummarySections]);
        }
        setCheckboxClickedNum(checkboxClickedNum + 1);
    }, [selectedSummarySections, checkboxClickedNum])

    const renderTheRows = useMemo(() => {
        return summarySections === undefined || summarySections?.length < 1 || loading ?
            <ProgressBar /> :
            summarySections.map((c: any) => {
                const checkStatus = selectedSummarySections && selectedSummarySections.indexOf(c.id) > -1 ? "checked" : "unchecked";
                return (
                    <View key={c.id} style={styles.summarySection}>
                        <Text style={{ flex: 4 }} onPress={() => checkboxClicked(c.id)}>
                            <Subheading>{c.name}</Subheading>
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Checkbox
                                status={checkStatus}
                                onPress={() => checkboxClicked(c.id)}
                            />
                        </View>
                    </View>
                )
            })
    }, [selectedSummarySections.length, summarySections?.length, checkboxClickedNum, loading]);

    return (
        <Modal visible={show} onDismiss={onClose} contentContainerStyle={styles.containerStyle}>
            <Headline>Copy to summary</Headline>

            {!loading &&
                <View style={styles.scrollView}>
                    <ScrollView style={{ maxHeight: screen.height - 250 }}>
                        {renderTheRows}
                        <View style={styles.buttons}>
                            <Button mode="text" onPress={onClose}>Cancel</Button>
                            <Button mode="text" onPress={onSubmitPressed}>Done</Button>
                        </View>
                    </ScrollView>
                </View>
            }
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        marginHorizontal: 0,
    },
    button: {
        margin: 10,
        width: 400,
    },
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    checkboxText: {
        marginTop: 10,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    summarySection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        padding: 20,
    }
});
