import React, { useEffect, useState } from 'react'
import { FlatList, TouchableHighlight, StyleSheet, View } from 'react-native';
import { RadioButton, Subheading, Surface, TextInput } from 'react-native-paper';
import { IContact } from '../../lib/types';
import { SQL_GET_CONTACTS } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    idFilter: number[]
    onClose: () => void
    onSubmit: (value?: IContact) => void
}

const getContactNameString = (contact: IContact) => contact.lastName + ", " + contact.firstName

export const ContactSearchModal = (props: IProps) => {
    const { getAllAsync, ready } = useDbContext();
    const [searchText, setSearchText] = useState<string>("");
    const [selectedContact, setSelectedContact] = useState<IContact | undefined>();
    const [filteredContactList, setFilteredContactList] = useState<IContact[]>([]);
    const [fullContactList, setFullContactList] = useState<IContact[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        if (filteredContactList.findIndex((v: IContact) => v.id === selectedContact?.id) >= 0) {
            props.onSubmit(selectedContact!);
        } else {
            props.onSubmit(undefined);
        }
    }

    useEffect(() => {
        setFilteredContactList(
            fullContactList.filter((c) => c.firstName.includes(searchText) || c.lastName.includes(searchText))
                .slice(0, 5))
    }, [fullContactList, searchText]);

    useEffect(() => {
        const getContacts = async () => {
            const contactsResult = await getAllAsync(SQL_GET_CONTACTS());
            let list: IContact[] = []
            contactsResult.forEach((co) => {
                if (!props.idFilter.includes(co.id)) {
                    list.push({
                        firstName: co.firstName,
                        lastName: co.lastName,
                        id: co.id,
                        tag: co.tag,
                        role: co.role,
                        addresses: [],
                        emails: [],
                        phones: [],
                        licenses: []
                    })
                }
            })
            list.sort((a, b) => {
                const aName = getContactNameString(a);
                const bName = getContactNameString(b);
                return aName.localeCompare(bName);
            })
            setFullContactList(list);
            setFilteredContactList(list.slice(0, 5))

            setLoading(false);
        }

        if (ready) {
            getContacts();
        }
    }, [ready]);

    return (
        <Dialog
            visible={true}
            title={"Search Contacts"}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready}
                    confirmText={"Select"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading &&
                <View>
                    {fullContactList.length > 0 &&
                        <View style={styles.formComponent}>
                            <TextInput
                                autoComplete="off"
                                label={"First Name/Last Name"}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                    }

                    {filteredContactList.length > 0 &&
                        <View>
                            <FlatList
                                data={filteredContactList}
                                keyExtractor={(_item, index) => index.toString()}
                                renderItem={({ item, index, separators }) => (
                                    <Surface key={item.id} style={styles.surface}>
                                        <TouchableHighlight
                                            key={index}
                                            onPress={() => { }}
                                            activeOpacity={0.6}
                                            underlayColor="#DDDDDD"
                                            onShowUnderlay={separators.highlight}
                                            onHideUnderlay={separators.unhighlight}>
                                            <View key={item.id} style={styles.view}>
                                                <View style={{ flex: 1, flexBasis: '85%' }}>
                                                    <Subheading onPress={() => setSelectedContact(item)}>{getContactNameString(item)}</Subheading>
                                                </View>
                                                <View style={{ flex: 1, flexBasis: '15%' }}>
                                                    <RadioButton
                                                        value="first"
                                                        status={selectedContact !== undefined && selectedContact.id === item.id ? 'checked' : 'unchecked'}
                                                        onPress={() => setSelectedContact(item)}
                                                    />
                                                </View>
                                            </View>
                                        </TouchableHighlight>
                                    </Surface>
                                )}
                            />
                        </View>
                    }

                    {fullContactList.length > 0 && filteredContactList.length === 0 &&
                        <View style={styles.formComponent}>
                            <Subheading>No results...</Subheading>
                        </View>
                    }

                    {fullContactList.length === 0 &&
                        <View style={styles.formComponent}>
                            <Subheading>No contacts left to add...</Subheading>
                        </View>
                    }
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

