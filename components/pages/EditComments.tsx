import React, { memo, useCallback, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Headline, IconButton, ProgressBar } from 'react-native-paper';
import {
    SQL_DELETE_COMMENT,
    SQL_DELETE_COMMENT_GROUP,
    SQL_GET_COMMENTS,
    SQL_GET_COMMENT_GROUP_BY_NUMBER,
    SQL_UPDATE_COMMENT_GROUP,
    SQL_UPDATE_COMMENT_NUMBER,
} from '../../lib/sqlCommands';
import { addEditCommentModal, updateSnackbar } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteItemModal } from '../modals/DeleteItemModal';
import { useDbContext } from '../../contexts/DbContext';
import { AddEditCommentModalState } from '../../redux/reducers/addEditCommentModal';
import { AddEditCommentModal } from '../modals/AddEditCommentModal';
import { IComment } from '../../lib/defaultComments';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { EditItemNameModal } from '../modals/EditItemNameModal';

export const EditCommentsScreenHeader = (props: any) => {
    const dispatch = useDispatch();

    const onAddPress = useCallback(() => {
        addEditCommentModal({ show: true, mode: 'add' })(dispatch);
    }, []);

    const onDeletePress = useCallback(() => {
        addEditCommentModal({ show: true, mode: 'delete' })(dispatch);
    }, []);

    const onEditPress = useCallback(() => {
        addEditCommentModal({ show: true, mode: 'edit' })(dispatch);
    }, []);

    return (
        <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{props.children}</Text>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                <IconButton
                    style={{ width: 40 }}
                    icon="pencil"
                    onPress={onEditPress}
                />
                <IconButton
                    style={{ width: 40 }}
                    icon="delete"
                    onPress={onDeletePress}
                />
                <IconButton
                    style={{ width: 40 }}
                    icon="plus-circle"
                    onPress={onAddPress}
                />
            </View>
        </View>
    )
}

interface ICommentListItemProps {
    id: number
    name: string
    onEditPress: () => void
    onDeletePress: () => void
}

const CommentListItem = memo(({ name, onEditPress, onDeletePress }: ICommentListItemProps) => {
    const screen = Dimensions.get("screen");

    return (
        <View style={{ height: 30, width: screen.width / 2, display: "flex", justifyContent: "space-between", flexDirection: 'row' }}>
            <IconButton
                style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                icon="menu"
            />
            <Text style={{ flexBasis: "auto", flexShrink: 0, flexGrow: 1, alignSelf: "center", width: "100%" }}>
                {name}
            </Text>
            <IconButton
                onPress={onEditPress}
                style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                icon="pencil"
            />
            <IconButton
                onPress={onDeletePress}
                style={{ height: 30, width: 50, flexBasis: "auto", alignSelf: "center", flexShrink: 0, flexGrow: 0 }}
                icon="delete"
            />
        </View>
    );
}, (prevProps: ICommentListItemProps, nextProps: ICommentListItemProps) => {
    return prevProps.id === nextProps.id && prevProps.name === nextProps.name;
});

