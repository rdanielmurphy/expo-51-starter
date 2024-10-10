import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { IContact } from '../../lib/types';
import { ContactModal } from '../modals/ContactModal';
import { ContactSearchModal } from '../modals/ContactSearchModal';
import {
    SQL_DELETE_RELATED_CONTACT, SQL_GET_RELATED_CONTACTS, SQL_INSERT_ADDRESS,
    SQL_INSERT_CONTACT, SQL_INSERT_CONTACT_ADDRESS, SQL_INSERT_CONTACT_EMAIL,
    SQL_INSERT_CONTACT_LICENSE, SQL_INSERT_CONTACT_PHONE_NUMBER, SQL_INSERT_EMAIL,
    SQL_INSERT_INSPECTOR_CONTACT_LICENSE, SQL_INSERT_PHONE_NUMBER,
    SQL_INSERT_RELATED_CONTACT, SQL_RESET_CONTACT_ADDRESSES, SQL_RESET_CONTACT_EMAILS,
    SQL_RESET_CONTACT_LICENSES, SQL_RESET_CONTACT_PHONENUMBERS, SQL_UPDATE_ADDRESS,
    SQL_UPDATE_CONTACT, SQL_UPDATE_EMAIL, SQL_UPDATE_LICENSE, SQL_UPDATE_PHONE_NUMBER
} from '../../lib/sqlCommands';
import { useSelector } from 'react-redux';
import { InspectionState } from '../../redux/reducers/inspection';
import { useCallback } from 'react';
import { ClickableList, IClickableListItem } from '../shared/ClickableList';
import { IconButton, ProgressBar, Subheading } from 'react-native-paper';
import * as SQLite from 'expo-sqlite/next';
import { populateContact } from '../../lib/sqlCommon';
import { useDbContext } from '../../contexts/DbContext';

