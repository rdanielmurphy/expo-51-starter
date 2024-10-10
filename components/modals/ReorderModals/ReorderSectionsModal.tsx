import React, { useCallback, useEffect, useState } from 'react'
import { IReorderItemProps, ReorderItemsModal } from './ReorderItemsModal';
import { SQL_GET_SECTIONS, SQL_UPDATE_SECTION_NUMBER } from '../../../lib/sqlCommands';
import { useDbContext } from '../../../contexts/DbContext';

interface IProps {
    disabled: boolean
    scriptId: number
    onCancel: () => void
    onSave: () => void
}

export const ReorderSectionsModal = (props: IProps) => {
    const { ready, execAsync, getAllAsync } = useDbContext();
    const [sections, setSections] = useState<IReorderItemProps[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = useCallback(async (reorderedItems: IReorderItemProps[]) => {
        setIsSaving(true);

        try {
            for (let i = 0; i < reorderedItems.length; i++) {
                const item = reorderedItems[i];
                await execAsync(SQL_UPDATE_SECTION_NUMBER(item.id, i + 1));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            props.onSave();
        }
    }, [execAsync]);

    useEffect(() => {
        const getData = async () => {
            const sections = await getAllAsync(SQL_GET_SECTIONS(props.scriptId));
            setSections(sections.sort((a, b) => a.number - b.number).map((v) => ({
                id: v.id,
                text: v.name,
            } as IReorderItemProps)));
        }

        if (ready) {
            getData();
        }
    }, [props.scriptId, ready]);

    return (
        <ReorderItemsModal
            items={sections}
            disabled={isSaving || props.disabled}
            title={'Reorder Sections'}
            onCancel={onCancel}
            onSave={onSubmit}
        />)
}
