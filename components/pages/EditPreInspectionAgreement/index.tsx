import React, { useCallback, useEffect, useState } from 'react'
import { NativeSyntheticEvent, TextInputSelectionChangeEventData, TouchableHighlight, View } from 'react-native';
import { Subheading, Surface, TextInput } from 'react-native-paper';
import { Asset } from 'expo-asset';
import { readAsset } from '../../../lib/files';
import { useDbContext } from '../../../contexts/DbContext';
import { escapeString } from '../../../lib/databaseDataHelper';
import { PreInspectionAgreementItemModal } from './components/PreInspectionAgreementItemModal';

export const EditPreInspectionAgreement = () => {
    const { execAsync, getFirstAsync } = useDbContext();
    const [defaultText, setDefaultText] = useState<string>();
    const [text, setText] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [openItemModal, setOpenItemModal] = useState<boolean>(false);

    useEffect(() => {
        const setup = async () => {
            try {
                const dummyTextAsset = await Asset.fromModule(require('../../../assets/dummy/dummy_default_pre_inspection_agreement.txt'));
                const dummyText = await readAsset(dummyTextAsset);
                setDefaultText(dummyText);

                const res = await getFirstAsync("SELECT * FROM agreement");
                if (res && res.piaText) {
                    setText(res.piaText);
                } else {
                    setText(dummyText);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        setup();
    }, []);

    const handleTextChange = useCallback((v: string) => {
        execAsync(`UPDATE agreement SET piaText = '${escapeString(v)}'`);
        setText(v);
    }, []);

    const insertItemPress = useCallback(() => {
        setOpenItemModal(true);
    }, []);

    const resetToDefaultPress = useCallback(() => {
        setText(defaultText);
        setSelection({ start: 0, end: 0 });
        execAsync(`UPDATE agreement SET piaText = '${escapeString(defaultText ?? "")}'`);
    }, [defaultText]);

    const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
        setSelection({ start: e.nativeEvent.selection.start, end: e.nativeEvent.selection.end })

    const closeItemModal = useCallback(() => {
        setOpenItemModal(false);
    }, []);

    const handleItemModalSubmit = useCallback((item: string) => {
        setOpenItemModal(false);
        
        if (text && text.length > 0) {
            const newText = text.slice(0, selection.start) + item + text.slice(selection.end);
            setText(newText);
        } else {
            setText(item);
        }
    }, [selection, text]);

    return (
        <View style={{ height: '100%' }}>
            <View style={{ margin: 16 }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Surface style={{ width: '50%' }}>
                        <TouchableHighlight
                            onPress={insertItemPress}
                            activeOpacity={0.6}
                            disabled={loading}
                            style={{ height: 50, width: "100%", justifyContent: 'center', alignItems: 'center' }}
                            underlayColor="#DDDDDD">
                            <View>
                                <Subheading>Insert Item</Subheading>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                    <Surface style={{ width: '50%' }}>
                        <TouchableHighlight
                            onPress={resetToDefaultPress}
                            activeOpacity={0.6}
                            disabled={loading}
                            style={{ height: 50, width: "100%", justifyContent: 'center', alignItems: 'center' }}
                            underlayColor="#DDDDDD">
                            <View>
                                <Subheading>Reset To Default</Subheading>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                </View>
                <View style={{ marginBottom: 90 }}>
                    <TextInput
                        autoFocus
                        value={text}
                        selection={selection}
                        onSelectionChange={handleSelectionChange}
                        onChangeText={handleTextChange}
                        selectionColor={"#fff"}
                        cursorColor={"#000"}
                        multiline
                    />
                </View>
            </View>
            {openItemModal && (
                <PreInspectionAgreementItemModal
                    onClose={closeItemModal}
                    onSubmit={handleItemModalSubmit}
                />
            )}
        </View>
    )
}

export default EditPreInspectionAgreement;
