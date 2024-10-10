import { CURRENT_PHOTO_STATE_CHANGE, PHOTOS_STATE_CHANGE } from '../constants';

export interface IPhoto {
    id: number
    comment?: string
    uri: string
    sectionId?: number
    subsectionId?: number
    optionId?: number
}

export type PhotosState = {
    photos?: IPhoto[]
    currentPhoto?: IPhoto
    updateCounter?: number
};

export const initialState: PhotosState = {
    photos: [],
    currentPhoto: undefined,
    updateCounter: 1,
}

export const photos = (state: PhotosState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const newState: PhotosState = action.currentState;
    switch (action.type) {
        case PHOTOS_STATE_CHANGE:
            return {
                ...state,
                photos: newState?.photos,
                updateCounter: state.updateCounter ? state.updateCounter + 1 : 1,
            }
        case CURRENT_PHOTO_STATE_CHANGE:
            return {
                ...state,
                currentPhoto: newState?.currentPhoto,
                updateCounter: state.updateCounter ? state.updateCounter + 1 : 1,
            }
        default:
            return state;
    }
}