const RelatedContactsTab = () => {
    const { ready, execAsync, getAllAsync, runAsync } = useDbContext();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [contacts, setContacts] = React.useState<IContact[]>([]);
    const [showContactModal, setShowContactModal] = React.useState<boolean>(false)
    const [showSearchContactsModal, setShowSearchContactsModal] = React.useState<boolean>(false)
    const [editableContact, setEditableContact] = React.useState<IContact | undefined>(undefined)
    const [uiReady, setUiReady] = React.useState<boolean>(false);

    React.useEffect(() => {
        const getInspection = async () => {
            try {
                // contacts
                const contacts = await getAllAsync(SQL_GET_RELATED_CONTACTS(inspectionState.id!));
                const theContacts: IContact[] = []

                for (let i = 0; i < contacts.length; i++) {
                    const co = contacts[i];
                    theContacts.push(await populateContact(getAllAsync, co));
                }

                setContacts(theContacts);
                setUiReady(true);
            } catch (e) {
                console.error('fail', e)
            }
        }

        getInspection();
    }, [ready, inspectionState.id]);

    const onAddContact = useCallback(
        async (contact: IContact) => {
            try {
                const contactRes = await runAsync(SQL_INSERT_CONTACT(contact.firstName, contact.lastName, contact.tag));
                contact.id = contactRes.lastInsertRowId;
                setContacts(contacts ? [...contacts, contact] : [contact]);
                execAsync(SQL_INSERT_RELATED_CONTACT(contactRes.lastInsertRowId!, inspectionState.id!));
                if (contact.addresses.length > 0) {
                    contact.addresses.forEach(async (a) => {
                        const addressRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_ADDRESS(a.city, a.isPrimary ? 1 : 0, a.state, a.addr1, a.addr2 || "", a.type || "", a.zip));
                        execAsync(SQL_INSERT_CONTACT_ADDRESS(contactRes.lastInsertRowId!, addressRes.lastInsertRowId!));
                    });
                }
                if (contact.emails.length > 0) {
                    contact.emails.forEach(async (e) => {
                        const emailRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_EMAIL(e.email, e.isPrimary ? 1 : 0, e.type));
                        execAsync(SQL_INSERT_CONTACT_EMAIL(contactRes.lastInsertRowId!, emailRes.lastInsertRowId!));
                    });
                }
                if (contact.phones.length > 0) {
                    contact.phones.forEach(async (p) => {
                        const phoneRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_PHONE_NUMBER(p.number, p.extension, p.isPrimary ? 1 : 0, p.type));
                        execAsync(SQL_INSERT_CONTACT_PHONE_NUMBER(contactRes.lastInsertRowId!, phoneRes.lastInsertRowId!));
                    });
                }
                if (contact.licenses.length > 0) {
                    contact.licenses.forEach(async (l) => {
                        const licenseRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_INSPECTOR_CONTACT_LICENSE(l.licenseNumber, l.state, l.startDate, l.type, contact.id!));
                        execAsync(SQL_INSERT_CONTACT_LICENSE(contactRes.lastInsertRowId!, licenseRes.lastInsertRowId!));
                    });
                }
            }
            catch (e) {
                console.error(e)
            }
        }, [contacts, ready]
    );

    const onContactUpdate = useCallback(
        async (contact: IContact) => {
            try {
                const newList: IContact[] = [];
                contacts?.forEach((l) => {
                    if (l.id === contact.id) {
                        newList.push(contact);
                    } else {
                        newList.push(l);
                    }
                });
                setContacts(newList);
                execAsync(SQL_UPDATE_CONTACT(contact.id!, contact.firstName, contact.lastName, contact.tag));

                // reset all children and re-add. orphan records
                await Promise.all([
                    execAsync(SQL_RESET_CONTACT_ADDRESSES(contact.id!)),
                    execAsync(SQL_RESET_CONTACT_EMAILS(contact.id!)),
                    execAsync(SQL_RESET_CONTACT_PHONENUMBERS(contact.id!)),
                    execAsync(SQL_RESET_CONTACT_LICENSES(contact.id!)),
                ])
                if (contact.addresses.length > 0) {
                    contact.addresses.forEach(async (a) => {
                        if (a.id !== undefined) {
                            execAsync(SQL_UPDATE_ADDRESS(a, a.id));
                        } else {
                            const addressRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_ADDRESS(a.city, a.isPrimary ? 1 : 0, a.state, a.addr1, a.addr2 || "", a.type || "", a.zip));
                            execAsync(SQL_INSERT_CONTACT_ADDRESS(contact.id!, addressRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.emails.length > 0) {
                    contact.emails.forEach(async (e) => {
                        if (e.id !== undefined) {
                            execAsync(SQL_UPDATE_EMAIL(e, e.id));
                        } else {
                            const emailRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_EMAIL(e.email, e.isPrimary ? 1 : 0, e.type));
                            execAsync(SQL_INSERT_CONTACT_EMAIL(contact.id!, emailRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.phones.length > 0) {
                    contact.phones.forEach(async (p) => {
                        if (p.id !== undefined) {
                            execAsync(SQL_UPDATE_PHONE_NUMBER(p, p.id));
                        } else {
                            const phoneRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_PHONE_NUMBER(p.number, p.extension, p.isPrimary ? 1 : 0, p.type));
                            execAsync(SQL_INSERT_CONTACT_PHONE_NUMBER(contact.id!, phoneRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.licenses.length > 0) {
                    contact.licenses.forEach(async (l) => {
                        if (l.id !== undefined) {
                            execAsync(SQL_UPDATE_LICENSE(l, l.id));
                        } else {
                            const licenseRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_INSPECTOR_CONTACT_LICENSE(l.licenseNumber, l.state, l.startDate, l.type, contact.id!));
                            execAsync(SQL_INSERT_CONTACT_LICENSE(contact.id!, licenseRes.lastInsertRowId!));
                        }
                    });
                }
            }
            catch (e) {
                console.error(e)
            }
        }, [contacts, ready]
    );

    const onContactDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: IContact[] = [];
            contacts?.forEach((c) => {
                if (c.id !== item.id) {
                    newList.push(c);
                }
            });
            setContacts(newList);
            execAsync(SQL_DELETE_RELATED_CONTACT(item.id!));
        }, [contacts, ready]
    );

    return !uiReady ? (
        <View style={{ flex: 1, padding: 8 }}><ProgressBar indeterminate={true} /></View>
    ) : (
        <View style={styles.container}>
            <View style={styles.formComponent}>
                <View style={{ display: "flex", "flexDirection": "row" }}>
                    <View style={{ marginTop: 8, "flexDirection": "row", alignContent: "flex-start", alignItems: "flex-start", flex: 1 }}>
                        <Subheading>Related Contacts</Subheading>
                    </View>
                    <View style={{ "flexDirection": "row", alignContent: "flex-end", alignItems: "flex-end" }}>
                        <IconButton
                            style={{ width: 25 }}
                            icon="plus-circle"
                            onPress={() => {
                                setEditableContact(undefined);
                                setShowContactModal(true);
                            }}
                        />
                        <IconButton
                            style={{ width: 25 }}
                            icon="magnify"
                            onPress={() => {
                                setEditableContact(undefined);
                                setShowSearchContactsModal(true);
                            }}
                        />
                    </View>
                </View>
                <ClickableList
                    items={contacts?.map((c: IContact) => ({
                        id: c.id,
                        text: `${c.firstName} ${c.lastName}`,
                    } as IClickableListItem)) || []}
                    onRowPress={(item: IClickableListItem) => {
                        const i = contacts ? contacts.findIndex((v) => v.id === item.id) : -1;
                        if (i >= 0 && contacts) {
                            setEditableContact(contacts[i]);
                            setShowContactModal(true);
                        }
                    }}
                    onRowDelete={onContactDelete} />
            </View>
            {showContactModal &&
                <ContactModal
                    editMode={editableContact !== undefined}
                    onClose={() => setShowContactModal(false)}
                    onSubmit={(value: IContact) => {
                        if (editableContact === undefined) {
                            onAddContact(value);
                        } else {
                            onContactUpdate(value);
                        }
                        setShowContactModal(false);
                    }}
                    value={editableContact}
                />
            }

            {showSearchContactsModal &&
                <ContactSearchModal
                    idFilter={contacts.map(c => c.id!)}
                    onClose={() => setShowSearchContactsModal(false)}
                    onSubmit={async (value?: IContact) => {
                        setShowSearchContactsModal(false);
                        if (value) {
                            const theContact = await populateContact(getAllAsync, value);
                            setContacts(contacts ? [...contacts, theContact] : [theContact]);
                            execAsync(SQL_INSERT_RELATED_CONTACT(theContact.id!, inspectionState.id!));
                        }
                    }} />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    formComponent: {
        padding: 10
    },
});

export default React.memo(RelatedContactsTab, () => true);