import { useState, useEffect } from 'react';
import { SQL_GET_STATES } from '../lib/sqlCommands';
import { useDbContext } from '../contexts/DbContext';

export interface IState {
    id: number
    abbr: string
    name: string
    country: string
}

export interface IStates {
    items: IState[]
}

export function useStates() {
    const [states, setStates] = useState<IStates | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { getAllAsync, ready } = useDbContext();

    const getStates = async () => {
        const scriptResults = await getAllAsync(SQL_GET_STATES);
        const items: IState[] = [];
        for (let i = 0; i < scriptResults.length; ++i) {
            const item = scriptResults[i];
            items.push({
                id: item.id,
                abbr: item.abbr,
                name: item.name,
                country: item.country,
            });
        }
        setStates({
            items
        });
        setLoaded(true);
    }

    useEffect(() => {
        if (ready) {
            getStates();
        }
    }, [ready]);

    return { loaded, states };
}