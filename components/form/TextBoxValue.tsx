import * as React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SQL_UPDATE_TEXT_VALUE } from '../../lib/sqlCommands';
import { escapeString } from '../../lib/databaseDataHelper';

interface IProps {
    size: 'small' | 'large'
    valueId: number
    text: string
    userText: string
    onLongPress: () => void
    onUpdate: (sql: string, id: number, newValue: string) => void
}

const TextBoxValue = (props: IProps) => {
    const screen = Dimensions.get("screen");
    const width = props.size === "small" ? 200 : Math.max(screen.width - 10, 600);
    const [text, setText] = React.useState<string>(props.userText);

    const onTextChange = (text: string) => {
        setText(text);
        props.onUpdate(SQL_UPDATE_TEXT_VALUE(props.valueId, escapeString(text)), props.valueId, text);
    };

    return (
        <View style={{ flexDirection: 'row', minWidth: width, padding: 8 }}>
            <View style={{}}>
                <View style={{ marginBottom: 4, marginLeft: 4 }}>
                    <Text onLongPress={props.onLongPress}>{props.text}</Text>
                </View>
                <TextInput
                    value={text}
                    onChangeText={onTextChange}
                    style={{ marginLeft: 5, minWidth: width }}
                />
            </View>
        </View>
    )
}

export default React.memo(TextBoxValue, (prevProps: IProps, nextProps: IProps) => {
    return prevProps.valueId === nextProps.valueId &&
        prevProps.userText === nextProps.userText &&
        prevProps.text === nextProps.text &&
        prevProps.size === nextProps.size;
});