import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Headline, Modal, Portal, TextInput } from 'react-native-paper';
import { CopyToSummaryModal } from './CopyToSummaryModal';
import { InspectionState } from '../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    value: any
    title: string
    onClose: () => void
    onSubmit: (value: string) => void
}

export const RichTextModal = (props: IProps) => {
    const { execAsync, getAllAsync } = useDbContext();
    const [text, setText] = React.useState<string>(props.value);
    const [selectedText, setSelectedText] = React.useState<string>("");
    const [showCopyToSummaryModal, setShowCopyToSummaryModal] = React.useState<boolean>(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    const onCancel = () => props.onClose();
    const onSubmit = () => {
        props.onSubmit(text);
    }

    const onSelectionChange = useCallback((e: { nativeEvent: { selection: any; }; }) => {
        const selection = e.nativeEvent.selection;
        setSelectedText(text.substring(selection.start, selection.end));
    }, [text]);

    const onCopyToSummary = useCallback(() => {
        setShowCopyToSummaryModal(true)
    }, [selectedText]);

    return (
        <Portal>
            {!showCopyToSummaryModal &&
                <Modal visible={true} onDismiss={onCancel} contentContainerStyle={styles.containerStyle}>
                    <Headline>{props.title}</Headline>

                    <View>
                        <View>
                            <View>
                                <TextInput
                                    numberOfLines={15}
                                    autoFocus
                                    defaultValue={text}
                                    onChangeText={(v: string) => {
                                        setText(v)
                                    }}
                                    onSelectionChange={onSelectionChange}
                                    selectionColor={"#fff"}
                                    cursorColor={"#000"}
                                    multiline
                                />
                            </View>

                            <View style={styles.footer}>
                                <View style={styles.buttons}>
                                    {selectedText.length > 0 && <Button mode="text" onPress={onCopyToSummary}>Copy to summary</Button>}
                                    <Button mode="text" onPress={onCancel}>Cancel</Button>
                                    <Button mode="text" onPress={onSubmit}>Done</Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            }
            {showCopyToSummaryModal &&
                <CopyToSummaryModal
                    execAsync={execAsync}
                    getAllAsync={getAllAsync}
                    text={selectedText}
                    show={showCopyToSummaryModal}
                    scriptId={inspectionState.script_id!}
                    onClose={function (): void {
                        setShowCopyToSummaryModal(false);
                    }}
                />
            }
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    footer: {
        height: 50
    }
});
