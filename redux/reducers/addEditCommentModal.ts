import { ADD_EDIT_COMMENT_MODAL_STATE_CHANGE } from '../constants';

export type AddEditCommentModalState = {
    show: boolean
    mode: 'add' | 'delete' | 'edit' | undefined
};

export const initialState: AddEditCommentModalState = {
    show: false,
    mode: undefined
}

export const addEditCommentModal = (state: AddEditCommentModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case ADD_EDIT_COMMENT_MODAL_STATE_CHANGE:
            const newState: AddEditCommentModalState = action.currentState;
            return {
                ...state,
                show: newState?.show,
                mode: newState?.mode,
            }
        default:
            return state;
    }
}
