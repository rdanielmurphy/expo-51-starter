import * as React from 'react';
import { List, Checkbox } from 'react-native-paper';

export interface ILeafItem {
    title: string
    id: number
}

export interface ILeafItemProps {
    checked: boolean
    item: ILeafItem
    disabled?: boolean
    onClick: (id: number) => void
}

export default function TreeLeaf({ checked, disabled, item, onClick }: ILeafItemProps) {
    const handleCheck = React.useCallback(() => {
        onClick(item.id);
    }, [item.id, onClick]);

    return (
        <List.Item
            onPress={handleCheck}
            title={item.title}
            right={() => <Checkbox disabled={disabled} status={checked ? 'checked' : 'unchecked'} onPress={handleCheck} />}
        />
    );
}