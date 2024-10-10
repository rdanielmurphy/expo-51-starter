import { SQL_INSERT_ERROR } from '../lib/sqlCommands';
import { useDbContext } from '../contexts/DbContext';

export interface IAppError {
    message: string;
    stack?: string;
}

export function useErrorHandler() {
    const { execAsync, ready } = useDbContext();

    const handleError = (screen?: string, area?: string, error?: string, stack?: string) => {
        console.error(screen, area, error, stack);
        if (!ready) return;
        execAsync(SQL_INSERT_ERROR(screen ?? "", area ?? "", error ?? "", stack ?? ""))
    }

    return { ready, handleError };
}