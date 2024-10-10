import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Surface } from 'react-native-paper';
import { SQL_DELETE_VALUE_BY_ID, SQL_INSERT_NEW_VALUE_TO_TEMPLATE, SQL_UPDATE_VALUE_COMMENT_GROUP, SQL_UPDATE_VALUE_TEXT } from '../../lib/sqlCommands';
import { TYPE_MAP } from '../../lib/types';
import EditableItemWrapper from './EditableItemWrapper';

interface IProps {
    value: any;
    onUpdate: (sql: string, refresh?: boolean) => void;
    navigate: (path: string, params: any) => any;
}

const EditableTextBoxValue = (props: IProps) => {
    const screen = Dimensions.get("window");
    const theValue = props.value;
    const [text, setText] = React.useState<string>(theValue.text);
    const width = Math.max(screen.width - 20);

    const styles = StyleSheet.create({
        bigSurface: {
            width: width,
            marginTop: 4,
            marginRight: 4,
            marginLeft: 4,
        },
        surface: {
            width: 180,
            marginTop: 4,
            marginRight: 4,
            marginLeft: 4,
        },
    });

    const onTextChange = (text: string) => {
        setText(text);
        props.onUpdate(SQL_UPDATE_VALUE_TEXT(theValue.id, text));
    };

    const onDelete = React.useCallback(() => {
        props.onUpdate(SQL_DELETE_VALUE_BY_ID(theValue.id), true);
    }, [theValue]);

    const onCopy = React.useCallback(() => {
        props.onUpdate(SQL_INSERT_NEW_VALUE_TO_TEMPLATE(
            theValue.type, theValue.isNa, theValue.number, theValue.text, theValue.script_id,
            theValue.section_id, theValue.subsection_id, theValue.option_id,
            theValue.isHighlighted, theValue.highLightColor), true);
    }, [theValue]);

    const onEditCommentGroupName = React.useCallback((id: number) => {
        props.onUpdate(SQL_UPDATE_VALUE_COMMENT_GROUP(theValue.id, id), true);
    }, [theValue]);

    const onEditCommentGroupComments = React.useCallback((commentGroupId: number, commentGroupName?: string) => {
        props.navigate("EditComments", { id: commentGroupId, name: commentGroupName });
    }, [props.navigate]);

    return (
        <Surface elevation={1} style={theValue.type === 1 ? styles.surface : styles.bigSurface}>
            <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
                <EditableItemWrapper
                    onCopy={onCopy}
                    onDelete={onDelete}
                    onEditName={onTextChange}
                    onEditCommentGroupName={onEditCommentGroupName}
                    onEditCommentGroupComments={onEditCommentGroupComments}
                    groupId={theValue.commentListNumber}
                    name={text}
                    width={theValue.type === 1 ? undefined : width}
                    type={TYPE_MAP.get(theValue.type)!} />
            </View>
        </Surface>
    )
}

export default EditableTextBoxValue;