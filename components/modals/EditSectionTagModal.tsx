import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import SectionTagDropdown, { SectionTag } from '../shared/SectionTagDropdown';
import { useDbContext } from '../../contexts/DbContext';
import { SQL_GET_SECTION } from '../../lib/sqlCommands';

interface IProps {
    sectionId: number
    onClose: () => void
    onSubmit: (newTag?: SectionTag) => void
}

export const EditSectionTagModal = (props: IProps) => {
    const [name, setName] = useState<SectionTag | undefined>();
    const [tag, setTag] = useState<SectionTag | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const { getFirstAsync, ready } = useDbContext();

    useEffect(() => {
        if (ready) {
            const getTag = async () => {
                const item = await getFirstAsync(SQL_GET_SECTION(props.sectionId));
                if (item) {
                    const theTag = item.tag;
                    setTag((theTag && theTag.length > 0) ? theTag : SectionTag.None);
                    setName(item.name);
                }
                setLoading(false);
            }
            getTag();
        }
    }, [ready, getFirstAsync]);

    const onClose = useCallback(() => props.onClose(), []);

    const onSubmit = useCallback(() => {
        props.onSubmit(tag);
    }, [props.onSubmit, tag]);

    return (
        <Dialog
            visible={true}
            title={`Edit ${name} tag`}
            buttons={(
                <ModalButtons
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <View>
                <SectionTagDropdown
                    disabled={loading}
                    onChange={setTag}
                    value={tag}
                />
            </View>
        </Dialog>
    )
}