import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import GenericValue from './GenericValue';
import { InspectionState } from '../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { SQL_DELETE_VALUE_BY_ID, SQL_DELETE_VALUE_OPTION_BY_VALUE_ID } from '../../lib/sqlCommands';

const GenericOption = (props: any) => {
    const { colors } = useTheme();
    const [values, setValues] = React.useState<any[]>([]);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    React.useEffect(() => {
        const theOptions = inspectionState.values ?
            inspectionState.values?.filter((v: any) => v.option_id === props.optionId) : [];
        setValues(theOptions ?? []);
    }, [inspectionState.optionsRefreshCounter, inspectionState.valuesRefreshCounter, props.optionId]);

    const onDelete = React.useCallback((valueId: number) => {
        const theValues = inspectionState.values?.filter((v: any) => v.id !== valueId)
            .filter((v: any) => v.option_id === props.optionId);
        if (theValues) {
            setValues(theValues);
        }

        props.executeSQL(SQL_DELETE_VALUE_BY_ID(valueId));
        props.executeSQL(SQL_DELETE_VALUE_OPTION_BY_VALUE_ID(valueId));
    }, [inspectionState.valuesRefreshCounter, props.executeSQL, props.optionId]);

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background }} >
            <View style={{ flexDirection: 'row', flexWrap: "wrap" }}>
                {values.sort((a: any, b: any) => a.number - b.number).map((v: any) =>
                    <View key={v.id}>
                        <GenericValue
                            executeSQL={(sql: string) => props.executeSQL(sql)}
                            valueId={v.id}
                            onDelete={onDelete}
                        />
                    </View>
                )}
            </View>
        </View>
    )
}

export default React.memo(GenericOption, (prevProps: any, nextProps: any) => {
    return prevProps.optionId === nextProps.optionId && prevProps.subsectionId === nextProps.subsectionId;
});