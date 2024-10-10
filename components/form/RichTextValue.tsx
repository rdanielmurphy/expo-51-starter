import * as React from 'react';
import { View, Dimensions } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { RichTextModal } from '../modals/RichTextModal';
import { WebView } from 'react-native-webview';
import { updateInsertCommentModal } from '../../redux/actions';
import { useDispatch } from 'react-redux';

interface IProps {
    value: any
    column?: string
    onUpdate: (sql: string, id: number, newValue: string) => void
    sqlMethod: (id: number, text: string) => string
}

const RichTextValue = (props: IProps) => {
    const dispatch = useDispatch();
    const { colors } = useTheme();
    const screen = Dimensions.get("screen");
    const theValue = props.value;
    const width = Math.max(screen.width - 10);
    const [text, setText] = React.useState<string>(props.column ? theValue[props.column] : theValue.userText);
    const [showModal, setShowMoal] = React.useState(false);

    return (
        <View style={{ flex: 1, justifyContent: "space-between", width: width, marginLeft: 4, marginRight: 4, marginTop: 4 }}>
            <View style={{
                flex: 3,
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 0,
                borderColor: colors.backdrop,
            }}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: text ? "<h2>" + text.split("\n").join("<br />") + "</h2>" : "" }}
                    style={{ height: 150 }}
                />
            </View>
            <View style={{ flex: 1, width: width, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button mode="text" style={{ width: width / 2 }} onPress={() => setShowMoal(true)}>Edit</Button>
                <Button mode="text" style={{ width: width / 2 }} onPress={() => {
                    updateInsertCommentModal({
                        show: true,
                        groupId: theValue.commentListNumber,
                        onCancel: () => { },
                        onDone: (list: string[]) => {
                            let value = text || "";
                            for (let i = 0; i < list.length; i++) {
                                const item = list[i];
                                value += item + "\n";
                            }
                            setText(value);
                            props.onUpdate(props.sqlMethod(theValue.id, value), theValue.id, value);
                        },
                    })(dispatch);
                }}>Add</Button>
            </View>
            {showModal &&
                <RichTextModal
                    onClose={() => setShowMoal(false)}
                    onSubmit={(value: string) => {
                        setShowMoal(false);
                        setText(value);
                        props.onUpdate(props.sqlMethod(theValue.id, value), theValue.id, value);
                    }}
                    title={"Comments"}
                    value={text}
                />
            }
        </View>
    )
}

export default RichTextValue;