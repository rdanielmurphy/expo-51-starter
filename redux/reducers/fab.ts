import { AddType } from '../../components/modals/AddItemModal';
import {
    FAB_TOGGLE_ADD_MODAL_STATE_CHANGE, FAB_TOGGLE_COPY_MODAL_STATE_CHANGE, FAB_TOGGLE_DELETE_MODAL_STATE_CHANGE,
    FAB_TOGGLE_DELETE_SECTION_MODAL_STATE_CHANGE,
    FAB_TOGGLE_EDIT_MODAL_STATE_CHANGE, FAB_TOGGLE_EDIT_SECTION_MODAL_STATE_CHANGE, FAB_TOGGLE_EDIT_SECTION_TAG_MODAL_STATE_CHANGE, FAB_TOGGLE_STATE_CHANGE
} from '../constants';

export type FabState = {
    open?: boolean
    addModal?: boolean
    copyModal?: boolean
    deleteModal?: boolean
    deleteSectionModal?: boolean
    editModal?: boolean
    editSectionModal?: boolean
    editSectionTagModal?: boolean
    addModalType?: string
    defaultAddOption?: AddType
};

export const initialState: FabState = {
    open: false,
    addModal: false,
    addModalType: undefined,
    copyModal: false,
    deleteModal: false,
    deleteSectionModal: false,
    editSectionTagModal: false,
    editModal: false,
    editSectionModal: false,
}

export const fab = (state: FabState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: FabState = action.currentState;
    switch (action.type) {
        case FAB_TOGGLE_STATE_CHANGE:
            return {
                ...state,
                open: newState?.open,
            } as FabState
        case FAB_TOGGLE_ADD_MODAL_STATE_CHANGE:
            return {
                ...state,
                addModal: newState?.addModal,
                defaultAddOption: newState?.defaultAddOption
            } as FabState
        case FAB_TOGGLE_COPY_MODAL_STATE_CHANGE:
            return {
                ...state,
                copyModal: newState?.copyModal
            } as FabState
        case FAB_TOGGLE_DELETE_MODAL_STATE_CHANGE:
            return {
                ...state,
                deleteModal: newState?.deleteModal
            } as FabState
        case FAB_TOGGLE_DELETE_SECTION_MODAL_STATE_CHANGE:
            return {
                ...state,
                deleteSectionModal: newState?.deleteSectionModal
            } as FabState
        case FAB_TOGGLE_EDIT_MODAL_STATE_CHANGE:
            return {
                ...state,
                editModal: newState?.editModal
            } as FabState
        case FAB_TOGGLE_EDIT_SECTION_MODAL_STATE_CHANGE:
            return {
                ...state,
                editSectionModal: newState?.editSectionModal
            } as FabState
        case FAB_TOGGLE_EDIT_SECTION_TAG_MODAL_STATE_CHANGE:
            return {
                ...state,
                editSectionTagModal: newState?.editSectionTagModal
            } as FabState
        default:
            return state;
    }
}
