import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TouchableHighlight, View } from 'react-native';
import { Divider, Subheading, Text, Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SQL_GET_SUBSECTIONS } from '../../lib/sqlCommands';
import { PhotosState } from '../../redux/reducers/photos';
import { useDbContext } from '../../contexts/DbContext';

interface IItem {
    id: number
    name: string
    count: number
}

export const SectionPhotosListScreen = ({ navigation: { navigate }, route }: any) => {
    const { getAllAsync, ready } = useDbContext();
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const photosState: PhotosState = useSelector((state: any) => state.photosState);

    useEffect(() => {
        const getPhotosList = (async () => {
            const results = await getAllAsync(SQL_GET_SUBSECTIONS(route.params.id));
            let items: IItem[] = [];
            for (let i = 0; i < results.length; ++i) {
                const item = results[i];
                items.push({
                    id: item.id,
                    name: item.name,
                    count: photosState.photos?.filter(p => p.subsectionId === item.id).length || 0,
                });
            }
            setFlatListItems(items);
        });
        getPhotosList();
    }, [ready, photosState.updateCounter]);

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <FlatList
                data={flatListItems}
                ItemSeparatorComponent={Divider}
                keyExtractor={(_item, index) => index.toString()}
                renderItem={({ item, index, separators }) => (
                    <Surface key={item.name} style={styles.surface}>
                        <TouchableHighlight
                            key={item.id}
                            onPress={() => {
                                navigate("SubsectionPhotosList", { id: item.id })
                            }}
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            <View key={item.name} style={styles.view}>
                                <View style={{ flex: 1, flexBasis: '90%' }}>
                                    <Subheading>{item.name}</Subheading>
                                </View>
                                <View style={{ flex: 2, flexBasis: 50 }}>
                                    <Text>{item.count}</Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        padding: 20,
    }
});

