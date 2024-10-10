import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { SQL_UPDATE_CHECKBOX_VALUE } from '../../lib/sqlCommands';

const CheckboxValue = (props: any) => {
    const text = props.text;
    const valueId = props.valueId;
    const [checked, setChecked] = React.useState<boolean>(props.checked);

    const checkboxClicked = () => {
        const newValue = !checked;
        setChecked(newValue);
        props.onUpdate(newValue, SQL_UPDATE_CHECKBOX_VALUE(valueId, newValue));
    };

    return (
        <View style={{ flexDirection: 'row', minWidth: 50, height: 50, paddingRight: 8, }}>
            {Platform.OS === 'ios' && (
                <Checkbox.Android
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={checkboxClicked}
                />
            )}
            {Platform.OS !== 'ios' && (
                <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={checkboxClicked}
                />
            )}
            <Text
                onLongPress={props.onLongPress}
                style={styles.checkboxText}
                onPress={checkboxClicked}>
                {text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    checkboxText: {
        marginTop: 7,
    },
});

export default React.memo(CheckboxValue, (prevProps: any, nextProps: any) => {
    return prevProps.valueId === nextProps.valueId && prevProps.checked === nextProps.checked
        && prevProps.text === nextProps.text;
});