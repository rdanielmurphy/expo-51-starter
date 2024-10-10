
import * as DocumentPicker from 'expo-document-picker';
import React from 'react'
import PickerButton from './PickerButton';

function IntraSpectPickerButton({ onPick }: { onPick: (doc: DocumentPicker.DocumentPickerResult) => void }) {
    return (
        <PickerButton title="Import an IntraSpect DB" onPick={onPick} />
    );
}

export default IntraSpectPickerButton;