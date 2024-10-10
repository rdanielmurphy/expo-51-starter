
import * as DocumentPicker from 'expo-document-picker';
import React from 'react'
import { TouchableHighlight, View } from 'react-native';
import { Subheading, Surface } from 'react-native-paper';

interface IPickerButtonProps {
    title: string
    onPick: (doc: DocumentPicker.DocumentPickerResult) => void
}

function PickerButton({ title, onPick }: IPickerButtonProps) {
    return (
        <Surface>
            <TouchableHighlight
                onPress={async () => {
                    const result = await DocumentPicker.getDocumentAsync(
                        {
                            copyToCacheDirectory: false,
                        },
                    );
                    if (result.canceled === false) {
                        onPick && onPick(result);
                    }
                }}
                activeOpacity={0.6}
                style={{ height: 50, width: "100%", justifyContent: 'center', alignItems: 'center' }}
                underlayColor="#DDDDDD">
                <View>
                    <Subheading>{title}</Subheading>
                </View>
            </TouchableHighlight>
        </Surface>
    );
}

export default PickerButton;