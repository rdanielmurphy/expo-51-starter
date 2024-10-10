import { Button } from 'react-native-paper';
import { SNACKBAR_STATE_CHANGE } from '../constants';

export type SnackBarState = {
    show: boolean
    type: "success" | "fail" | "info"
    onDismissSnackBar?: () => void
    action?: Omit<React.ComponentProps<typeof Button>, 'children'> & {
        label: string;
    }
    message: string
};

export const initialState: SnackBarState = {
    show: false,
    type: "info",
    onDismissSnackBar: () => {},
    message: ""
}

export const snackbar = (state: SnackBarState = initialState, action: any) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case SNACKBAR_STATE_CHANGE:
            const newState: SnackBarState = action.currentState;
            return {
                ...state,
                type: newState?.type,
                onDismissSnackBar: newState?.onDismissSnackBar,
                show: newState?.show,
                action: newState?.action,
                message: newState?.message,
            }
        default:
            return state;
    }
}
