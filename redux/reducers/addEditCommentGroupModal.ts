import { ADD_EDIT_COMMENT_GROUP_MODAL_STATE_CHANGE } from '../constants';

export type AddEditCommentGroupModalState = {
    show: boolean
};

export const initialState: AddEditCommentGroupModalState = {
    show: false,
}

export const addEditCommentGroupModal = (state: AddEditCommentGroupModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case ADD_EDIT_COMMENT_GROUP_MODAL_STATE_CHANGE:
            const newState: AddEditCommentGroupModalState = action.currentState;
            return {
                ...state,
                show: newState?.show,
            }
        default:
            return state;
    }
}
