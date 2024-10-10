
import * as DocumentPicker from 'expo-document-picker';
import React from 'react'
import PickerButton from './PickerButton';

function InspectITPickerButton({ onPick }: { onPick: (doc: DocumentPicker.DocumentPickerResult) => void }) {
    return (
        <PickerButton title="Import an InspectIT DB" onPick={onPick} />
    );
}

export default InspectITPickerButton;