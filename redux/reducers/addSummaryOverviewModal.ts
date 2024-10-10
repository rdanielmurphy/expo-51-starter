import { ADD_OVERVIEW_MODAL_STATE_CHANGE, ADD_SUMMARY_MODAL_STATE_CHANGE } from '../constants';

export type AddSummaryOverviewModalState = {
    showSummary: boolean
    showOverview: boolean
};

export const initialState: AddSummaryOverviewModalState = {
    showSummary: false,
    showOverview: false,
}

export const addSummaryOverviewModal = (state: AddSummaryOverviewModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case ADD_SUMMARY_MODAL_STATE_CHANGE:
            const newState: AddSummaryOverviewModalState = action.currentState;
            return {
                ...state,
                showSummary: newState?.showSummary,
            }
        case ADD_OVERVIEW_MODAL_STATE_CHANGE:
            const newState2: AddSummaryOverviewModalState = action.currentState;
            return {
                ...state,
                showOverview: newState2?.showOverview,
            }
        default:
            return state;
    }
}
