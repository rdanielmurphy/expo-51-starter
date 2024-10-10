import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View, Platform, ActionSheetIOS } from 'react-native';
import { Button, Text } from 'react-native-paper';

export interface IPickerItem {
    label: string,
    value: any,
}

interface IProps {
    items: IPickerItem[]
    label: string
    value?: any
    disabled?: boolean
    custumLabel?: string
    useValueAsDisplay?: boolean
    onValueChange: (value: any) => void
}

export const StandardPicker = (props: IProps) => {
    const [selectedItem, setSelectedItem] = React.useState(props.value);
    const [displayValue, setDisplayValue] = React.useState<string | undefined>(undefined);

    const onValueChange = useCallback((itemValue: string, _itemIndex: number) => {
        setSelectedItem(itemValue === "" ? undefined : itemValue);
        props.onValueChange(itemValue === "" ? undefined : itemValue);
    }, [props.onValueChange]);

    useEffect(() => {
        if (props.useValueAsDisplay) {
            setDisplayValue(props.value);
        } else if (!props.useValueAsDisplay && props.items && props.value) {
            const index = props.items.findIndex((i) => i.value === props.value);
            if (index > -1) {
                setDisplayValue(props.items[index].label);
                setSelectedItem(props.items[index].value);
            }
        }
    }, [props.useValueAsDisplay, props.items, props.value])

    const onPress = useCallback(() =>
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', ...props.items.map(item => item.label)],
                cancelButtonIndex: 0,
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    // cancel action
                } else {
                    onValueChange(props.items[buttonIndex - 1].value, buttonIndex - 1);
                }
            },
        ), [onValueChange, props.items]);

    return (
        <View style={[styles.container, styles.shadowProp]}>
            <View style={{ flex: 1, alignSelf: "center" }}>
                <Text>{props.label}</Text>
            </View>
            <View style={{ flex: 2 }}>
                {Platform.OS === 'ios' && (
                    <Button labelStyle={{ fontWeight: 'bold' }} onPress={onPress}>
                        {displayValue ?? (props.custumLabel ?? "Select a value")}
                    </Button>
                )}
                {Platform.OS !== 'ios' && (
                    <Picker
                        enabled={!props.disabled}
                        selectedValue={selectedItem}
                        onValueChange={onValueChange}>
                        {(props.value === undefined || props.value === null) && (selectedItem === undefined || selectedItem === null) &&
                            (<Picker.Item key={""} label={props.custumLabel ? props.custumLabel : "Select a value"} value={""} />
                            )}
                        {props.items.map((item: IPickerItem) => <Picker.Item key={item.label} label={item.label} value={item.value} />)}
                    </Picker>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    shadowProp: {
        elevation: 1,
    }
});