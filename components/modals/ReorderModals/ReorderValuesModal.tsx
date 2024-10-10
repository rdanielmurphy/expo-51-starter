import React, { useCallback, useState } from 'react'
import { IReorderItemProps, ReorderItemsModal } from './ReorderItemsModal';
import { SQL_GET_VALUES, SQL_UPDATE_VALUE_NUMBER } from '../../../lib/sqlCommands';
import * as SQLite from 'expo-sqlite/next';
import { Modal, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { SectionSelectionModal } from './SectionSelectionModal';
import { SubsectionSelectionModal } from './SubsectionSelectionModal';
import { OptionSelectionModal } from './OptionSelectionModal';
import { useDbContext } from '../../../contexts/DbContext';

interface IProps {
    disabled: boolean
    scriptId: number
    onCancel: () => void
    onSave: () => void
}

export const ReorderValuesModal = (props: IProps) => {
    const { execAsync, getAllAsync } = useDbContext();
    const [values, setValues] = useState<IReorderItemProps[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [sectionId, setSectionId] = useState<number>();
    const [subsectionId, setSubsectionId] = useState<number>();
    const [optionId, setOptionId] = useState<number>();
    const [showSectionSelection, setShowSectionSelection] = useState<boolean>(true);
    const [showSubsectionSelection, setShowSubsectionSelection] = useState<boolean>(false);
    const [showOptionSelection, setShowOptionSelection] = useState<boolean>(false);

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = useCallback(async (reorderedItems: IReorderItemProps[]) => {
        setIsSaving(true);

        try {
            for (let i = 0; i < reorderedItems.length; i++) {
                const item = reorderedItems[i];
                await execAsync(SQL_UPDATE_VALUE_NUMBER(item.id!, i + 1));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            props.onSave();
        }
    }, [execAsync]);

    const getValues = useCallback(async (optionId: number) => {
        const values = await getAllAsync(SQL_GET_VALUES(optionId));
        setValues(values.sort((a, b) => a.number - b.number).map((v) => ({
            id: v.id,
            text: v.text && v.text.length > 0 ? v.text : "[BLANK]",
        } as IReorderItemProps)));
    }, [getAllAsync]);

    const onSectionSelection = useCallback(async (sectionId: number) => {
        setSectionId(sectionId);
        setShowSubsectionSelection(true);
        setShowSectionSelection(false);
    }, []);

    const onSubsectionSelection = useCallback(async (subsectionId: number) => {
        setSubsectionId(subsectionId);
        setShowOptionSelection(true);
        setShowSubsectionSelection(false);
    }, []);

    const onOptionSelection = useCallback(async (optionId: number) => {
        await getValues(optionId);
        setOptionId(optionId);
        setShowOptionSelection(false);
    }, [getValues]);

    return (
        <>
            {(showSectionSelection || showSubsectionSelection || showOptionSelection) && (
                <Portal>
                    <Modal visible={true} onDismiss={onCancel} contentContainerStyle={styles.containerStyle}>
                        {showSectionSelection && <SectionSelectionModal
                            getAllAsync={getAllAsync}
                            scriptId={props.scriptId}
                            onCancel={onCancel}
                            onSelection={onSectionSelection}
                        />}
                        {showSubsectionSelection && sectionId && <SubsectionSelectionModal
                            getAllAsync={getAllAsync}
                            sectionId={sectionId}
                            onCancel={onCancel}
                            onSelection={onSubsectionSelection}
                        />}
                        {showOptionSelection && subsectionId && <OptionSelectionModal
                            getAllAsync={getAllAsync}
                            subsectionId={subsectionId}
                            onCancel={onCancel}
                            onSelection={onOptionSelection}
                        />}
                    </Modal>
                </Portal>
            )}
            {!showSectionSelection && !showSubsectionSelection && !showOptionSelection && optionId && (
                <ReorderItemsModal
                    items={values}
                    disabled={isSaving || props.disabled}
                    title={'Reorder values'}
                    onCancel={onCancel}
                    onSave={onSubmit}
                />
            )}
        </>
    )
}

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    scrollView: {
        marginHorizontal: 0,
    },
});