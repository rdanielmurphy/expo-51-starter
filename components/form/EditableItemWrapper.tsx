import React from 'react';
import { View, Text } from 'react-native';
import EditItemMenu from './CopyDeleteItemMenu';

interface IProps {
    name: string
    type: string
    width?: number
    groupId?: number
    onCopy: () => void
    onDelete: () => void
    onEditName: (newName: string) => void
    onEditOptions?: () => void
    onEditCommentGroupName?: (commentGroupId: number) => void
    onEditCommentGroupComments?: (commentGroupId: number, commentGroupName?: string) => void
}

const EditableItemWrapper = (props: IProps) => (
    <View style={{ flexDirection: 'row' }}>
        <Text style={{
            marginLeft: 5,
            minWidth: props.width ? props.width - 75 : 100,
            flex: 1,
            alignContent: "center",
            alignSelf: "center",
            fontStyle: props.name ? "normal" : "italic",
        }}>{props.name ? props.name : `[${props.type}]`}</Text>
        <View style={{ justifyContent: 'center' }}>
            <EditItemMenu
                type={props.type}
                name={props.name}
                groupId={props.groupId}
                onCopy={props.onCopy}
                onDelete={props.onDelete}
                onEditName={props.onEditName}
                onEditOptions={props.onEditOptions}
                onEditCommentGroupName={props.onEditCommentGroupName}
                onEditCommentGroupComments={props.onEditCommentGroupComments}
            />
        </View>
    </View >
);

export default EditableItemWrapper;