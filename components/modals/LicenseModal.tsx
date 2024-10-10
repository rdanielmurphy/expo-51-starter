import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput, Subheading } from 'react-native-paper';
import { useStates } from '../../hooks/useStates';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { ILicense } from '../../lib/types';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';

interface IProps {
    editMode?: boolean
    value?: ILicense
    onClose: () => void
    onSubmit: (value: ILicense) => void
}

export const LicenseModal = (props: IProps) => {
    const { loaded, states } = useStates();
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const [stateList, setStateList] = React.useState<IPickerItem[]>([]);
    const [licenseNumber, setLicenseNumber] = React.useState(props.value ? props.value.licenseNumber : '');
    const [state, setState] = React.useState<string>();
    const [type, setType] = React.useState(props.value ? props.value.type : '');
    const [expiration, setExpiration] = React.useState(props.value ? props.value.startDate : new Date().getTime());
    const [types, setTypes] = React.useState<IPickerItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [ready, setReady] = React.useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        const value = {
            licenseNumber,
            state: state!,
            type,
            startDate: expiration,
            id: props.editMode && props.value ? props.value.id : undefined
        } as ILicense
        props.onSubmit(value);
    }

    useEffect(() => {
        if (loaded && states && loadedUserDefinedFields && userDefinedFields) {
            const stateItems: IPickerItem[] = states.items.map((s, _i) => {
                const label = s.abbr + " -- " + s.name;
                const value = s.abbr;
                return { label, value } as IPickerItem;
            });
            setStateList(stateItems);
            if (stateItems.length > 0) {
                let index = 0;
                if (props.value && props.value.state && props.value.state.length > 0) {
                    setState(props.value.state);
                } else {
                    setState(stateItems[index].value);
                }
            }
            const types = getUserDefinedFieldValues(userDefinedFields.items, "License Type").map((i) => ({
                label: i.label,
                value: i.label,
            }))
            if (!props.value?.type) {
                setType(types[0].value);
            }
            setTypes(types);
            setLoading(false);
        }
    }, [loaded, states, loadedUserDefinedFields]);

    useEffect(() => {
        setReady(licenseNumber.length > 0 && state !== undefined && state.length > 0 && type !== undefined && type.length > 0);
    }, [licenseNumber, state, type]);

    return (
        <Dialog
            visible={true}
            title={`${props.editMode ? "Edit" : "Add"} License`}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <ScrollView style={styles.scrollView}>
                {!loading && (
                    <View>
                        <View style={styles.formComponent}>
                            <TextInput
                                autoComplete='off'
                                label="License Number"
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                            />
                        </View>

                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={stateList}
                                onValueChange={setState}
                                label={"State"}
                                value={state}
                            />
                        </View>

                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={types || []}
                                onValueChange={setType}
                                label={"Type"}
                                value={type}
                            />
                        </View>

                        <View style={styles.formComponent}>
                            <View style={{ flex: 1, alignSelf: "center" }}>
                                <Subheading>Expiration Date:</Subheading>
                            </View>
                            <Button mode='contained' onPress={() => setShowTimePicker(true)}>{format(expiration, "MMMM do, yyyy")}</Button>
                            {showTimePicker && (
                                <RNDateTimePicker
                                    value={new Date(expiration)}
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        setShowTimePicker(false)
                                        if (event.type === 'set' && date) {
                                            setExpiration(date.getTime())
                                        }
                                    }} />
                            )}
                        </View>
                    </View>)}
            </ScrollView>
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
