import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text, Subheading } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { IComment, ICommentGroup } from '../../lib/defaultComments';
import { SQL_GET_COMMENTS, SQL_GET_COMMENT_GROUP_BY_NUMBER } from '../../lib/sqlCommands';
import { updateInsertCommentModal } from '../../redux/actions';
import { InsertCommentModalState, initialState } from '../../redux/reducers/insertCommentModal';
import { AddEditCommentModal } from './AddEditCommentModal';
import { EditCommentsModal } from './EditCommentsModal';
import { removeItemAll } from '../../lib/arrayHelpers';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';
import { removeSpanTags } from '../../lib/stringHelpers';

export const CommentModal = () => {
    const { ready, getFirstAsync, getAllAsync } = useDbContext();
    const dispatch = useDispatch();
    const insertCommentModalState: InsertCommentModalState = useSelector((state: any) => state.insertCommentModalState);
    const [commentGroup, setCommentGroup] = useState<ICommentGroup | null>(null);
    const [loading, setLoading] = useState<boolean>(true);;
    const [selectedComments, setSelectedComments] = useState<number[]>([]);
    const [checkboxClickedNum, setCheckboxClickedNum] = useState<number>(0);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newCommentNumber, setNewCommentNumber] = useState<number>(1);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);

    const onClose = useCallback(() => {
        updateInsertCommentModal(initialState)(dispatch);
        insertCommentModalState.onCancel();
        setSelectedComments([]);
    }, []);

    const onSubmit = useCallback(() => {
        const list: string[] = [];
        const sortedComments = selectedComments.sort();
        for (let i = 0; i < sortedComments.length; i++) {
            const num = sortedComments[i];
            const theComment = commentGroup?.comments.find(v => v.number === num);
            list.push(removeSpanTags(theComment?.text) || "");
        }
        updateInsertCommentModal(initialState)(dispatch);
        insertCommentModalState.onDone(list);
        setSelectedComments([]);
    }, [commentGroup, selectedComments]);

    const checkboxClicked = useCallback((num: number) => {
        const index = selectedComments.indexOf(num);
        if (index > -1) {
            setSelectedComments(removeItemAll(selectedComments, num));
        } else {
            setSelectedComments([num, ...selectedComments]);
        }
        setCheckboxClickedNum(checkboxClickedNum + 1);
    }, [selectedComments, checkboxClickedNum])

    const getComments = useCallback(async () => {
        const commentGrpRes = await getFirstAsync(SQL_GET_COMMENT_GROUP_BY_NUMBER(insertCommentModalState.groupId));
        const commentGrpName = commentGrpRes.name
        const commentGrpId = commentGrpRes.id
        const commentGroup = {
            id: commentGrpId,
            description: commentGrpName,
            comments: [],
            number: insertCommentModalState.groupId.toString(),
        } as ICommentGroup;
        const commentsRes = await getAllAsync(SQL_GET_COMMENTS(commentGrpId));
        commentGroup.comments = commentsRes.map(r => ({
            id: r.id,
            name: r.name,
            number: r.number,
            text: r.text
        } as IComment)).sort((a, b) => {
            if (a.number > b.number) {
                return 1;
            }

            if (a.number < b.number) {
                return -1;
            }

            return 0;
        });
        setLoading(false);
        setCommentGroup(commentGroup);
        setSelectedComments([]);
        if (commentGroup && commentGroup.comments.length > 0) {
            setNewCommentNumber(Math.max(...commentGroup.comments.map(c => c.number)) + 1);
        }
    }, [insertCommentModalState.groupId, ready]);

    useEffect(() => {
        if (ready && insertCommentModalState.groupId > 0) {
            getComments();
        }
    }, [insertCommentModalState.groupId, ready]);

    const handleOpenAddModal = useCallback(() => {
        setShowModal(false);
        setShowAddModal(true);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setShowAddModal(false);
        setShowModal(true);
    }, []);

    const handleSubmitAddModal = useCallback((newComment: IComment) => {
        setShowAddModal(false);
        if (commentGroup) {
            setCommentGroup({
                description: commentGroup.description,
                number: commentGroup.number,
                comments: [...commentGroup.comments, newComment],
            });
        }
        setNewCommentNumber(newCommentNumber + 1);
        setShowModal(true);
        getComments();
    }, [newCommentNumber, commentGroup, getComments]);

    const handleOpenEditModal = useCallback(() => {
        setShowModal(false);
        setSelectedComments([]);
        setShowEditModal(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        getComments();
        setShowEditModal(false);
        setShowModal(true);
    }, [getComments]);

    const renderTheRows = useMemo(() => {
        return commentGroup === null || commentGroup.comments.length === 0 ?
            <View></View> :
            commentGroup.comments.map((c: IComment) => {
                const checkStatus = selectedComments.indexOf(c.number) > -1 ? "checked" : "unchecked";
                return (
                    <View key={c.id} style={styles.comment}>
                        <Text style={{ flex: 4 }} onPress={() => checkboxClicked(c.number)}>
                            <Subheading>{c.name}</Subheading>
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Checkbox
                                status={checkStatus}
                                onPress={() => checkboxClicked(c.number)}
                            />
                        </View>
                    </View>
                )
            })
    }, [selectedComments.length, commentGroup?.comments, checkboxClickedNum]);

    useEffect(() => {
        setShowModal(insertCommentModalState.show);
    }, [insertCommentModalState.show]);

    return (
        <>
            <Dialog
                visible={showModal}
                title={commentGroup ? commentGroup.description : ""}
                buttons={(
                    <ModalButtons
                        confirmDisabled={!ready}
                        confirmText={"Save"}
                        cancelAction={onClose}
                        confirmAction={onSubmit} />
                )}
                onTouchOutside={onClose}>
                <View>
                    {!loading &&
                        <ScrollView>
                            <View style={styles.buttons}>
                                <Button mode="text" onPress={handleOpenEditModal}>Edit Comments</Button>
                                <Button mode="text" onPress={handleOpenAddModal}>Add Comment</Button>
                            </View>
                            {renderTheRows}
                        </ScrollView>
                    }
                </View>
            </Dialog>
            {showAddModal && <AddEditCommentModal
                groupId={insertCommentModalState.groupId}
                num={newCommentNumber}
                onClose={handleCloseAddModal}
                onSubmit={handleSubmitAddModal}
                mode={'Add'}
            />}
            {showEditModal && commentGroup && commentGroup.id &&
                <EditCommentsModal
                    commentGroup={commentGroup}
                    onCancel={handleCloseEditModal}
                    onSave={handleCloseEditModal}
                />}
        </>
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
    buttons: {
        flexDirection: 'row',
        height: 50,
        alignContent: "space-between",
    },
    checkboxText: {
        marginTop: 10,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    }
});
