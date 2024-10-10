import React, { useCallback } from 'react'
import { SQL_DELETE_COMMENT } from '../../lib/sqlCommands';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    commentId: number
    commentTitle: string
    onCancel: () => void
    onYes: () => void
}

export const DeleteCommentModal = (props: IProps) => {
    const { execAsync } = useDbContext();

    const onClose = useCallback(() => props.onCancel(), []);
    const onSubmit = useCallback(() => {
        execAsync(SQL_DELETE_COMMENT(props.commentId));
        props.onYes();
    }, [execAsync, props.commentId]);

    return (
        <ConfirmDialog
            title="Are you sure you want to delete this comment?"
            message={props.commentTitle}
            visible={true}
            onTouchOutside={onClose}
            positiveButton={{
                title: "Yes",
                onPress: onSubmit
            }}
            negativeButton={{
                title: "No",
                onPress: onClose
            }}
        />
    )
}
