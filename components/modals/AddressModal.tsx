import React, { useCallback, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, TextInput, Text, Button } from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useStates } from '../../hooks/useStates';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { IAddress } from '../../lib/types';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import { ModalButtons } from '../shared/ModalButtons';
import { Dialog } from 'react-native-simple-dialogs';
import GooglePlacesInput from '../shared/GooglePlacesInput';
import { useMembership } from '../../hooks/useMembership';

interface IProps {
    editMode?: boolean
    value?: IAddress
    showType?: boolean
    showPrimary?: boolean
    onClose: () => void
    onSubmit: (value: IAddress) => void
}

export const AddressModal = (props: IProps) => {
    const { loaded, states } = useStates();
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const { currentPlan } = useMembership();

    const [stateList, setStateList] = React.useState<IPickerItem[]>([]);
    const [addr1, setAddr1] = React.useState(props.value ? props.value.addr1 : '');
    const [addr2, setAddr2] = React.useState(props.value ? props.value.addr2 : '');
    const [city, setCity] = React.useState(props.value ? props.value.city : '');
    const [state, setState] = React.useState<string>();
    const [zip, setZip] = React.useState(props.value ? props.value.zip : '');
    const [type, setType] = React.useState(props.value ? props.value.type : '');
    const [isPrimary, setIsPrimary] = React.useState(props.value ? props.value.isPrimary : false);
    const [types, setTypes] = React.useState<IPickerItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [ready, setReady] = React.useState<boolean>(false);
    const [enableAddressSearch, setEnableAddressSearch] = React.useState<boolean>(false);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        const value = {
            addr1,
            addr2,
            city,
            state: state!,
            zip: zip,
            type,
            isPrimary,
            id: props.editMode && props.value ? props.value.id : undefined
        } as IAddress
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
            const types = getUserDefinedFieldValues(userDefinedFields.items, "AddressType").map((i) => ({
                label: i.label,
                value: i.label,
            }))
            setTypes(types);
            if (props.showType && !props.value?.type) {
                setType(types[0].label);
            }
            setLoading(false);
        }
    }, [loaded, states, loadedUserDefinedFields]);

    useEffect(() => {
        setReady(addr1.length > 0 && city.length > 0 && zip.length > 0 && state ? true : false);
    }, [addr1, city, zip, state]);

    const onAddressSelect = useCallback((address: IAddress) => {
        setAddr1(address.addr1);
        setCity(address.city);
        setState(address.state);
        setZip(address.zip);
        setEnableAddressSearch(false);
    }, []);

    return (
        <Dialog
            visible={true}
            title={`${props.editMode ? "Edit" : "Add"} Address`}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready}
                    confirmText={"Save"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading && (
                <View>
                    <View style={styles.formComponent}>
                        {enableAddressSearch && currentPlan !== null && (
                            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
                                <GooglePlacesInput onSelect={onAddressSelect} />
                            </ScrollView>
                        )}
                        {!enableAddressSearch && currentPlan !== null && (
                            <View style={{ flexDirection: 'row', alignItems: "center", minWidth: 50, height: 50 }}>
                                <Icon size={24} name="search" />
                                <Button onPress={() => setEnableAddressSearch(true)}>
                                    Search Address
                                </Button>
                            </View>
                        )}
                        <TextInput
                            autoComplete='postal-address'
                            label="Address 1"
                            value={addr1}
                            onChangeText={text => setAddr1(text)}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='postal-address-extended'
                            label="Address 2"
                            value={addr2}
                            onChangeText={text => setAddr2(text)}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='postal-address-locality'
                            label="City"
                            value={city}
                            onChangeText={text => setCity(text)}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={stateList}
                            onValueChange={(t) => setState(t)}
                            label={"State"}
                            value={state}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='postal-code'
                            label="zip"
                            value={zip}
                            maxLength={5}
                            keyboardType="numeric"
                            onChangeText={text => setZip(text)}
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
                </View>
            )}
        </Dialog >
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
        paddingBottom: 20,
    }
});
