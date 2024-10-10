import { combineReducers } from 'redux';
import { insertCommentModal } from './insertCommentModal';
import { addPhotoModal } from './addPhotoModal';
import { fab } from './fab';
import { inspection } from './inspection';
import { photos } from './photos';
import { snackbar } from './snackbar';
import { copyToSummaryModal } from './copyToSummaryModal';
import { highlightModal } from './hightlightModal';
import { addItemToInspectionModal } from './addItemToInspectionModals';
import { addSummaryOverviewModal } from './addSummaryOverviewModal';
import { addEditCommentModal } from './addEditCommentModal';
import { addEditCommentGroupModal } from './addEditCommentGroupModal';

const Reducers = combineReducers({
    inspectionState: inspection,
    snackbarState: snackbar,
    addPhotoModalState: addPhotoModal,
    photosState: photos,
    insertCommentModalState: insertCommentModal,
    fabState: fab,
    copyToSummaryState: copyToSummaryModal,
    highlightModalState: highlightModal,
    addItemToInspectionModalState: addItemToInspectionModal,
    addSummaryOverviewModalState: addSummaryOverviewModal,
    addEditCommentModalState: addEditCommentModal,
    addEditCommentGroupModalState: addEditCommentGroupModal,
});

export default Reducers;