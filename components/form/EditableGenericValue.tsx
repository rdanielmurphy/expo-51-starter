import * as React from 'react';
import { View } from 'react-native';
import EditableCheckboxValue from './EditableCheckboxValue';
import EditableTextBoxValue from './EditableTextBoxValue';
import EditableValueOption from './EditableValueOption';
import { IDbProps } from '../tabs/EditableGenericSubSectionTab';

interface IProps extends IDbProps {
    value: any;
    valueOptions: any[];
    navigate: (path: string, params: any) => any;
}

const EditableGenericValue = (props: IProps) => {
    const theValue = props.value

    const handleOnUpdate = React.useCallback((sql: string, refresh?: boolean) => props.execAsync(sql, refresh, false), [props.execAsync])

    return (
        <View>
            {theValue.type === 0 && (
                <EditableCheckboxValue onUpdate={handleOnUpdate} value={theValue} />
            )}
            {theValue.type === 1 && (
                <EditableTextBoxValue navigate={props.navigate} onUpdate={handleOnUpdate} value={theValue} />
            )}
            {theValue.type === 2 && (
                // 2 is rich text box with comments 
                <EditableTextBoxValue navigate={props.navigate} onUpdate={handleOnUpdate} value={theValue} />
            )}
            {theValue.type === 3 && (
                // 3 is long text field
                <EditableTextBoxValue navigate={props.navigate} onUpdate={handleOnUpdate} value={theValue} />
            )}
            {
                // 4 ?
            }
            {theValue.type === 5 && (
                // 5 is value/option checkbox thingy
                <EditableValueOption onUpdate={handleOnUpdate} value={theValue} />
            )}
            {
                // 6 ?
            }
            {
                // 7 ?
            }
        </View>
    )
}

export default React.memo(EditableGenericValue);