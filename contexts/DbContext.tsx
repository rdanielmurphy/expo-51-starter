import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import * as SQLite from 'expo-sqlite/next';
import { useDatabaseNew } from "../hooks/useDatabaseNew";

interface IDbContext {
    deleteDB: () => Promise<void>
    execAsync: (sqlStatement: string, log?: boolean) => Promise<boolean>
    getFirstAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any>
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any[]>
    runAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<SQLite.SQLiteRunResult>
    ready: boolean
    message: string
    progress: number
    error: string | undefined
}

const DbContext = createContext<IDbContext | null>(null);

export const useDbContext = () => {
    const ctx = useContext(DbContext);
    if (ctx === null) {
        throw new Error("No DbContext context found");
    }
    return {
        deleteDB: ctx.deleteDB,
        execAsync: ctx.execAsync,
        getFirstAsync: ctx.getFirstAsync,
        getAllAsync: ctx.getAllAsync,
        runAsync: ctx.runAsync,
        ready: ctx.ready,
        message: ctx.message,
        progress: ctx.progress,
        error: ctx.error
    }
};

interface DbProviderProps {
    children: ReactNode | ReactNode[];
}

export const DbProvider = ({ children }: DbProviderProps) => {
    const { deleteDB, execAsync, getFirstAsync, getAllAsync, runAsync, ready, message, progress, error } = useDatabaseNew();

    return (
        <DbContext.Provider value={{ deleteDB, execAsync, getFirstAsync, getAllAsync, runAsync, ready, message, progress, error }}>
            {children}
        </DbContext.Provider>
    );
};
