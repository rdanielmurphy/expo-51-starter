import { createContext } from "react";
import type { ReactNode } from "react";
import { Snackbar, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateSnackbar } from '../redux/actions';
import { initialState, SnackBarState } from '../redux/reducers/snackbar';

interface SnackbarContext {
    emojis: string[];
    dispatch: (action: SnackbarAction) => void;
}

const SnackbarContext = createContext<SnackBarState | null>(null);

interface SnackbarAction {
    type: "fail" | "success";
    message: string;
    emoji?: string;
}

interface SnackbarProviderProps {
    children: ReactNode | ReactNode[];
}

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
    const dispatch = useDispatch();
    const { colors } = useTheme();
    const snackbarState: SnackBarState = useSelector((state: any) => state.snackbarState);

    let color = colors.primary
    if (snackbarState.type === "fail") {
        color = colors.error;
    } else if (snackbarState.type === "success") {
        color = "green"
    }

    const onDismissSnackBar = () => {
        if (snackbarState.onDismissSnackBar) {
            snackbarState.onDismissSnackBar();
        }
        updateSnackbar(initialState)(dispatch);
    }

    return (
        <SnackbarContext.Provider value={snackbarState}>
            {children}
            <Snackbar
                style={{ backgroundColor: color }}
                visible={snackbarState.show}
                onDismiss={onDismissSnackBar}
                duration={4000}
                action={snackbarState.action}>
                {snackbarState.message}
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
