import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import EditableGenericValue from './EditableGenericValue';
import { IDbProps } from '../tabs/EditableGenericSubSectionTab';

interface IProps extends IDbProps {
    optionId: number;
    values: any[];
    valueOptions: any[];
    navigate: (path: string, params: any) => any;
}

const EditableGenericOption = (props: IProps) => {
    const { colors } = useTheme();

    const theValues = props.values.filter((v: any) => v.option_id === props.optionId)
    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background }} >
            <View style={{ flexDirection: 'row', flexWrap: "wrap" }}>
                {theValues.sort((a: any, b: any) => a.number - b.number).map((v: any) =>
                    <View key={v.id}>
                        <EditableGenericValue
                            execAsync={props.execAsync}
                            runAsync={props.runAsync}
                            getAllAsync={props.getAllAsync}
                            getFirstAsync={props.getFirstAsync}
                            value={v}
                            valueOptions={props.valueOptions} 
                            navigate={props.navigate} />
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        marginHorizontal: 0,
        height: '100%',
    },
    button: {
        margin: 10,
        width: 150,
    },
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    formComponent: {
        padding: 10
    }
});

export default EditableGenericOption;