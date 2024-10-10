import { COPY_TO_SUMMARY_MODAL_STATE_CHANGE } from '../constants';

export type CopyToSummaryModalState = {
    show: boolean
    text: string
    updateSummary: boolean
    updateSummaryCounter: number
};

export const initialState: CopyToSummaryModalState = {
    show: false,
    text: "",
    updateSummary: false,
    updateSummaryCounter: 0,
}

export const copyToSummaryModal = (state: CopyToSummaryModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: CopyToSummaryModalState = action.currentState;
    switch (action.type) {
        case COPY_TO_SUMMARY_MODAL_STATE_CHANGE:
            return {
                ...state,
                text: newState?.text,
                show: newState?.show,
            }
        default:
            return state;
    }
}
