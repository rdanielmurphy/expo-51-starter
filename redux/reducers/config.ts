const initialState = {
    loading: false,
    loaded: false,
    environmentName: '',
    environmentVersion: '',
}

export const config = (state = initialState, action: any) => {
    return {
        ...state,
        environmentName: action.environmentName,
        environmentVersion: action.environmentVersion,
        loaded: action.loaded,
        loading: action.loading
    }
}
