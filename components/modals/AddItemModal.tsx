import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { TYPE_MAP } from '../../lib/types';
import { StandardPicker } from '../shared/StandardPicker';
import { SQL_GET_OPTIONS_BY_SECTION_ID } from '../../lib/sqlCommands';
import * as SQLite from 'expo-sqlite/next';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    sectionId: number
    subSectionId?: number
    defaultType?: AddType
    noMultiCheckbox?: boolean
    onClose: () => void
    onSubmit: (addItem: IAddItem) => void
}

export const SECTION = "Section"
export const SUBSECTION = "Subsection"
export const OPTION = "Option"
export const VALUE = "Value"
export type AddType = "Section" | "Subsection" | "Option" | "Value";

export interface IAddItem {
    type: AddType
    name: string
    subsectionId?: number
    optionId?: number
    valueType?: number
}

interface IAddItemOption {
    label: string
    value: number
}

export const AddItemModal = (props: IProps) => {
    const [text, setText] = useState<string>("");
    const [selectedType, setSelectedType] = useState<AddType>(props.defaultType === undefined ? SECTION : props.defaultType);
    const [selectedValueType, setSelectedValueType] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number>();
    const [options, setOptions] = useState<IAddItemOption[]>([]);
    const { ready, getAllAsync } = useDbContext();

    const onClose = useCallback(() => props.onClose(), [props.onClose]);

    const onSubmit = useCallback(() => {
        const addItem = {
            type: selectedType,
            name: text,
            valueType: selectedValueType,
            optionId: selectedOption,
        } as IAddItem
        props.onSubmit(addItem);
    }, [props.onSubmit, selectedType, selectedValueType, selectedOption, text]);

    useEffect(() => {
        const getData = async () => {
            if (selectedType === "Section" || selectedType === "Subsection") {
                setOptions([])
            } else if (selectedType === "Option" || selectedType === "Value") {
                if (selectedType === "Value") {
                    const optionsResult = await getAllAsync(SQL_GET_OPTIONS_BY_SECTION_ID(props.sectionId))
                    const options = []
                    for (let i = 0; i < optionsResult.length; i++) {
                        const option = optionsResult[i];
                        if (option.subsection_id === props.subSectionId) {
                            options.push({
                                label: option.name,
                                value: option.id,
                            })
                        }
                    }
                    setOptions(options);
                } else {
                    setOptions([])
                }
            }
        }

        getData();
    }, [selectedType, props.sectionId, selectedOption, ready, getAllAsync]);

    const listItems = Array.from(TYPE_MAP.entries()).map(([value, label]) => ({
        label,
        value,
    }));

    return (
        <Dialog
            visible={true}
            title={`Add ${props.defaultType ? props.defaultType : 'Item'}`}
            buttons={(
                <ModalButtons
                    confirmDisabled={selectedType === VALUE && selectedOption === undefined}
                    confirmText={"Done"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <ScrollView style={styles.scrollView}>
                {props.defaultType === undefined && (<View style={styles.formComponent}>
                    <StandardPicker
                        items={[
                            {
                                label: SECTION,
                                value: SECTION,
                            },
                            {
                                label: SUBSECTION,
                                value: SUBSECTION,
                            },
                            {
                                label: OPTION,
                                value: OPTION,
                            },
                            {
                                label: VALUE,
                                value: VALUE,
                            }
                        ]}
                        onValueChange={setSelectedType}
                        label={"Item type"}
                        value={selectedType}
                        useValueAsDisplay
                    />
                </View>)}

                {selectedType === VALUE && (
                    <>
                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={options.map((s) => ({
                                    label: s.label.length === 0 ? "[BLANK]" : s.label,
                                    value: s.value,
                                }))}
                                onValueChange={setSelectedOption}
                                label={"Option"}
                                value={selectedOption}
                                custumLabel={"Select option"}
                            />
                        </View>
                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={props.noMultiCheckbox ? listItems.filter(v => v.value !== 5) : listItems}
                                onValueChange={setSelectedValueType}
                                label={"Value Type"}
                                value={selectedValueType}
                            />
                        </View>
                    </>
                )}

                <View style={styles.formComponent}>
                    <TextInput
                        autoComplete='off'
                        label="Name"
                        value={text}
                        onChangeText={setText}
                    />
                </View>
            </ScrollView>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 0,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    formComponent: {
        paddingTop: 10
    }
});
