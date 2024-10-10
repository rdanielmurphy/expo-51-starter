import { IPhoto } from "../redux/reducers/photos";

export const photoRowsToObjects = (photosResult: any[]) => photosResult.map(r => ({
    id: r.id,
    comment: r.comment,
    uri: r.fileName,
    sectionId: r.sectionId,
    subsectionId: r.subsectionId,
    optionId: r.optionId,
} as IPhoto));
