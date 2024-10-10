import * as React from 'react';
import { View } from 'react-native';
import { List, Checkbox } from 'react-native-paper';
import TreeLeaf, { ILeafItem } from './TreeLeaf';

export interface ITreeRootProps {
    title: string
    id: string
    items: ILeafItem[]
    noRootCheck?: boolean
    disabled?: boolean
    onSelectionChange: (treeId: string, selectedIds: number[]) => void
}

const TREE_MAX = 75;

export default function TreeRoot({ title, id, items, noRootCheck = false, disabled = false, onSelectionChange }: ITreeRootProps) {
    const [expanded, setExpanded] = React.useState(false);
    const [checked, setChecked] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

    React.useEffect(() => {
        onSelectionChange(id, selectedItems);
    }, [selectedItems]);

    const handlePress = () => {
        setExpanded(!expanded);
    }
    const handleCheck = () => {
        if (checked) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item.id));
        }
        setChecked(!checked);
    }

    const handleSelectionChange = React.useCallback((id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems([...selectedItems.filter((item) => item !== id)]);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }, [selectedItems]);

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            {!noRootCheck && (
                <View style={{ marginTop: 10 }}>
                    <Checkbox disabled={disabled} status={checked ? 'checked' : 'unchecked'} onPress={handleCheck} />
                </View>
            )}
            <View style={{ flex: 1 }}>
                <List.Accordion
                    title={title}
                    key={id}
                    expanded={expanded}
                    onPress={handlePress}>
                    {items.length < TREE_MAX && items.map((item) => (
                        <TreeLeaf
                            checked={selectedItems.includes(item.id)}
                            disabled={disabled}
                            item={item}
                            onClick={handleSelectionChange} />
                    ))}
                    {items.length >= TREE_MAX && (
                        <List.Item
                            title="Too many items to display"
                            description="Please select check parent to import all or none."
                        />
                    )}
                </List.Accordion>
            </View>
        </View>
    );
}