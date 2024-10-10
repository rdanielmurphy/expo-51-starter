import React, { useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';

function Fallback({ error }: { error: Error }) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: "red" }}>{error?.message}</pre>
        </div>
    );
}

const ErrorHandler = ({ children }: { children: any }) => {
    const { handleError, ready } = useErrorHandler();

    const logError = useCallback((error: Error, info: React.ErrorInfo) => {
        console.error(error, info);

        if (ready) {
            handleError("App", "ErrorBoundary", error?.message, error?.stack);
        }
    }, [ready]);

    return (
        <ErrorBoundary FallbackComponent={Fallback} onError={logError}>
            {children}
        </ErrorBoundary>
    )
}

export default ErrorHandler;