import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Text, IconButton, Title } from 'react-native-paper';
import { IComment, ICommentGroup } from '../../lib/defaultComments';
import { SQL_DELETE_COMMENT, SQL_UPDATE_COMMENT_NUMBER, SQL_UPDATE_COMMENT_GROUP } from '../../lib/sqlCommands';
import { DeleteCommentModal } from './DeleteCommentModal';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    commentGroup: ICommentGroup
    onCancel: () => void
    onSave: () => void
}

export const EditCommentsModal = (props: IProps) => {
    const { ready, execAsync } = useDbContext();
    const [deletedCommentIds, setDeletedCommentIds] = useState<number[]>([]);
    const [comments, setComments] = useState<IComment[]>([]);
    const [name, setName] = useState<string>("");
    const screen = Dimensions.get("screen");
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectCommentForDelete, setSelectedCommentForDelete] = useState<IComment | null>(null);

    const onCancel = useCallback(() => {
        props.onCancel();
    }, []);

    const onSubmit = useCallback(async () => {
        for (let i = 0; i < deletedCommentIds.length; i++) {
            const id = deletedCommentIds[i];
            await execAsync(SQL_DELETE_COMMENT(id));
        }
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            await execAsync(SQL_UPDATE_COMMENT_NUMBER(comment.id!, i + 1));
        }
        await execAsync(SQL_UPDATE_COMMENT_GROUP(props.commentGroup.id!, name));
        props.onSave();
    }, [comments, deletedCommentIds, name, execAsync, props.commentGroup.id]);

    useEffect(() => {
        setComments(props.commentGroup.comments);
        setName(props.commentGroup.description);
    }, [props.commentGroup.id]);

    const renderItem = ({ item, drag, isActive }: RenderItemParams<IComment>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.rowItem,
                        { backgroundColor: isActive ? "lightgrey" : "white" },
                    ]}
                >
                    <View style={{ width: screen.width / 2, display: "flex", justifyContent: "space-between", flexDirection: 'row' }}>
                        <IconButton
                            style={{ width: 50, flexBasis: "auto", flexShrink: 0, flexGrow: 0 }}
                            icon="menu"
                        />
                        <Text style={{ flexBasis: "auto", flexShrink: 0, flexGrow: 1, alignSelf: "center", width: "100%" }}>{item.name}</Text>
                        <IconButton
                            style={{ width: 50, flexBasis: "auto", flexShrink: 0, flexGrow: 0 }}
                            icon="delete"
                            onPress={() => {
                                setSelectedCommentForDelete(item);
                                setShowDeleteModal(true);
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <Dialog
            visible={true}
            title={"Edit Comment List"}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready || name.length === 0}
                    confirmText={"Save"}
                    cancelAction={onCancel}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onCancel}>
            <View>
                <View>
                    <GestureHandlerRootView style={{ width: '100%' }}>
                        <DraggableFlatList
                            ListHeaderComponent={<View>
                                <View style={styles.formComponent}>
                                    <TextInput
                                        autoComplete='off'
                                        multiline
                                        numberOfLines={2}
                                        label="Name"
                                        value={name}
                                        onChangeText={text => setName(text)}
                                    />
                                </View>
                                <Title>Comments</Title>
                            </View>}
                            data={comments}
                            onDragEnd={({ data }) => setComments(data)}
                            keyExtractor={(item) => item.id?.toString() || item.number.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={{ flexGrow: 1 }}
                            ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                        />
                    </GestureHandlerRootView>
                </View>
            </View>
            {showDeleteModal && selectCommentForDelete && selectCommentForDelete.id &&
                <DeleteCommentModal
                    commentId={selectCommentForDelete.id}
                    commentTitle={selectCommentForDelete.name}
                    onCancel={() => setShowDeleteModal(false)}
                    onYes={() => {
                        setDeletedCommentIds([...deletedCommentIds, selectCommentForDelete.id!])
                        if (props.commentGroup) {
                            setComments(comments.filter(c => c.id !== selectCommentForDelete.id));
                        }
                        setShowDeleteModal(false);
                        setSelectedCommentForDelete(null);
                    }}
                />}
        </Dialog>
    )
}

const styles = StyleSheet.create({
    comment: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
    scrollView: {
        marginHorizontal: 0,
    },
    button: {
        margin: 10,
        width: 400,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
    formComponent: {
        padding: 10
    },
    rowItem: {
        width: "100%",
        paddingRight: 8,
        display: "flex"
    },
});
