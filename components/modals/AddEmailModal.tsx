import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Headline, Modal, Portal, TextInput, Text } from 'react-native-paper';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { IEmail } from '../../lib/types';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';

interface IProps {
    editMode?: boolean
    value?: IEmail
    showType?: boolean
    showPrimary?: boolean
    onClose: () => void
    onSubmit: (value: IEmail) => void
}

export const EmailModal = (props: IProps) => {
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const [email, setEmail] = React.useState(props.value ? props.value.email : '');
    const [type, setType] = React.useState(props.value ? props.value.type : '');
    const [isPrimary, setIsPrimary] = React.useState(props.value ? props.value.isPrimary : false);
    const [types, setTypes] = React.useState<IPickerItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [ready, setReady] = React.useState<boolean>(false);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        const value = {
            email,
            type,
            isPrimary,
            id: props.editMode && props.value ? props.value.id : undefined
        } as IEmail
        props.onSubmit(value);
    }

    useEffect(() => {
        if (loadedUserDefinedFields && userDefinedFields) {
            const types = getUserDefinedFieldValues(userDefinedFields.items, "EmailType").map((i) => ({
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
            title={`${props.editMode ? "Edit" : "Add"} Email`}
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
                            autoComplete='email'
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
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
