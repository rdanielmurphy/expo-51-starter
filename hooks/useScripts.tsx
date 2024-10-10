import { useState, useEffect } from 'react';
import { SQL_GET_MASTER_SCRIPTS } from '../lib/sqlCommands';
import { ITemplate } from '../lib/defaultTemplateScripts';
import { useDbContext } from '../contexts/DbContext';

export interface IScript extends ITemplate {
    id: number
}

export interface IScripts {
    items: IScript[]
}

export function useScripts() {
    const [scripts, setScripts] = useState<IScripts | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { getAllAsync, ready } = useDbContext();

    const getScripts = async () => {
        const scriptResults = await getAllAsync(SQL_GET_MASTER_SCRIPTS);
        const items: IScript[] = [];
        for (let i = 0; i < scriptResults.length; ++i) {
            const item = scriptResults[i];
            items.push({
                id: item.id,
                name: item.name,
                sections: [],
                tag: item.tag,
                version: item.version,
                editable: item.editable
            });
        }
        setScripts({
            items
        });
        setLoaded(true);
    }

    useEffect(() => {
        if (ready) {
            getScripts();
        }
    }, [ready]);

    return { loaded, scripts };
}