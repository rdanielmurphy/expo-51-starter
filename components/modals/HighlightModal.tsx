import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Button, Headline, Modal, Portal } from 'react-native-paper';
import Slider from "react-native-a11y-slider";
import { useDispatch, useSelector } from 'react-redux';
import { HighlightModalState } from '../../redux/reducers/hightlightModal';
import { updateHighlightModal } from '../../redux/actions';
import { SQL_UPDATE_VALUE_HIGHLIGHT } from '../../lib/sqlCommands';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    onSave: (valueId: number, color: number) => void
}

interface IColorPickerProps {
    onChange: (colorNumber: number) => void
}

const ColorPicker = ({ onChange }: IColorPickerProps) => {
    const [red, setRed] = useState(255);
    const [green, setGreen] = useState(255);
    const [blue, setBlue] = useState(0);

    const onRedChange = useCallback((values: number[]) => {
        setRed(values[0]);
    }, []);

    const onGreenChange = useCallback((values: number[]) => {
        setGreen(values[0]);
    }, []);

    const onBlueChange = useCallback((values: number[]) => {
        setBlue(values[0]);
    }, []);

    useEffect(() => {
        let colorNumber = red;
        colorNumber = (colorNumber << 8) + green;
        colorNumber = (colorNumber << 8) + blue;
        onChange(colorNumber);
    }, [red, green, blue, onChange]);

    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 24 }}>Red:</Text>
                <Slider
                    style={{ flex: 1 }}
                    min={0}
                    max={255}
                    values={[red]}
                    onChange={onRedChange}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                />
                <Text>{red}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 10 }}>Green:</Text>
                <Slider
                    style={{ flex: 1 }}
                    min={0}
                    max={255}
                    values={[green]}
                    onChange={onGreenChange}
                />
                <Text>{green}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 20 }}>Blue:</Text>
                <Slider
                    style={{ flex: 1 }}
                    min={0}
                    max={255}
                    values={[blue]}
                    onChange={onBlueChange}
                />
                <Text>{blue}</Text>
            </View>
            <View
                style={{
                    marginTop: 20,
                    width: '100%',
                    height: 50,
                    backgroundColor: `rgb(${red}, ${green}, ${blue})`,
                }}
            />
        </View>
    );
};

export const HighlightModal = (props: IProps) => {
    const { ready, execAsync } = useDbContext();
    const [color, setColor] = useState<number>(16776960);
    const dispatch = useDispatch();
    const highlightModalState: HighlightModalState = useSelector((state: any) => state.highlightModalState);

    const onCancel = useCallback(() => updateHighlightModal({ show: false })(dispatch), []);
    const onSubmit = useCallback(() => {
        if (ready && highlightModalState.id) {
            execAsync(SQL_UPDATE_VALUE_HIGHLIGHT(highlightModalState.id, color));
            props.onSave(highlightModalState.id, color);
        }
        updateHighlightModal({ show: false })(dispatch);
    }, [color, highlightModalState.id, ready, execAsync]);

    return (
        <Portal>
            <Modal visible={highlightModalState.show === true} onDismiss={onCancel} contentContainerStyle={styles.containerStyle}>
                <Headline>Highlight</Headline>

                <View>
                    <View>
                        <View>
                            <ColorPicker onChange={setColor} />
                        </View>

                        <View style={styles.footer}>
                            <View style={styles.buttons}>
                                <Button mode="text" onPress={onCancel}>Cancel</Button>
                                <Button mode="text" onPress={onSubmit}>Done</Button>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    footer: {
        marginTop: 20,
        height: 50
    }
});
