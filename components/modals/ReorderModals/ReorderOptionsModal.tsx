import React, { useCallback, useState } from 'react'
import { IReorderItemProps, ReorderItemsModal } from './ReorderItemsModal';
import { SQL_GET_OPTIONS, SQL_UPDATE_OPTION_NUMBER } from '../../../lib/sqlCommands';
import { Modal, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { SectionSelectionModal } from './SectionSelectionModal';
import { SubsectionSelectionModal } from './SubsectionSelectionModal';
import { useDbContext } from '../../../contexts/DbContext';

interface IProps {
    disabled: boolean
    scriptId: number
    onCancel: () => void
    onSave: () => void
}

export const ReorderOptionsModal = (props: IProps) => {
    const { execAsync, getAllAsync } = useDbContext();
    const [options, setOptions] = useState<IReorderItemProps[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [sectionId, setSectionId] = useState<number>();
    const [subsectionId, setSubsectionId] = useState<number>();
    const [showSectionSelection, setShowSectionSelection] = useState<boolean>(true);
    const [showSubsectionSelection, setShowSubsectionSelection] = useState<boolean>(false);

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = useCallback(async (reorderedItems: IReorderItemProps[]) => {
        setIsSaving(true);

        try {
            for (let i = 0; i < reorderedItems.length; i++) {
                const item = reorderedItems[i];
                await execAsync(SQL_UPDATE_OPTION_NUMBER(item.id!, i + 1));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            props.onSave();
        }
    }, [execAsync]);

    const getOptions = useCallback(async (subsectionId: number) => {
        const options = await getAllAsync(SQL_GET_OPTIONS(subsectionId));
        setOptions(options.sort((a, b) => a.number - b.number).map((v) => ({
            id: v.id,
            text: v.name && v.name.length > 0 ? v.name : "[BLANK]",
        } as IReorderItemProps)));
    }, [getAllAsync]);

    const onSectionSelection = useCallback(async (sectionId: number) => {
        setSectionId(sectionId);
        setShowSubsectionSelection(true);
        setShowSectionSelection(false);
    }, []);

    const onSubsectionSelection = useCallback(async (subsectionId: number) => {
        await getOptions(subsectionId);
        setSubsectionId(subsectionId);
        setShowSubsectionSelection(false);
    }, [getOptions]);

    return (
        <>
            {(showSectionSelection || showSubsectionSelection) && (
                <Portal>
                    <Modal visible={true} contentContainerStyle={styles.containerStyle}>
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
                    </Modal>
                </Portal>
            )}
            {!showSectionSelection && !showSubsectionSelection && subsectionId && (
                <ReorderItemsModal
                    items={options}
                    disabled={isSaving || props.disabled}
                    title={'Reorder options'}
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