import React, { useCallback, useState } from 'react'
import { View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { ReorderSectionsModal } from './ReorderSectionsModal';
import { ReorderSubsectionsModal } from './ReorderSubsectionsModal';
import { ReorderOptionsModal } from './ReorderOptionsModal';
import { ReorderValuesModal } from './ReorderValuesModal';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../../shared/ModalButtons';

export enum ReorderType {
    UnSelected = "0",
    Sections = "1",
    Subsections = "2",
    Options = "3",
    Values = "4",
}

interface IProps {
    disabled: boolean
    scriptId: number
    onClose: () => void
    onSave: (type: ReorderType) => void
}

export const ReorderItemsParentModal = ({ disabled, scriptId, onClose, onSave }: IProps) => {
    const [value, setValue] = useState<string>(ReorderType.UnSelected);
    const [openedModal, setOpenedModal] = useState<string>(ReorderType.UnSelected);

    const onCancel = useCallback(() => onClose(), [])
    const onDone = useCallback(() => {
        setOpenedModal(value)
    }, [value])

    return (
        <View>
            <Dialog
                visible={openedModal === ReorderType.UnSelected}
                title={"Reorder items"}
                buttons={(
                    <ModalButtons
                        confirmDisabled={disabled || value === ReorderType.UnSelected}
                        confirmText={"Done"}
                        cancelAction={onCancel}
                        confirmAction={onDone} />
                )}
                onTouchOutside={onClose}>
                <View>
                    <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
                        <RadioButton.Item label="Sections" value={ReorderType.Sections} />
                        <RadioButton.Item label="Subsections" value={ReorderType.Subsections} />
                        <RadioButton.Item label="Options" value={ReorderType.Options} />
                        <RadioButton.Item label="Values" value={ReorderType.Values} />
                    </RadioButton.Group>
                </View>
            </Dialog>
            {
                openedModal === ReorderType.Sections && (
                    <ReorderSectionsModal
                        scriptId={scriptId}
                        disabled={disabled}
                        onCancel={() => onClose()}
                        onSave={async () => { 
                            await onSave(ReorderType.Sections);
                        }}
                    />
                )
            }
            {
                openedModal === ReorderType.Subsections && (
                    <ReorderSubsectionsModal
                        scriptId={scriptId}
                        disabled={disabled}
                        onCancel={() => onClose()}
                        onSave={async () => {
                            await onSave(ReorderType.Subsections);
                        }}
                    />
                )
            }
            {
                openedModal === ReorderType.Options && (
                    <ReorderOptionsModal
                        scriptId={scriptId}
                        disabled={disabled}
                        onCancel={() => onClose()}
                        onSave={async () => {
                            await onSave(ReorderType.Options);
                        }}
                    />
                )
            }
            {
                openedModal === ReorderType.Values && (
                    <ReorderValuesModal
                        scriptId={scriptId}
                        disabled={disabled}
                        onCancel={() => onClose()}
                        onSave={async () => {
                            await onSave(ReorderType.Values);
                        }}
                    />
                )
            }
        </View >
    )
}
