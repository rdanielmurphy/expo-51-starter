import React, { useCallback, useEffect, useState } from 'react'
import { TouchableHighlight, StyleSheet, View } from 'react-native';
import { Button, RadioButton, Subheading, Surface, TextInput } from 'react-native-paper';
import { SQL_GET_COMMENT_GROUPS, SQL_INSERT_COMMENT_GROUP } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';
import { ICommentGroup } from '../../lib/types';

interface IProps {
    currentGroupId?: number
    onClose: () => void
    onEditComments?: (groupId: number, groupName: string) => void
    onSubmit: (groupId: number) => void
}

export const EditCommentGroupModal = (props: IProps) => {
    const { execAsync, ready, getAllAsync } = useDbContext();
    const [searchText, setSearchText] = useState<string>("");
    const [selectedGroup, setSelectedGroup] = useState<ICommentGroup | undefined>();
    const [filteredGroupList, setFilteredGroupList] = useState<ICommentGroup[]>([]);
    const [fullGroupList, setFullGroupList] = useState<ICommentGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [commentGroupName, setCommentGroupName] = useState<string>();
    const [newCommentGroupName, setNewCommentGroupName] = useState<string>();
    const [newMode, setNewMode] = useState<boolean>(false);
    const [nextCommentNumber, setNextCommentNumber] = useState<number>();

    const onClose = useCallback(() => props.onClose(), [props.onClose]);
    const onSubmit = useCallback(async () => {
        if (!newMode && filteredGroupList.findIndex((v: ICommentGroup) => v.id === selectedGroup?.id) >= 0) {
            props.onSubmit(selectedGroup!.number);
        } else if (newMode && newCommentGroupName && newCommentGroupName.length > 0 && nextCommentNumber) {
            await execAsync(SQL_INSERT_COMMENT_GROUP(newCommentGroupName, nextCommentNumber));
            props.onSubmit(nextCommentNumber);
        }
    }, [selectedGroup, newCommentGroupName, nextCommentNumber, props.onSubmit, execAsync]);

    useEffect(() => {
        setFilteredGroupList(
            fullGroupList.filter((g) => g.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()))
                .slice(0, 5))
    }, [fullGroupList, searchText]);

    useEffect(() => {
        const getGroups = async () => {
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
            setFilteredGroupList(list.slice(0, 5));

            const c = list.find(v => v.number === props.currentGroupId);
            setCommentGroupName(c?.name ?? "");
            setNextCommentNumber(maxNumber + 1);
            setLoading(false);
        }

        if (ready) {
            getGroups();
        }
    }, [ready, props.currentGroupId]);

    const handleAddClick = useCallback(() => {
        setNewMode(true);
    }, []);

    const handleEditClick = useCallback(() => {
        if (props.onEditComments && props.currentGroupId && commentGroupName) {
            props.onEditComments(props.currentGroupId, commentGroupName)
        }
    }, [props.onEditComments, props.currentGroupId, commentGroupName]);

    return (
        <Dialog
            visible={true}
            title={newMode ? "Add New Comment Group" : "Edit Comment Group"}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready || (newMode && (newCommentGroupName === undefined || newCommentGroupName?.length === 0)) ||
                        (!newMode && selectedGroup === undefined)}
                    confirmText={"Select"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading && !newMode &&
                <View>
                    {commentGroupName &&
                        (
                            <View>
                                <Subheading>Current group: {commentGroupName}</Subheading>
                            </View>
                        )
                    }

                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Button mode="text" onPress={handleEditClick}>Edit Comments</Button>
                        <Button mode="text" onPress={handleAddClick}>Add New Comment Group</Button>
                    </View>

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
                    <View>
                        {filteredGroupList.length > 0 && filteredGroupList.map((item) => (
                            <Surface key={item.id} style={styles.surface}>
                                <TouchableHighlight
                                    onPress={() => { }}
                                    activeOpacity={0.6}
                                    underlayColor="#DDDDDD">
                                    <View key={item.id} style={styles.view}>
                                        <View style={{ flex: 1, flexBasis: '85%' }}>
                                            <Subheading onPress={() => setSelectedGroup(item)}>{item.name}</Subheading>
                                        </View>
                                        <View style={{ flex: 1, flexBasis: '15%' }}>
                                            <RadioButton
                                                value="first"
                                                status={selectedGroup !== undefined && selectedGroup.id === item.id ? 'checked' : 'unchecked'}
                                                onPress={() => setSelectedGroup(item)}
                                            />
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </Surface>
                        ))}
                    </View>

                    {fullGroupList.length > 0 && filteredGroupList.length === 0 &&
                        <View style={styles.formComponent}>
                            <Subheading>No results...</Subheading>
                        </View>
                    }

                    {fullGroupList.length === 0 &&
                        <View style={styles.formComponent}>
                            <Subheading>No comment groups</Subheading>
                        </View>
                    }
                </View>
            }
            {!loading && newMode &&
                <View>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="off"
                            label={"Comment group name"}
                            value={newCommentGroupName}
                            onChangeText={setNewCommentGroupName}
                        />
                    </View>
                </View>
            }
        </Dialog>
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

