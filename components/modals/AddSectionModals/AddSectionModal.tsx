import React, { useCallback, useState } from 'react'
import { Text, ScrollView, StyleSheet, View } from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import { InspectionState } from '../../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { ModalButtons } from '../../shared/ModalButtons';
import { Dialog } from 'react-native-simple-dialogs';
import SectionTagDropdown, { SectionTag } from '../../shared/SectionTagDropdown';

interface IProps {
    loading?: boolean
    onClose: () => void
    onSave: (name: string, tag?: SectionTag) => void
}

export const AddSectionModal = (props: IProps) => {
    const [text, setText] = useState<string>("");
    const [tag, setTag] = useState<SectionTag>();
    const [sameNameError, setSameNameError] = useState<boolean>(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    const onClose = useCallback(() => props.onClose(), [props.onClose]);

    const onSave = useCallback(() => {
        const defaults = ['Details', 'Invoice', 'Photos', 'Summary', 'Overview'];
        if (inspectionState && (inspectionState.sections?.find((s: any) => s.name === text) !== undefined ||
            defaults.find((s: string) => s === text) !== undefined)) {
            setSameNameError(true);
        } else {
            setSameNameError(false);
            props.onSave(text, tag);
        }
    }, [props.onSave, tag, text]);

    return (
        <Dialog
            visible={true}
            title="Add Section"
            buttons={(
                <ModalButtons
                    confirmDisabled={text.length === 0 || props.loading}
                    confirmText={"Save"}
                    cancelAction={onClose}
                    cancelDisabled={props.loading}
                    confirmAction={onSave} />
            )}
            onTouchOutside={onClose}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formComponent}>
                    {sameNameError && (
                        <View style={{ marginBottom: 8 }}>
                            <Card>
                                <Card.Content style={{ backgroundColor: 'red' }}>
                                    <Text>Section name already exists</Text>
                                </Card.Content>
                            </Card>
                        </View>
                    )}
                    <TextInput
                        autoComplete='off'
                        label="Section Name"
                        value={text}
                        disabled={props.loading}
                        onChangeText={setText}
                    />
                    <View style={{ marginTop: 8 }}>
                        <SectionTagDropdown
                            value={tag}
                            disabled={props.loading}
                            onChange={setTag}
                        />
                    </View>
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
    }
});
