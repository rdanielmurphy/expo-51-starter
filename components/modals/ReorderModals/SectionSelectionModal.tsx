import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Headline, RadioButton } from 'react-native-paper';
import { SQL_GET_SECTIONS } from '../../../lib/sqlCommands';
import { IReorderItemProps } from './ReorderItemsModal';
import { ModalButtons } from '../../shared/ModalButtons';

interface IProps {
    scriptId: number
    onCancel: () => void,
    onSelection: (id: number) => void
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean | undefined) => Promise<any[]>
}

export const SectionSelectionModal = ({ scriptId, onCancel, onSelection, getAllAsync }: IProps) => {
    const [sections, setSections] = useState<IReorderItemProps[]>([]);
    const [value, setValue] = useState<string>("-1");

    const onCancelClick = useCallback(() => onCancel(), [])
    const onNextClick = useCallback(() => {
        onSelection(parseInt(value));
    }, [onSelection, value]);

    useEffect(() => {
        const getData = async () => {
            const sections = await getAllAsync(SQL_GET_SECTIONS(scriptId));
            setSections(sections.sort((a: any, b: any) => a.number - b.number).map((v) => ({
                id: v.id,
                text: v.name,
            } as IReorderItemProps)));
        }

        getData();
    }, [getAllAsync])

    return (
        <View>
            <Headline>Sections</Headline>
            <View>
                <ScrollView style={styles.scrollView}>
                    <View>
                        <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
                            {sections.map((section) => (
                                <RadioButton.Item key={section.id} label={section.text} value={section.id.toString()} />
                            ))}
                        </RadioButton.Group>
                    </View>
                </ScrollView>
                <View>
                    <ModalButtons
                        confirmDisabled={value === "-1"}
                        confirmText={"Done"}
                        cancelAction={onCancelClick}
                        confirmAction={onNextClick} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 0,
        height: "90%",
    },
});

