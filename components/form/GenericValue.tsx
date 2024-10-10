import * as React from 'react';
import { TouchableHighlight, StyleSheet, View } from 'react-native';
import { SQL_UPDATE_TEXT_VALUE, SQL_UPDATE_VALUE_HIGHLIGHT, SQL_UPDATE_VALUE_TEXT } from '../../lib/sqlCommands';
import CheckboxValue from './CheckboxValue';
import RichTextValue from './RichTextValue';
import TextBoxValue from './TextBoxValue';
import ValueOptionCheckboxes from './ValueOptionCheckboxes';
import { Menu } from 'react-native-paper';
import { updateCopyValueModal, updateHighlightModal } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { numberToHex } from '../../lib/colorsHelper';
import { InspectionState } from '../../redux/reducers/inspection';
import { EditItemNameModal } from '../modals/EditItemNameModal';

const GenericValue = (props: any) => {
    const dispatch = useDispatch();
    const [selected, setSelected] = React.useState<boolean>(false);
    const [showEditNameModal, setShowEditNameModal] = React.useState<boolean>(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [isHighlighted, setIsHighlighted] = React.useState<number>(0);
    const [highlightColor, setHightlightColor] = React.useState<string>("");

    const value = inspectionState.values?.find((v: any) => v.id === props.valueId);
    const valueOptions = inspectionState.valueOptions ?
        inspectionState.valueOptions
            .filter((v: any) => v.value_id === props.valueId)
            .sort((a: any, b: any) => a.number - b.number) : [];

    React.useEffect(() => {
        setIsHighlighted(value ? value.isHighlighted : 0);
        if (value && value.isHighlighted === 1) {
            setHightlightColor(numberToHex(value.highLightColor));
        } else {
            setHightlightColor("")
        }
    }, [value?.isHighlighted, value?.highLightColor]);

    const onLongPress = React.useCallback(() => {
        setSelected(true);
    }, []);

    const onCloseMenu = React.useCallback(() => {
        setSelected(false);
    }, []);

    const onCopy = React.useCallback(() => {
        updateCopyValueModal({ copyModal: true, copyId: props.valueId })(dispatch)
        setSelected(false);
    }, [props.valueId]);

    const onHighlight = React.useCallback(() => {
        updateHighlightModal({ show: true, id: props.valueId })(dispatch);
        setSelected(false);
    }, [props.valueId]);

    const onRemoveHighlight = React.useCallback(() => {
        if (value) {
            value.isHighlighted = 0;
            value.highLightColor = 0;
        }
        props.executeSQL(SQL_UPDATE_VALUE_HIGHLIGHT(props.valueId));
        setSelected(false);
    }, [value, props.valueId]);

    const onDelete = React.useCallback(() => {
        setSelected(false);
        props.onDelete(props.valueId);
    }, [props.valueId]);

    const onRename = React.useCallback(() => {
        setShowEditNameModal(true);
        setSelected(false);
    }, []);

    const onRenameSubmit = React.useCallback((newName: string): void => {
        setShowEditNameModal(false);
        if (value) {
            value.text = newName;
        }
        props.executeSQL(SQL_UPDATE_VALUE_TEXT(props.valueId, newName));
    }, [value?.id, props.valueId]);

    const onRenameCancel = React.useCallback(() => {
        setShowEditNameModal(false);
    }, []);

    const updateCheckBox = React.useCallback((newValue: boolean, sql: string) => {
        if (value) {
            value.checked = newValue ? 1 : 0;
            props.executeSQL(sql);
        }
    }, [props.executeSQL, value]);

    const updateTextBox = React.useCallback((sql: string, _id: number, newValue: string, ) => {
        if (value) {
            value.userText = newValue;
            props.executeSQL(sql);
        }
    }, [props.executeSQL, value]);

    const updateValueOption = React.useCallback((sql: string, id?: number, newValue?: boolean) => {
        if (valueOptions) {
            valueOptions.map((vo) => {
                if (vo.id === id) {
                    vo.checked = newValue ? 1 : 0;
                }
            });
            props.executeSQL(sql);
        }
    }, [props.executeSQL, value]);

    return value !== null && value !== undefined ? (
        <View>
            <Menu
                visible={selected}
                onDismiss={onCloseMenu}
                anchorPosition='bottom'
                style={{ marginTop: 8 }}
                anchor={
                    <TouchableHighlight
                        delayLongPress={500}
                        onLongPress={onLongPress}
                        style={selected ? styles.shadowProp : undefined}
                        underlayColor="white">
                        <View style={value.isHighlighted === 1 ? { backgroundColor: highlightColor } : {}}>
                            {value.type === 0 && (
                                <CheckboxValue
                                    onUpdate={updateCheckBox}
                                    valueId={value.id}
                                    checked={value.checked}
                                    text={value.text}
                                    onLongPress={onLongPress} />
                            )}
                            {value.type === 1 && (
                                <TextBoxValue
                                    size="small"
                                    onUpdate={updateTextBox}
                                    valueId={value.id}
                                    text={value.text}
                                    userText={value.userText}
                                    onLongPress={onLongPress} />
                            )}
                            {value.type === 2 && (
                                // 2 is rich text box with comments 
                                <RichTextValue onUpdate={updateTextBox} value={value} sqlMethod={SQL_UPDATE_TEXT_VALUE} />
                            )}
                            {value.type === 3 && (
                                // 3 is long text field
                                <TextBoxValue
                                    size="large"
                                    onUpdate={updateTextBox}
                                    valueId={value.id}
                                    text={value.text}
                                    userText={value.userText}
                                    onLongPress={onLongPress} />
                            )}
                            {
                                // 4 ?
                            }
                            {value.type === 5 && (
                                // 5 is value/option checkbox thingy
                                <ValueOptionCheckboxes
                                    onUpdate={updateValueOption}
                                    value={value}
                                    valueOptions={valueOptions}
                                />
                            )}
                            {
                                // 6 ?
                            }
                            {
                                // 7 ?
                            }
                        </View>
                    </TouchableHighlight>
                }>
                <Menu.Item onPress={onCopy} title="Copy" />
                <Menu.Item onPress={onRename} title="Rename" />
                <Menu.Item onPress={onDelete} title="Delete" />
                <Menu.Item onPress={onHighlight} title="Highlight" />
                {isHighlighted === 1 && <Menu.Item onPress={onRemoveHighlight} title="Remove Highlight" />}
            </Menu>
            {showEditNameModal &&
                <EditItemNameModal
                    type={'value'}
                    name={value.text}
                    customTitle='Edit value name'
                    onClose={onRenameCancel}
                    onSubmit={onRenameSubmit}
                />}
        </View>
    ) : (
        <View></View>
    )
}

const styles = StyleSheet.create({
    shadowProp: {
        elevation: 3,
        borderColor: '#f0ecec',
        borderLeftWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 1,
    },
});

export default React.memo(GenericValue, (prevProps: any, nextProps: any) => {
    return prevProps.valueId === nextProps.valueId;
});