export const EditCommentsScreen = ({ navigation: { navigate }, route }: any) => {
    const addEditComment: AddEditCommentModalState = useSelector((state: any) => state.addEditCommentModalState);
    const { ready, execAsync, getAllAsync, getFirstAsync } = useDbContext();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>();
    const [showEditModal, setShowEditModal] = useState<boolean>();
    const [commentToEdit, setCommentToEdit] = useState<IComment>();
    const [commentToDelete, setCommentToDelete] = useState<IComment>();
    const [nextCommentNumber, setNextCommentNumber] = useState<number>(1);
    const [groupName, setGroupName] = useState<string>(route.params.name);
    const [comments, setComments] = useState<IComment[]>([]);
    const [refreshCounter, setRefreshCounter] = useState<number>(1);
    const [groupId, setGroupId] = useState<number>(-1);

    const groupNumber = route.params.id;

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                let maxNumber = 0;
                const group = await getFirstAsync(SQL_GET_COMMENT_GROUP_BY_NUMBER(groupNumber));
                setGroupId(group.id);
                const commentsResult = await getAllAsync(SQL_GET_COMMENTS(group.id));
                let list: IComment[] = []
                commentsResult.forEach((g) => {
                    list.push({
                        id: g.id,
                        name: g.name,
                        number: g.number,
                        text: g.text,
                    });
                    maxNumber = Math.max(maxNumber, g.number);
                })
                list.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    return aName.localeCompare(bName);
                })
                setComments(list);

                setNextCommentNumber(maxNumber + 1);

                if (route.params.name === undefined) {
                    const res = await getFirstAsync(SQL_GET_COMMENT_GROUP_BY_NUMBER(groupNumber));
                    setGroupName(res.name);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Failed to get overview', err)
            }
        }

        if (ready) {
            getData();
        }
    }, [groupNumber, ready, refreshCounter, route.params.name]);

    const successSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: message
        })(dispatch);

    const failSnackbar = (message: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message
        })(dispatch);

    const onCommentDelete = useCallback(
        (id: number) => {
            const deleteComment = async () => {
                setIsLoading(true);

                try {
                    await execAsync(SQL_DELETE_COMMENT(id));
                    successSnackbar("Successfully deleted comment");
                } catch (e) {
                    failSnackbar("Failed to delete comment");
                } finally {
                    setIsLoading(false);
                }
            }

            deleteComment();
        }, [execAsync]
    );

    const onCommentGroupDelete = useCallback(
        () => {
            const deleteComment = async () => {
                setIsLoading(true);

                try {
                    addEditCommentModal({ show: false, mode: undefined })(dispatch);
                    await execAsync(SQL_DELETE_COMMENT_GROUP(groupId));
                    navigate("EditCommentGroups");
                    successSnackbar("Successfully deleted comment group");
                } catch (e) {
                    failSnackbar("Failed to delete comment group");
                } finally {
                    setIsLoading(false);
                }
            }

            deleteComment();
        }, [groupId, execAsync]
    );

    const onCommentGroupNameEdit = useCallback(
        (newName: string) => {
            setGroupName(newName);
            addEditCommentModal({ show: false, mode: undefined })(dispatch);
            execAsync(SQL_UPDATE_COMMENT_GROUP(groupId, newName));
        }, [groupId, execAsync]
    );

    const onAddCommentSubmit = useCallback((newComment: IComment) => {
        setComments([...comments, newComment]);
        addEditCommentModal({ show: false, mode: undefined })(dispatch);
    }, [comments]);

    const onCommentEditPress = useCallback((comment: IComment) => {
        setCommentToEdit(comment);
        setShowEditModal(true);
    }, []);
    const onCommentDeletePress = useCallback((comment: IComment) => {
        setCommentToDelete(comment);
        setShowDeleteModal(true);
    }, []);
    const onEditCommentCancel = useCallback(() => {
        setShowEditModal(false);
        setCommentToEdit(undefined);
    }, []);
    const onEditCommentSubmit = useCallback(() => {
        setRefreshCounter(refreshCounter + 1);
        setShowEditModal(false);
        setCommentToEdit(undefined);
    }, [refreshCounter]);
    const onDeleteCommentCancel = useCallback(() => {
        setShowDeleteModal(false);
        setCommentToDelete(undefined);
    }, []);
    const onDeleteCommentSubmit = useCallback(() => {
        if (commentToDelete && commentToDelete.id) {
            onCommentDelete(commentToDelete.id);
        }
        setRefreshCounter(refreshCounter + 1);
        setShowDeleteModal(false);
        setCommentToDelete(undefined);
    }, [commentToDelete, refreshCounter]);

    const onDragEnd = useCallback(({ data }: { data: IComment[] }) => {
        setComments(data);

        data.forEach((item, index) => {
            if (item.id) {
                execAsync(SQL_UPDATE_COMMENT_NUMBER(item.id, index + 1));
            }
        });
    }, []);

    const onCloseCommentGroupModals = useCallback(() => {
        addEditCommentModal({ show: false, mode: undefined })(dispatch);
    }, []);

    const renderItem = ({ item, drag, isActive }: RenderItemParams<IComment>) => {
        const handleEditPress = () => onCommentEditPress(item);
        const handleDeletePress = () => onCommentDeletePress(item)

        return item.id ? (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.rowItem,
                        { backgroundColor: isActive ? "lightgrey" : "white" },
                    ]}>
                    <CommentListItem
                        id={item.id}
                        name={item.name}
                        onEditPress={handleEditPress}
                        onDeletePress={handleDeletePress}
                    />
                </TouchableOpacity>
            </ScaleDecorator>
        ) : null;
    };

    return (
        <View>
            {isLoading && <ProgressBar indeterminate={true} />}

            <View>
                <View>
                    <View style={styles.headline}>
                        <Headline>
                            {groupName}
                        </Headline>
                    </View>
                    {isLoading && <ProgressBar indeterminate={true} />}
                    {!isLoading && (
                        <GestureHandlerRootView style={{ width: '100%' }}>
                            <DraggableFlatList
                                data={comments}
                                onDragEnd={onDragEnd}
                                keyExtractor={(item) => item.id?.toString() ?? item.number.toString()}
                                renderItem={renderItem}
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
                            />
                        </GestureHandlerRootView>
                    )}
                </View>
                {addEditComment && addEditComment.show && addEditComment.mode === 'delete' && (
                    <DeleteItemModal
                        type={`comment group (${groupName})`}
                        onCancel={onCloseCommentGroupModals}
                        onYes={onCommentGroupDelete}
                    />
                )}
                {addEditComment && addEditComment.show && addEditComment.mode === 'edit' && (
                    <EditItemNameModal
                        type={'value'}
                        name={groupName}
                        customTitle='Edit comment group name'
                        onClose={onCloseCommentGroupModals}
                        onSubmit={onCommentGroupNameEdit}
                    />
                )}
                {addEditComment.show && addEditComment.mode === 'add' && (
                    <AddEditCommentModal
                        mode='Add'
                        groupId={groupId}
                        num={nextCommentNumber}
                        onClose={onCloseCommentGroupModals}
                        onSubmit={onAddCommentSubmit}
                    />
                )}
                {showEditModal && commentToEdit && commentToEdit.id && (
                    <AddEditCommentModal
                        mode='Edit'
                        groupId={groupId}
                        num={commentToEdit.number}
                        name={commentToEdit.name}
                        text={commentToEdit.text}
                        commentId={commentToEdit.id}
                        onClose={onEditCommentCancel}
                        onSubmit={onEditCommentSubmit}
                    />
                )}
                {showDeleteModal && commentToDelete && commentToDelete.id && (
                    <DeleteItemModal
                        type={`comment (${commentToDelete.name})`}
                        onCancel={onDeleteCommentCancel}
                        onYes={onDeleteCommentSubmit}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    rowItem: {
        width: "100%",
        padding: 8,
        display: "flex"
    },
    headline: {
        backgroundColor: "white",
        width: "100%",
        textAlign: "center",
        padding: 10,
    },
    formComponent: {
        padding: 10
    },
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        paddingBottom: 10,
        paddingTop: 10,
        alignItems: "center",
    },
});
