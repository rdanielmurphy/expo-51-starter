import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, TextInput, Text } from 'react-native-paper';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { IPhonenumber } from '../../lib/types';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';

interface IProps {
    editMode?: boolean
    value?: IPhonenumber
    showType?: boolean
    showPrimary?: boolean
    onClose: () => void
    onSubmit: (value: IPhonenumber) => void
}

export const PhonenumberModal = (props: IProps) => {
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const [number, setNumber] = React.useState(props.value ? props.value.number : '');
    const [extension, setExtension] = React.useState(props.value ? props.value.extension : '');
    const [type, setType] = React.useState(props.value ? props.value.type : '');
    const [isPrimary, setIsPrimary] = React.useState(props.value ? props.value.isPrimary : false);
    const [types, setTypes] = React.useState<IPickerItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [ready, setReady] = React.useState<boolean>(false);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        const value = {
            number,
            extension,
            type,
            isPrimary,
            id: props.editMode && props.value ? props.value.id : undefined
        } as IPhonenumber
        props.onSubmit(value);
    }

    useEffect(() => {
        if (loadedUserDefinedFields && userDefinedFields) {
            const types = getUserDefinedFieldValues(userDefinedFields.items, "PhoneType").map((i) => ({
                label: i.label,
                value: i.label,
            }))
            setTypes(types);
            if (props.showType && !props.value?.type) {
                setType(types[0].label);
            }
            setLoading(false);
            setReady(true);
        }
    }, [loadedUserDefinedFields]);

    return (
        <Dialog
            visible={true}
            title={`${props.editMode ? "Edit" : "Add"} Phone Number`}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready}
                    confirmText={"Save"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading && (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='tel'
                            label="Phone number"
                            keyboardType="numeric"
                            value={number}
                            onChangeText={setNumber}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='off'
                            label="Ext"
                            keyboardType="numeric"
                            value={extension}
                            onChangeText={setExtension}
                        />
                    </View>

                    {props.showType && (
                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={types || []}
                                onValueChange={setType}
                                label={"Type"}
                                value={type}
                            />
                        </View>
                    )}

                    {props.showPrimary && (
                        <View style={styles.formComponent}>
                            <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
                                <Checkbox
                                    status={isPrimary === true ? "checked" : "unchecked"}
                                    onPress={() => setIsPrimary(isPrimary === true ? false : true)}
                                />
                                <Text
                                    style={styles.checkboxText}
                                    onPress={() => setIsPrimary(isPrimary === true ? false : true)}>
                                    Primary
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </Dialog>
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
    formComponent: {
        padding: 10
    }
});
