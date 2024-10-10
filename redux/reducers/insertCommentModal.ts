import { INSERT_COMMENT_MODAL_STATE_CHANGE } from '../constants';

export type InsertCommentModalState = {
    show: boolean
    groupId: number
    onCancel: () => void
    onDone: (list: string[]) => void
};

export const initialState: InsertCommentModalState = {
    show: false,
    groupId: -1,
    onCancel: () => { },
    onDone: (list: string[]) => { }
}

export const insertCommentModal = (state: InsertCommentModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case INSERT_COMMENT_MODAL_STATE_CHANGE:
            const newState: InsertCommentModalState = action.currentState;
            return {
                ...state,
                onCancel: newState?.onCancel,
                onDone: newState?.onDone,
                groupId: newState?.groupId,
                show: newState?.show,
            }
        default:
            return state;
    }
}
