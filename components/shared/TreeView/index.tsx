import * as React from 'react';
import { List } from 'react-native-paper';
import TreeRoot from './components/TreeRoot';
import { ILeafItem } from './components/TreeLeaf';

export interface ITreeViewProps {
    items?: Map<string, ILeafItem[]>
    noRootCheck?: boolean
    disabled?: boolean
    onSelectionChange: (selectedIds: Map<string, number[]>) => void
}

export default function TreeView({ items, noRootCheck, disabled, onSelectionChange }: ITreeViewProps) {
    const [treeMapSelections, setTreeMapSelections] = React.useState<Map<string, number[]>>(new Map<string, number[]>());

    React.useEffect(() => {
        let tempMap = new Map<string, number[]>();

        items?.forEach((_value, key) => {
            tempMap.set(key, []);
        });

        setTreeMapSelections(tempMap);
    }, [items]);

    const handleSelectionChange = (treeId: string, selectedIds: number[]) => {
        treeMapSelections.get(treeId) && treeMapSelections.set(treeId, selectedIds);
        onSelectionChange(treeMapSelections);
    };

    return (
        <List.Section>
            {items && Array.from(items).map(([key, value]) => (
                <TreeRoot
                    title={key}
                    id={key}
                    items={value}
                    noRootCheck={noRootCheck}
                    disabled={disabled}
                    onSelectionChange={handleSelectionChange} />
            ))}
        </List.Section>
    );
}