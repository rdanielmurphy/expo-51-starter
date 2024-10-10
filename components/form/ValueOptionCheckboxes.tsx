import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import { SQL_UPDATE_CHECKBOX_VALUE_OPTION } from '../../lib/sqlCommands';

const ValueOptionCheckbox = React.memo((props: any) => {
    const theValue = props.value;
    const [checked, setChecked] = React.useState<boolean>(theValue.checked);

    const checkboxClicked = () => {
        setChecked(!checked);
        props.onUpdate(SQL_UPDATE_CHECKBOX_VALUE_OPTION(theValue.id, !checked), theValue.id, !checked);
    };

    return (
        <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
            <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={checkboxClicked}
            />
            <Text
                style={styles.checkboxText}
                onPress={checkboxClicked}>
                {theValue.text}
            </Text>
        </View>
    )
}, (prevProps, nextProps) => {
    return prevProps.value.checked === nextProps.value.checked;
})

const ValueOptionCheckboxes = (props: any) => {
    const { colors } = useTheme();
    const theValue = props.value;
    const valueOptions: any[] = props.valueOptions;

    return (
        <View style={{
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: 4,
            borderColor: colors.backdrop,
            marginLeft: 8,
            marginRight: 8,
            marginTop: 4,
            marginBottom: 4,
        }}>
            <View style={{ borderRadius: 4, backgroundColor: colors.surface, padding: 8 }}>
                <Text>
                    {theValue.text}
                </Text>
            </View>
            <View style={{ padding: 8, flexDirection: 'row', flexWrap: "wrap" }}>
                {valueOptions.map((vo) =>
                    <ValueOptionCheckbox key={vo.id} value={vo} onUpdate={props.onUpdate} />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    checkboxText: {
        marginTop: 7,
    },
});

export default ValueOptionCheckboxes;