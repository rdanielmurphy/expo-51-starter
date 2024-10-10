import {
    INSERT_COMMENT_MODAL_STATE_CHANGE,
    HIGHLIGHT_MODAL_STATE_CHANGE,
    ADD_PHOTO_MODAL_STATE_CHANGE,
    ADD_PHOTO_TEMP_URI_CHANGE,
    COPY_TO_SUMMARY_MODAL_STATE_CHANGE,
    CURRENT_PHOTO_STATE_CHANGE,
    FAB_TOGGLE_ADD_MODAL_STATE_CHANGE,
    FAB_TOGGLE_COPY_MODAL_STATE_CHANGE,
    FAB_TOGGLE_DELETE_MODAL_STATE_CHANGE,
    FAB_TOGGLE_DELETE_SECTION_MODAL_STATE_CHANGE,
    FAB_TOGGLE_EDIT_MODAL_STATE_CHANGE,
    FAB_TOGGLE_EDIT_SECTION_MODAL_STATE_CHANGE,
    FAB_TOGGLE_STATE_CHANGE,
    INSPECTION_ID_STATE_CHANGE,
    PHOTOS_STATE_CHANGE,
    SCRIPT_ID_STATE_CHANGE,
    SECTION_ID_STATE_CHANGE,
    SNACKBAR_STATE_CHANGE,
    SUBSECTION_ID_STATE_CHANGE,
    INSPECTION_TEMPLATE_STATE_CHANGE,
    COPY_VALUE_MODAL_STATE_CHANGE,
    ADD_ITEM_TO_INSPECTION_MODAL_STATE_CHANGE,
    INSPECTION_VALUES_STATE_CHANGE,
    VALUE_STATE_CHANGE,
    ADD_SUMMARY_MODAL_STATE_CHANGE,
    ADD_OVERVIEW_MODAL_STATE_CHANGE,
    ADD_EDIT_COMMENT_GROUP_MODAL_STATE_CHANGE,
    ADD_EDIT_COMMENT_MODAL_STATE_CHANGE,
    FAB_TOGGLE_EDIT_SECTION_TAG_MODAL_STATE_CHANGE,
    MASTER_SCRIPT_ID_STATE_CHANGE,
    RESET_INSPECTION_STATE
} from '../constants';
import { InsertCommentModalState } from '../reducers/insertCommentModal';
import { AddItemToInspectionState } from '../reducers/addItemToInspectionModals';
import { AddPhotoModalState } from '../reducers/addPhotoModal';
import { AddSummaryOverviewModalState } from '../reducers/addSummaryOverviewModal';
import { CopyToSummaryModalState } from '../reducers/copyToSummaryModal';
import { FabState } from '../reducers/fab';
import { HighlightModalState } from '../reducers/hightlightModal';
import { InspectionState } from '../reducers/inspection';
import { PhotosState } from '../reducers/photos';
import { SnackBarState } from '../reducers/snackbar';
import { AddEditCommentModalState } from '../reducers/addEditCommentModal';
import { AddEditCommentGroupModalState } from '../reducers/addEditCommentGroupModal';

export const resetInspection = (_callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: RESET_INSPECTION_STATE });
    });
}

export const updateInspection = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: INSPECTION_ID_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateMasterScript = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: MASTER_SCRIPT_ID_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateScript = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: SCRIPT_ID_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateSection = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: SECTION_ID_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateSubsection = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: SUBSECTION_ID_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateAddPhotoModal = (state: AddPhotoModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_PHOTO_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateAddPhotoUri = (state: AddPhotoModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_PHOTO_TEMP_URI_CHANGE, currentState: state });
    });
}

export const updateSnackbar = (state: SnackBarState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: SNACKBAR_STATE_CHANGE, currentState: state });
    });
}

export const updatePhotos = (state: PhotosState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: PHOTOS_STATE_CHANGE, currentState: state });
    });
}

export const updateCurrentPhoto = (state: PhotosState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: CURRENT_PHOTO_STATE_CHANGE, currentState: state });
    });
}

export const updateInsertCommentModal = (state: InsertCommentModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: INSERT_COMMENT_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateAddSummaryModal = (state: AddSummaryOverviewModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_SUMMARY_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateAddOverviewModal = (state: AddSummaryOverviewModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_OVERVIEW_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabState = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabAddModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_ADD_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabCopyModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_COPY_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabDeleteModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_DELETE_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabDeleteSectionModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_DELETE_SECTION_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabEditModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_EDIT_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabEditSectionModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_EDIT_SECTION_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const toggleFabEditSectionTagModal = (state: FabState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: FAB_TOGGLE_EDIT_SECTION_TAG_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateCopyToSummaryModal = (state: CopyToSummaryModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: COPY_TO_SUMMARY_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateHighlightModal = (state: HighlightModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: HIGHLIGHT_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const updateTemplateInspection = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: INSPECTION_TEMPLATE_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateInspectionValues = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: INSPECTION_VALUES_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const updateCopyValueModal = (state: AddItemToInspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: COPY_VALUE_MODAL_STATE_CHANGE, currentState: state, loading: true });
    });
}

export const updateAddItemToInspectionModal = (state: AddItemToInspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_ITEM_TO_INSPECTION_MODAL_STATE_CHANGE, currentState: state, loading: true });
    });
}

export const updateInspectionValue = (inspection: InspectionState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: VALUE_STATE_CHANGE, currentInspection: inspection, loading: true });
    });
}

export const addEditCommentModal = (state: AddEditCommentModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_EDIT_COMMENT_MODAL_STATE_CHANGE, currentState: state });
    });
}

export const addEditCommentGroupModal = (state: AddEditCommentGroupModalState, _callback?: () => void) => {
    return ((dispatch: any) => {
        dispatch({ type: ADD_EDIT_COMMENT_GROUP_MODAL_STATE_CHANGE, currentState: state });
    });
}
