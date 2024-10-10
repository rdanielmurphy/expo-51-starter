import { AddType } from '../../components/modals/AddItemModal';
import {
    ADD_ITEM_TO_INSPECTION_MODAL_STATE_CHANGE,
    COPY_VALUE_MODAL_STATE_CHANGE,
} from '../constants';

export type AddItemToInspectionState = {
    addModal?: boolean
    copyModal?: boolean
    copyId?: number
    defaultAddOption?: AddType
};

export const initialState: AddItemToInspectionState = {
    addModal: false,
    copyModal: false,
    copyId: -1,
    defaultAddOption: undefined,
}

export const addItemToInspectionModal = (state: AddItemToInspectionState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: AddItemToInspectionState = action.currentState;
    switch (action.type) {
        case ADD_ITEM_TO_INSPECTION_MODAL_STATE_CHANGE:
            return {
                ...state,
                addModal: newState?.addModal,
                defaultAddOption: newState?.defaultAddOption,
            } as AddItemToInspectionState
        case COPY_VALUE_MODAL_STATE_CHANGE:
            return {
                ...state,
                copyModal: newState?.copyModal,
                copyId: newState?.copyId,
            } as AddItemToInspectionState
        default:
            return state;
    }
}
