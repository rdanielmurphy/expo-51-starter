import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SqlTableViewModal } from '../modals/SqlTableViewModal';
import { SQL_GET_ALL_TABLES } from '../../lib/sqlCommands';
import { useDbContext } from '../../contexts/DbContext';

const ViewAllTable = ({ onTableRowClick } : { onTableRowClick: (tableName: string) => void } ) => {
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const { deleteDB, getAllAsync, ready } = useDbContext();

    useEffect(() => {
        const getDbTable = (async () => {
            const results = await getAllAsync(SQL_GET_ALL_TABLES);
            var temp = [];
            for (let i = 0; i < results.length; ++i) {
                const item = results[i];
                if (item.name !== 'sqlite_sequence' && item.name !== 'android_metadata') {
                    temp.push(item);
                }
            }
            setFlatListItems(temp.sort((a: any, b: any) => {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            }));
        });
        getDbTable();
    }, [ready]);

    const ListViewItemSeparator = () => {
        return (
            <View style={{ height: 0.2, width: '100%', backgroundColor: '#808080' }} />
        );
    };

    return (
        <>
            <View>
                <Button icon="delete" mode="contained" onPress={() => deleteDB()}>
                    Reset the DB
                </Button>
                <FlatList
                    data={flatListItems}
                    ItemSeparatorComponent={ListViewItemSeparator}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View key={item.name} style={{ backgroundColor: 'white', padding: 20 }} >
                            <Text>Table: {item.name}</Text>
                            { /* @ts-ignore */}
                            <Button icon="information" mode="contained" onPress={() => {
                                onTableRowClick(item.name);
                            }}></Button>
                        </View>
                    )}
                />
            </View>
        </>
    );
}

export const TablesScreen = (navigation: any) => {
    const onTableRowClick = useCallback((tableName: string) => {
        navigation.navigation.navigate('SqlTableView', { tableName });
    }, []);
    
    return (
        <ViewAllTable onTableRowClick={onTableRowClick} />
    )
}