import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { IconButton, ProgressBar, Subheading, Surface, TextInput } from 'react-native-paper';
import {
    SQL_GET_COMMENT_GROUPS
} from '../../lib/sqlCommands';
import { addEditCommentGroupModal } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useDbContext } from '../../contexts/DbContext';
import { ICommentGroup } from '../../lib/types';
import { AddEditCommentGroupModalState } from '../../redux/reducers/addEditCommentGroupModal';
import { AddCommentGroupModal } from '../modals/AddCommentGroupModal';

const FILTER_LENGTH = 10;

export const EditCommentGroupsScreenHeader = (props: any) => {
    const dispatch = useDispatch();

    const onAddPress = useCallback(() => {
        addEditCommentGroupModal({ show: true })(dispatch);
    }, []);

    return (
        <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{props.children}</Text>
            <IconButton
                style={{ width: 50 }}
                icon="plus-circle"
                onPress={onAddPress}
            />
        </View>
    )
}

export const EditCommentGroupsScreen = ({ navigation: { navigate } }: any) => {
    const addEditCommentGroup: AddEditCommentGroupModalState = useSelector((state: any) => state.addEditCommentGroupModalState);
    const { ready, getAllAsync } = useDbContext();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>("");
    const [refreshCounter, setRefreshCounter] = useState<number>(1);
    const [nextCommentNumber, setNextCommentNumber] = useState<number>(1);

    const [filteredGroupList, setFilteredGroupList] = useState<ICommentGroup[]>([]);
    const [fullGroupList, setFullGroupList] = useState<ICommentGroup[]>([]);

    useEffect(() => {
        setFilteredGroupList(
            fullGroupList.filter((g) => g.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()))
                .slice(0, FILTER_LENGTH))
    }, [fullGroupList, searchText]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            try {
                let maxNumber = 0;
                const groupsResult = await getAllAsync(SQL_GET_COMMENT_GROUPS());
                let list: ICommentGroup[] = []
                groupsResult.forEach((g) => {
                    list.push({
                        name: g.name,
                        id: g.id,
                        number: g.number,
                    });
                    maxNumber = Math.max(maxNumber, g.number);
                })
                list.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    return aName.localeCompare(bName);
                })
                setFullGroupList(list);
                setFilteredGroupList(list.slice(0, FILTER_LENGTH));

                setNextCommentNumber(maxNumber + 1);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to get overview', err)
            }
        }

        if (ready) {
            getData();
        }
    }, [ready, refreshCounter]);

    const onCommentGroupEdit = useCallback((commentGroup: ICommentGroup) => {
        setSearchText("");
        navigate("EditComments", { id: commentGroup.id, name: commentGroup.name })
    }, []);

    const onCommentGroupAddCancel = useCallback(() => {
        addEditCommentGroupModal({ show: false })(dispatch);
    }, [dispatch]);

    const onCommentGroupAdd = useCallback((id?: number, name?: string) => {
        setRefreshCounter(refreshCounter + 1);
        if (id && name) {
            setSearchText("");
            navigate("EditComments", { id: id, name: name })
        }
    }, [refreshCounter]);

    return (
        <View>
            {fullGroupList.length > 0 &&
                <View style={styles.formComponent}>
                    <TextInput
                        autoComplete="off"
                        label={"Search comment groups"}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            }

            {isLoading && <ProgressBar indeterminate={true} />}

            <View>
                <View>
                    {filteredGroupList.length > 0 && filteredGroupList.map((item) => (
                        <Surface key={item.id} style={styles.surface}>
                            <TouchableHighlight
                                onPress={() => onCommentGroupEdit(item)}
                                activeOpacity={0.6}
                                underlayColor="#DDDDDD">
                                <View key={item.id} style={styles.view}>
                                    <View>
                                        <Subheading onPress={() => onCommentGroupEdit(item)}>{item.name}</Subheading>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </Surface>
                    ))}
                </View>
                {addEditCommentGroup.show && (
                    <AddCommentGroupModal
                        num={nextCommentNumber}
                        onClose={onCommentGroupAddCancel}
                        onSubmit={onCommentGroupAdd}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    rowItem: {
        width: "100%",
        padding: 8,
        display: "flex"
    },
    formComponent: {
        padding: 10
    },
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        paddingBottom: 10,
        paddingTop: 10,
        alignItems: "center",
    },
});
