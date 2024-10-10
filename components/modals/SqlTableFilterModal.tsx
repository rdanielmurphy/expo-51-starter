import React, { useCallback, useState } from 'react'
import { View } from 'react-native';
import { Subheading, TextInput } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { StandardPicker } from '../shared/StandardPicker';

interface IProps {
    tableName: string
    tableHeaders: string[]
    onFilter: (filterText: string, filterColumn: string) => void
    onClose: () => void
}

export const SqlTableFilterModal = (props: IProps) => {
    const [filterText, setFilterText] = useState<string>("");
    const [filterColumn, setFilterColumn] = useState<string>(props.tableHeaders[0]);

    const onConfirmFilter = useCallback(() => {
        props.onFilter(filterText, filterColumn);
    }, [filterText, filterColumn, props.onFilter])

    const items = props.tableHeaders.map((item) => {
        return { label: item, value: item }
    });

    return (
        <Dialog
            visible={true}
            title="Filter Table"
            buttons={(
                <ModalButtons
                    cancelAction={props.onClose}
                    confirmAction={onConfirmFilter}
                    confirmText='Query' />
            )}>
            <View>
                <Subheading>Filter table by choosing a column name and typing in filter text</Subheading>
                <TextInput
                    autoComplete='off'
                    label="Value"
                    value={filterText}
                    onChangeText={setFilterText}
                />
                <StandardPicker
                    items={items}
                    onValueChange={setFilterColumn}
                    label={"Column"}
                    value={filterColumn}
                />
            </View>
        </Dialog >
    )
}
