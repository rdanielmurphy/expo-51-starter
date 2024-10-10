import { ADD_PHOTO_MODAL_STATE_CHANGE, ADD_PHOTO_TEMP_URI_CHANGE } from '../constants';

export type AddPhotoModalState = {
    show?: boolean
    name?: string,
    inspectionId?: number
    sectionId?: number
    subsectionId?: number
    uri?: string
    onExisitingClick?: () => void
    onCameraClick?: () => void
};

export const initialState: AddPhotoModalState = {
    show: false,
    name: "",
    inspectionId: -1,
    sectionId: -1,
    subsectionId: -1,
    uri: undefined,
    onCameraClick: () => { },
    onExisitingClick: () => { }
}

export const addPhotoModal = (state: AddPhotoModalState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: AddPhotoModalState = action.currentState;
    switch (action.type) {
        case ADD_PHOTO_MODAL_STATE_CHANGE:
            return {
                ...state,
                onCameraClick: newState?.onCameraClick,
                onExisitingClick: newState?.onExisitingClick,
                inspectionId: newState?.inspectionId,
                sectionId: newState?.sectionId,
                subsectionId: newState?.subsectionId,
                uri: undefined,
                show: newState?.show,
                name: newState?.name,
            }
        case ADD_PHOTO_TEMP_URI_CHANGE:
            return {
                ...state,
                show: false,
                uri: newState.uri,
            }
        default:
            return state;
    }
}
