import React, { memo, useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Table, TableWrapper, Row, Cell, Rows } from 'react-native-table-component';
import { Button, Headline, Modal, Text, Portal } from 'react-native-paper';

interface IProps {
    tableName: string
    execAsync: (sqlStatement: string, log?: boolean) => Promise<boolean>
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any[]>
    onClose: () => void
}
const RANGE = 100

const DeleteButton = memo(({ id, onDelete }: { id: string, onDelete: (id: number) => void }) => {
    const onDeletePress = useCallback(() => {
        Alert.alert(
            'Delete Row',
            'Are you sure you want to delete row with id: ' + id,
            [
                { text: 'OK', onPress: () => onDelete(parseInt(id)) },
            ],
            { cancelable: true },
        );
    }, [id, onDelete]);

    return (
        <TouchableOpacity onPress={onDeletePress}>
            <View style={styles.btn}>
                <Text style={styles.btnText}>Delete</Text>
            </View>
        </TouchableOpacity>
    )
}, (prevProps, nextProps) => {
    return prevProps.id === nextProps.id
});

export const SqlTableViewModal = ({ tableName, execAsync, getAllAsync, onClose }: IProps) => {
    const [headers, setHeaders] = useState<string[]>();
    const [widths, setWidths] = useState<number[]>();
    const [data, setData] = useState<string[][]>();
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const getData = async () => {
        try {
            const results1 = await getAllAsync(`SELECT * from ${tableName} LIMIT ${RANGE} OFFSET ${offset}`);
            const results2 = await getAllAsync(`PRAGMA table_info('${tableName}')`);
            const headerStrings: string[] = [];
            const dataStrings: any[] = [];

            for (let i = 0; i < results2.length; ++i) {
                const item = results2[i];
                headerStrings.push(item.name);
            }
            for (let i = 0; i < results1.length; ++i) {
                const item = results1[i];
                const row: any[] = [];
                headerStrings.forEach((c: string) => {
                    row.push(item[c]);
                });
                dataStrings.push(row);
            }
            if (dataStrings.length >= 100) {
                setHasMore(true)
            } else {
                setHasMore(false);
            }
            setHeaders(headerStrings);
            setData(dataStrings);
            setWidths(headerStrings.map(() => 100));
        } catch (e) {
            console.error('cant get table data', e);
        }
    }

    const up = async () => {
        setOffset(offset + RANGE)
    }

    const down = () => {
        setOffset(offset - RANGE > 0 ? offset - RANGE : 0)
    }

    const onClear = useCallback(async () => {
        try {
            await execAsync(`DELETE FROM ${tableName}`);
            getData();
        } catch (e) {
            console.error(e);
        }
    }, [tableName, getData]);

    useEffect(() => {
        getData();
    }, [tableName, offset]);

    const onDeleteRow = useCallback(async (id: number) => {
        try {
            await execAsync(`DELETE FROM ${tableName} WHERE id = ${id}`);
            getData();
        } catch (e) {
            console.error(e);
        }
    }, [tableName, getData]);

    return (
        <Portal>
            <Modal visible={true} onDismiss={() => onClose()} contentContainerStyle={styles.containerStyle}>
                <Headline>Table Contents ({tableName})</Headline>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.buttons}>
                        <Button mode="text" onPress={onClear}>Clear</Button>
                        <Button mode="text" onPress={down}>Down</Button>
                        <Button mode="text" disabled={!hasMore} onPress={up}>Up</Button>
                    </View>
                    {data !== undefined && widths !== undefined && data.length > 0 &&
                        <ScrollView horizontal={true}>
                            <View style={styles.container}>
                                <Table>
                                    <Row widthArr={widths} data={headers} style={styles.head} />
                                    {/* <Rows widthArr={widths} data={data} style={styles.dataRow} /> */}
                                    {data !== undefined && data.length > 0 && data.map((rowData, index) => (
                                        <TableWrapper key={index} style={styles.dataRow}>
                                            {
                                                <>
                                                    {rowData.map((cellData, cellIndex) => (
                                                        <Cell
                                                            key={cellIndex}
                                                            data={cellData}
                                                            width={widths[cellIndex]}
                                                            style={styles.cell}
                                                        />
                                                    ))}
                                                    <Cell
                                                        data={<DeleteButton id={rowData[0]} onDelete={onDeleteRow} />}
                                                        width={60}
                                                    />
                                                </>
                                            }
                                        </TableWrapper>
                                    ))}
                                </Table>
                            </View>
                        </ScrollView>}
                </ScrollView>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    cell: { height: 30, borderRightWidth: .5, borderRightColor: 'grey', borderStyle: 'solid' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    dataRow: { height: 30, borderStyle: 'solid', borderWidth: 1, borderColor: 'black', flexDirection: 'row' },
    text: { margin: 6 },
    scrollView: {
        marginHorizontal: 0,
        height: "90%",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 5,
        margin: 5,
    },
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btn: { width: 50, height: 20, backgroundColor: '#78B7BB', borderRadius: 2, marginLeft: 5 },
    btnText: { textAlign: 'center', color: '#fff' }
});