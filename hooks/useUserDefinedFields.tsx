import { useState, useEffect } from 'react';
import { SQL_GET_USER_DEFINED_FIELDS } from '../lib/sqlCommands';
import { useDbContext } from '../contexts/DbContext';

export interface IUserDefinedField {
    id: number
    displayOrder: number
    fieldLabel: string
    fieldType: string
    fieldValue: number
    visible: number
}

export interface IUserDefinedFields {
    items: IUserDefinedField[]
}

export function useUserDefinedFields() {
    const [userDefinedFields, setUserDefinedFields] = useState<IUserDefinedFields | null>(null);
    const [loaded, setLoaded] = useState<boolean>(false);
    const { getAllAsync, ready } = useDbContext();

    const getUserDefinedFields = async () => {
        const scriptResults = await getAllAsync(SQL_GET_USER_DEFINED_FIELDS);
        const items: IUserDefinedField[] = [];
        for (let i = 0; i < scriptResults.length; ++i) {
            const item = scriptResults[i];
            items.push({
                id: item.id,
                displayOrder: item.displayOrder,
                fieldLabel: item.fieldLabel,
                fieldType: item.fieldType,
                fieldValue: item.fieldValue,
                visible: item.visible,
            });
        }
        setUserDefinedFields({
            items
        });
        setLoaded(true);
    }

    useEffect(() => {
        if (ready) {
            getUserDefinedFields();
        }
    }, [ready]);

    return { loaded, userDefinedFields };
}