import { IValue } from '../../lib/types';
import { INSPECTION_ID_STATE_CHANGE, INSPECTION_TEMPLATE_STATE_CHANGE, INSPECTION_VALUES_STATE_CHANGE, MASTER_SCRIPT_ID_STATE_CHANGE, OPTIONS_STATE_CHANGE, RESET_INSPECTION_STATE, SCRIPT_ID_STATE_CHANGE, SECTIONS_STATE_CHANGE, SECTION_ID_STATE_CHANGE, SUBSECTIONS_STATE_CHANGE, SUBSECTION_ID_STATE_CHANGE, VALUES_STATE_CHANGE, VALUE_OPTIONS_STATE_CHANGE, VALUE_STATE_CHANGE } from '../constants';
import { updateObjectInArray } from '../helpers';

export type InspectionState = {
    id?: number
    master_script_id?: number
    script_id?: number
    section_id?: number
    subsection_id?: number
    sections?: any[]
    subsections?: any[]
    options?: any[]
    values?: IValue[]
    valueOptions?: any[]
    sectionRefreshCounter?: number
    subsectionRefreshCounter?: number
    optionsRefreshCounter?: number
    valuesRefreshCounter?: number
    templateRefreshCounter?: number
    updatedValue?: IValue
};

export const initialState: InspectionState = {
    id: -1,
    master_script_id: -1,
    script_id: -1,
    section_id: -1,
    subsection_id: -1,
    sections: [],
    subsections: [],
    options: [],
    values: [],
    valueOptions: [],
    sectionRefreshCounter: 0,
    subsectionRefreshCounter: 0,
    optionsRefreshCounter: 0,
    valuesRefreshCounter: 0,
    templateRefreshCounter: 0,
    updatedValue: undefined,
}

export const inspection = (state: InspectionState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    const inspection: InspectionState = action.currentInspection;
    const subsectionRefreshCounter = state.subsectionRefreshCounter ? state.subsectionRefreshCounter + 1 : 1;
    const optionsRefreshCounter = state.optionsRefreshCounter ? state.optionsRefreshCounter + 1 : 1;
    const valuesRefreshCounter = state.valuesRefreshCounter ? state.valuesRefreshCounter + 1 : 1;
    const templateRefreshCounter = state.templateRefreshCounter ? state.templateRefreshCounter + 1 : 1;
    switch (action.type) {
        case RESET_INSPECTION_STATE: {
            return {
                ...initialState,
            }
        }
        case INSPECTION_ID_STATE_CHANGE:
            return {
                ...state,
                id: inspection?.id,
            }
        case MASTER_SCRIPT_ID_STATE_CHANGE:
            return {
                ...state,
                master_script_id: inspection?.master_script_id,
            }
        case SCRIPT_ID_STATE_CHANGE:
            return {
                ...state,
                script_id: inspection?.script_id,
            }
        case SECTION_ID_STATE_CHANGE:
            return {
                ...state,
                section_id: inspection?.section_id,
            }
        case SUBSECTION_ID_STATE_CHANGE:
            return {
                ...state,
                subsection_id: inspection?.subsection_id,
            }
        case SECTIONS_STATE_CHANGE:
            return {
                ...state,
                sections: inspection?.sections,
            }
        case SUBSECTIONS_STATE_CHANGE:
            return {
                ...state,
                subsections: inspection?.subsections,
                subsectionRefreshCounter: subsectionRefreshCounter,
            }
        case OPTIONS_STATE_CHANGE:
            return {
                ...state,
                options: inspection?.options,
                optionsRefreshCounter: optionsRefreshCounter,
            }
        case VALUES_STATE_CHANGE:
            return {
                ...state,
                values: inspection?.values,
                valuesRefreshCounter: valuesRefreshCounter,
            }
        case VALUE_STATE_CHANGE:
            return {
                ...state,
                values: state.values ? updateObjectInArray(state.values, {
                    index: state.values?.findIndex((v) => v.id === inspection?.updatedValue?.id),
                    item: inspection?.updatedValue,
                }) : undefined,
            }
        case VALUE_OPTIONS_STATE_CHANGE:
            return {
                ...state,
                valueOptions: inspection?.valueOptions,
                valuesRefreshCounter: valuesRefreshCounter,
            }
        case INSPECTION_TEMPLATE_STATE_CHANGE:
            return {
                ...state,
                templateRefreshCounter: templateRefreshCounter,
            }
        case INSPECTION_VALUES_STATE_CHANGE:
            return {
                ...state,
                valuesRefreshCounter: valuesRefreshCounter,
            }
        default:
            return state;
    }
}
