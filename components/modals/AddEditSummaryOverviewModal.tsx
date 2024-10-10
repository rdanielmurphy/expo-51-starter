import React, { useCallback, useEffect, useState } from 'react'
import { Text, StyleSheet, View } from 'react-native';
import { Subheading, TextInput } from 'react-native-paper';
import { ICommentGroup } from '../../lib/types';
import { SQL_GET_COMMENT_GROUPS } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';
import { ISearchItemSelectorItem, SearchItemSelector } from '../shared/SearchItemSelector';

export interface INewSummaryOverview {
    name: string
    commentListNumber?: number
}

interface IProps {
    type: "summary" | "overview"
    mode: "add" | "edit"
    currentName?: string
    currentGroupId?: number
    onClose: () => void
    onSubmit: (value: INewSummaryOverview) => void
}

export const AddEditSummaryOverviewModal = (props: IProps) => {
    const { getAllAsync, ready } = useDbContext();
    const [fullGroupList, setFullGroupList] = useState<ISearchItemSelectorItem[]>([]);
    const [selectedCommentListNumber, setSelectedCommentListNumber] = useState<number>();
    const [name, setName] = useState<string>(props.mode === "edit" && props.currentName ? props.currentName : "");
    const [loading, setLoading] = useState<boolean>(true);
    const [commentGroupName, setCommentGroupName] = useState<string>();
    const [step, setStep] = useState<number>(0);

    const handleClose = useCallback(() => {
        if (step === 0) {
            props.onClose();
        } else {
            setStep(0);
        }
    }, [step, props.onClose]);

    const onSubmit = useCallback(() => {
        if (step === 0) {
            setStep(1);
        } else {
            props.onSubmit({
                name: name,
                commentListNumber: selectedCommentListNumber!
            });
        }
    }, [name, selectedCommentListNumber, props.onSubmit, step]);

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
            setFullGroupList(list.map((g) => ({ id: g.number, name: g.name })));

            if (props.currentGroupId !== undefined && props.mode === "edit") {
                const c = list.find(v => v.number === props.currentGroupId);
                setCommentGroupName(c?.name ?? "");
            }

            setLoading(false);
        }

        if (ready) {
            getGroups();
        }
    }, [ready]);

    return (
        <Dialog
            visible={true}
            title={`${props.mode === "add" ? "Add" : "Edit"} ${props.type} section`}
            buttons={step === 0 ? (
                <ModalButtons
                    confirmDisabled={!ready || (name === undefined || name?.length === 0)}
                    confirmText={"Next"}
                    cancelAction={handleClose}
                    confirmAction={onSubmit} />
            ) : (
                <ModalButtons
                    confirmDisabled={!ready}
                    confirmText={"Save"}
                    cancelAction={handleClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={props.onClose}>
            <View>
                {step === 0 && (
                    <View style={styles.formComponent}>
                        <Subheading>Name of {props.type} section:</Subheading>
                        <TextInput
                            autoFocus
                            value={name}
                            onChangeText={setName}
                            selectionColor={"#fff"}
                            cursorColor={"#000"}
                        />
                    </View>
                )}
                {step === 1 && (
                    <View>
                        <View style={styles.formComponent}>
                            <Subheading>Select comment group for {props.type} section:</Subheading>
                            {commentGroupName && props.currentGroupId !== undefined && props.mode === "edit" &&
                                (
                                    <View>
                                        <Subheading>Current group: {commentGroupName}</Subheading>
                                    </View>
                                )
                            }
                        </View>
                        <SearchItemSelector
                            items={fullGroupList}
                            loading={loading}
                            searchPlaceholder={"Search comment group"}
                            onChange={setSelectedCommentListNumber}
                        />
                    </View>
                )}
            </View>
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
        paddingBottom: 10
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        alignItems: "center",
    }
});

