import React, { useCallback, useState } from 'react'
import { IReorderItemProps, ReorderItemsModal } from './ReorderItemsModal';
import { SQL_GET_SUBSECTIONS, SQL_UPDATE_SUBSECTION_NUMBER } from '../../../lib/sqlCommands';
import { Modal, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { SectionSelectionModal } from './SectionSelectionModal';
import { useDbContext } from '../../../contexts/DbContext';

interface IProps {
    disabled: boolean
    scriptId: number
    onCancel: () => void
    onSave: () => void
}

export const ReorderSubsectionsModal = (props: IProps) => {
    const { execAsync, getAllAsync } = useDbContext();
    const [subsections, setSubsections] = useState<IReorderItemProps[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showSectionSelection, setShowSectionSelection] = useState<boolean>(true);

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = useCallback(async (reorderedItems: IReorderItemProps[]) => {
        setIsSaving(true);

        try {
            for (let i = 0; i < reorderedItems.length; i++) {
                const item = reorderedItems[i];
                await execAsync(SQL_UPDATE_SUBSECTION_NUMBER(item.id!, i + 1));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            props.onSave();
        }
    }, [execAsync]);

    const getSubsections = useCallback(async (sectionId: number) => {
        const subsections = await getAllAsync(SQL_GET_SUBSECTIONS(sectionId));
        setSubsections(subsections.sort((a, b) => a.number - b.number).map((v) => ({
            id: v.id,
            text: v.name && v.name.length > 0 ? v.name : "[BLANK]",
        } as IReorderItemProps)));
    }, [getAllAsync]);

    const onSectionSelection = useCallback(async (sectionId: number) => {
        await getSubsections(sectionId);
        setShowSectionSelection(false);
    }, [getSubsections]);

    return showSectionSelection ? (
        <Portal>
            <Modal visible={true} onDismiss={onCancel} contentContainerStyle={styles.containerStyle}>
                <SectionSelectionModal
                    scriptId={props.scriptId}
                    onCancel={onCancel}
                    onSelection={onSectionSelection}
                    getAllAsync={getAllAsync}
                />
            </Modal>
        </Portal>
    ) : (
        <ReorderItemsModal
            items={subsections}
            disabled={isSaving || props.disabled}
            title={'Reorder Subsections'}
            onCancel={onCancel}
            onSave={onSubmit}
        />
    );
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
