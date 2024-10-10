import React, { useCallback, useEffect, useState } from 'react'
import { TouchableHighlight, StyleSheet, View, ActivityIndicator } from 'react-native';
import { RadioButton, Subheading, Surface, TextInput } from 'react-native-paper';

export interface ISearchItemSelectorItem {
    id: number
    name: string
}

interface IProps {
    items: ISearchItemSelectorItem[]
    loading: boolean
    searchPlaceholder: string
    onChange: (selectedId: number) => void
}

export const SearchItemSelector = ({ items, loading, searchPlaceholder, onChange }: IProps) => {
    const [searchText, setSearchText] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState<ISearchItemSelectorItem | undefined>();
    const [filteredItemList, setFilteredItemList] = useState<ISearchItemSelectorItem[]>([]);

    useEffect(() => {
        setFilteredItemList(
            items.filter((g) => g.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()))
                .slice(0, 5))
    }, [items, searchText]);

    const handleOnChange = useCallback((item: ISearchItemSelectorItem) => {
        setSelectedItem(item);
        onChange(item.id);
    }, [onChange]);

    return (
        <View>
            {!loading && items.length > 0 &&
                <View style={styles.formComponent}>
                    <TextInput
                        autoComplete="off"
                        label={searchPlaceholder}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            }
            {!loading &&
                <View>
                    {filteredItemList.length > 0 && filteredItemList.map((item) => (
                        <Surface key={item.id} style={styles.surface}>
                            <TouchableHighlight
                                onPress={() => { }}
                                activeOpacity={0.6}
                                underlayColor="#DDDDDD">
                                <View key={item.id} style={styles.view}>
                                    <View style={{ flex: 1, flexBasis: '85%' }}>
                                        <Subheading onPress={() => handleOnChange(item)}>{item.name}</Subheading>
                                    </View>
                                    <View style={{ flex: 1, flexBasis: '15%' }}>
                                        <RadioButton
                                            value="first"
                                            status={selectedItem !== undefined && selectedItem.id === item.id ? 'checked' : 'unchecked'}
                                            onPress={() => handleOnChange(item)}
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </Surface>
                    ))}
                </View>
            }

            {!loading && items.length > 0 && filteredItemList.length === 0 &&
                <View style={styles.formComponent}>
                    <Subheading>No results...</Subheading>
                </View>
            }

            {!loading && items.length === 0 &&
                <View style={styles.formComponent}>
                    <Subheading>No contacts left to add...</Subheading>
                </View>
            }

            {loading &&
                <View style={styles.formComponent}>
                    <ActivityIndicator size="large" />
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    surface: {
        margin: 5,
    },
    containerStyle: {
        backgroundColor: 'white',
        margin: 20,
    },
    formComponent: {
        padding: 10
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        alignItems: "center",
    }
});

