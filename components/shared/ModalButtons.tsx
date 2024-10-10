import React from 'react'
import { View } from 'react-native';
import { Button } from 'react-native-paper';

export interface IModalButtonsProps {
    cancelText?: string
    confirmText?: string
    cancelDisabled?: boolean
    confirmDisabled?: boolean
    cancelAction: () => void
    confirmAction: () => void
}

export const ModalButtons = ({
    cancelText = "Cancel",
    confirmText = "Confirm",
    cancelDisabled = false,
    confirmDisabled = false,
    cancelAction,
    confirmAction
}: IModalButtonsProps) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button mode="contained-tonal" disabled={cancelDisabled} onPress={cancelAction} style={{ width: "45%" }}>{cancelText}</Button>
        <Button mode="contained" disabled={confirmDisabled} onPress={confirmAction} style={{ width: "45%" }}>{confirmText}</Button>
    </View>
)