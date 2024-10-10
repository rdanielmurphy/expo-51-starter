import { HIGHLIGHT_MODAL_STATE_CHANGE } from '../constants';

export type HighlightModalState = {
    show?: boolean
    id?: number,
};

export const initialState: HighlightModalState = {
    show: false,
    id: -1,
}

export const highlightModal = (state: HighlightModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: HighlightModalState = action.currentState;
    switch (action.type) {
        case HIGHLIGHT_MODAL_STATE_CHANGE:
            return {
                ...state,
                show: newState?.show,
                id: newState?.id,
            }
        default:
            return state;
    }
}
