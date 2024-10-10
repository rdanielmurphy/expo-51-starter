import * as React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Button, IconButton, ProgressBar, Subheading, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
    SQL_GET_INSPECTION, SQL_GET_ADDRESS, SQL_UPDATE_INSPECTION_NAME, SQL_UPDATE_INSPECTION_NUMBER, SQL_UPDATE_ADDRESS,
    SQL_UPDATE_STATUS, SQL_INSERT_IMAGE, SQL_DELETE_IMAGE, SQL_UPDATE_COVER_PHOTO, SQL_DELETE_INSPECTION_CONTACT, SQL_INSERT_CONTACT,
    SQL_INSERT_INSPECTION_CONTACT, SQL_INSERT_ADDRESS, SQL_INSERT_CONTACT_ADDRESS, SQL_INSERT_EMAIL, SQL_INSERT_PHONE_NUMBER,
    SQL_INSERT_LICENSE, SQL_UPDATE_CONTACT, SQL_INSERT_CONTACT_EMAIL, SQL_INSERT_CONTACT_PHONE_NUMBER, SQL_INSERT_CONTACT_LICENSE,
    SQL_UPDATE_EMAIL, SQL_UPDATE_PHONE_NUMBER, SQL_UPDATE_LICENSE, SQL_RESET_CONTACT_ADDRESSES, SQL_RESET_CONTACT_EMAILS,
    SQL_RESET_CONTACT_PHONENUMBERS, SQL_RESET_CONTACT_LICENSES, SQL_GET_INSPECTION_CONTACTS, SQL_INSERT_INSPECTOR_CONTACT_LICENSE, SQL_UPDATE_INSPECTION_DATE
} from '../../lib/sqlCommands';
import { InspectionState } from '../../redux/reducers/inspection';
import * as SQLite from 'expo-sqlite/next';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { memo, useCallback } from 'react';
import { format } from "date-fns";
import { IAddress, IContact } from '../../lib/types';
import { AddressPicker } from '../shared/AddressPicker';
import { StandardPicker } from '../shared/StandardPicker';
import PhotoPreview from '../shared/PhotoPreview';
import { IPhoto } from '../../redux/reducers/photos';
import { updateAddPhotoModal, updateSnackbar } from '../../redux/actions';
import { launchCamera, launchPicker, saveToPhone } from '../../lib/camera';
import { initialState } from '../../redux/reducers/addPhotoModal';
import { Asset } from 'expo-media-library';
import { ClickableList, IClickableListItem } from '../shared/ClickableList';
import { ContactModal } from '../modals/ContactModal';
import { ContactSearchModal } from '../modals/ContactSearchModal';
import { populateContact } from '../../lib/sqlCommon';
import { useDbContext } from '../../contexts/DbContext';
import { escapeString } from '../../lib/databaseDataHelper';

const GeneralTab = () => {
    const { colors } = useTheme();
    const { ready, execAsync, getAllAsync, getFirstAsync, runAsync } = useDbContext();
    const dispatch = useDispatch();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [name, setName] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [date, setDate] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [time, setTime] = React.useState(new Date());
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const [address, setAddress] = React.useState<IAddress>();
    const [addressId, setAddressId] = React.useState<number>();
    const [status, setStatus] = React.useState('Quoted');
    const [coverPhoto, setCoverPhoto] = React.useState<IPhoto>();
    const [contacts, setContacts] = React.useState<IContact[]>([]);
    const [showContactModal, setShowContactModal] = React.useState<boolean>(false)
    const [showSearchContactsModal, setShowSearchContactsModal] = React.useState<boolean>(false)
    const [editableContact, setEditableContact] = React.useState<IContact | undefined>(undefined)
    const [uiReady, setUiReady] = React.useState<boolean>(false);

    React.useEffect(() => {
        const getInspection = async () => {
            try {
                const theInspectionObject = await getFirstAsync(SQL_GET_INSPECTION(inspectionState.id!));
                if (theInspectionObject) {
                    setName(theInspectionObject.inspectionName);
                    setNumber(theInspectionObject.number);
                    try {
                        if (theInspectionObject.inspectionDate) {
                            setDate(new Date(theInspectionObject.inspectionDate));
                            setTime(new Date(theInspectionObject.inspectionDate));
                        }
                    } catch (_e) {
                        // swallow
                    }
                    const theAddressObject = await getFirstAsync(SQL_GET_ADDRESS(theInspectionObject.address_id!));
                    setAddress({
                        addr1: theAddressObject.street,
                        addr2: theAddressObject.street2,
                        city: theAddressObject.city,
                        state: theAddressObject.state,
                        zip: theAddressObject.zipCode,
                    })
                    setAddressId(theAddressObject.id);
                    setStatus(theInspectionObject.status);
                    if (theInspectionObject.coverFileId) {
                        setCoverPhoto({
                            id: theInspectionObject.coverFileId,
                            uri: theInspectionObject.coverFileName
                        });
                    }

                    // contacts
                    const contactsRes = await getAllAsync(SQL_GET_INSPECTION_CONTACTS(inspectionState.id!));
                    const theContacts: IContact[] = []
                    for (let i = 0; i < contactsRes.length; i++) {
                        const co = contactsRes[i];
                        theContacts.push(await populateContact(getAllAsync, co));
                    }
                    setContacts(theContacts);
                }

                setUiReady(true);
            } catch (e) {
                console.error('fail', e)
            }
        }

        if (ready && inspectionState.id) {
            getInspection();
        }
    }, [ready, inspectionState.id, getFirstAsync, getAllAsync]);

    React.useEffect(() => {
        if (ready && inspectionState.id) {
            try {
                const dateString = `${format(date, "yyyy-MM-dd")}T${format(time, "HH:MM:SS")}`;
                const newDate = new Date(dateString);
                execAsync(SQL_UPDATE_INSPECTION_DATE(inspectionState.id!, newDate.getTime()));
            } catch (e) {
                console.error('Error setting date', e);
            }
        }
    }, [execAsync, ready, date, time, inspectionState.id]);

    const saveCoverToPhone = async (uri: string) => {
        await saveToPhone(uri, (err: string) => {
            failSnackbar(err);
        }, async (asset: Asset) => {
            const imageResult = await runAsync(SQL_INSERT_IMAGE(asset.uri, inspectionState.id!));
            await execAsync(SQL_UPDATE_COVER_PHOTO(imageResult.lastInsertRowId!, inspectionState.id!));
            if (coverPhoto && coverPhoto.id) {
                execAsync(SQL_DELETE_IMAGE(coverPhoto.id));
            }
            setCoverPhoto({
                id: imageResult.lastInsertRowId!,
                uri: asset.uri
            });
            successSnackbar();
            updateAddPhotoModal(initialState)(dispatch);
        });
    };

    const successSnackbar = () =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: "Added cover photo"
        })(dispatch);

    const failSnackbar = (message?: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message ? message : "Could not add cover photo"
        })(dispatch);

    const onAddressChange = useCallback(
        (address: IAddress) => {
            setAddress(address);
            execAsync(SQL_UPDATE_ADDRESS(address, addressId!));
        }, [addressId, execAsync]
    );

    const onCoverChange = () => {
        updateAddPhotoModal({
            show: true,
            name: "Cover",
            onCameraClick: () => launchCamera(failSnackbar, saveCoverToPhone),
            onExisitingClick: () => launchPicker(saveCoverToPhone)
        })(dispatch);
    }

    const onCoverClear = () => { }

    const onContactDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: IContact[] = [];
            contacts?.forEach((c) => {
                if (c.id !== item.id) {
                    newList.push(c);
                }
            });
            setContacts(newList);
            execAsync(SQL_DELETE_INSPECTION_CONTACT(item.id!));
        }, [contacts, ready, execAsync]
    );

    const onAddContact = useCallback(
        async (contact: IContact) => {
            try {
                const contactRes = await runAsync(SQL_INSERT_CONTACT(escapeString(contact.firstName), escapeString(contact.lastName), contact.tag));
                contact.id = contactRes.lastInsertRowId;
                setContacts(contacts ? [...contacts, contact] : [contact]);
                execAsync(SQL_INSERT_INSPECTION_CONTACT(contactRes.lastInsertRowId!, inspectionState.id!));
                if (contact.addresses.length > 0) {
                    contact.addresses.forEach(async (a) => {
                        const addressRes = await runAsync(SQL_INSERT_ADDRESS(a.city, a.isPrimary ? 1 : 0, a.state, a.addr1, a.addr2 || "", a.type || "", a.zip));
                        execAsync(SQL_INSERT_CONTACT_ADDRESS(contactRes.lastInsertRowId!, addressRes.lastInsertRowId!));
                    });
                }
                if (contact.emails.length > 0) {
                    contact.emails.forEach(async (e) => {
                        const emailRes = await runAsync(SQL_INSERT_EMAIL(e.email, e.isPrimary ? 1 : 0, e.type));
                        execAsync(SQL_INSERT_CONTACT_EMAIL(contactRes.lastInsertRowId!, emailRes.lastInsertRowId!));
                    });
                }
                if (contact.phones.length > 0) {
                    contact.phones.forEach(async (p) => {
                        const phoneRes = await runAsync(SQL_INSERT_PHONE_NUMBER(p.number, p.extension, p.isPrimary ? 1 : 0, p.type));
                        execAsync(SQL_INSERT_CONTACT_PHONE_NUMBER(contactRes.lastInsertRowId!, phoneRes.lastInsertRowId!));
                    });
                }
                if (contact.licenses.length > 0) {
                    contact.licenses.forEach(async (l) => {
                        const licenseRes = await runAsync(SQL_INSERT_INSPECTOR_CONTACT_LICENSE(l.licenseNumber, l.state, l.startDate, l.type, contact.id!));
                        execAsync(SQL_INSERT_CONTACT_LICENSE(contactRes.lastInsertRowId!, licenseRes.lastInsertRowId!));
                    });
                }
            }
            catch (e) {
                console.error(e)
            }
        }, [contacts, ready, execAsync]
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
                            const addressRes = await runAsync(SQL_INSERT_ADDRESS(a.city, a.isPrimary ? 1 : 0, a.state, a.addr1, a.addr2 || "", a.type || "", a.zip));
                            execAsync(SQL_INSERT_CONTACT_ADDRESS(contact.id!, addressRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.emails.length > 0) {
                    contact.emails.forEach(async (e) => {
                        if (e.id !== undefined) {
                            execAsync(SQL_UPDATE_EMAIL(e, e.id));
                        } else {
                            const emailRes = await runAsync(SQL_INSERT_EMAIL(e.email, e.isPrimary ? 1 : 0, e.type));
                            execAsync(SQL_INSERT_CONTACT_EMAIL(contact.id!, emailRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.phones.length > 0) {
                    contact.phones.forEach(async (p) => {
                        if (p.id !== undefined) {
                            execAsync(SQL_UPDATE_PHONE_NUMBER(p, p.id));
                        } else {
                            const phoneRes = await runAsync(SQL_INSERT_PHONE_NUMBER(p.number, p.extension, p.isPrimary ? 1 : 0, p.type));
                            execAsync(SQL_INSERT_CONTACT_PHONE_NUMBER(contact.id!, phoneRes.lastInsertRowId!));
                        }
                    });
                }
                if (contact.licenses.length > 0) {
                    contact.licenses.forEach(async (l) => {
                        if (l.id !== undefined) {
                            execAsync(SQL_UPDATE_LICENSE(l, l.id));
                        } else {
                            const licenseRes = await runAsync(SQL_INSERT_INSPECTOR_CONTACT_LICENSE(l.licenseNumber, l.state, l.startDate, l.type, contact.id!));
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

    return (
        !uiReady ? (
            <View style={{ flex: 1, padding: 8 }}><ProgressBar indeterminate={true} /></View>
        ) : (
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background }}>
                {(
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.formComponent}>
                            <TextInput
                                label={"Name"}
                                value={name}
                                onChangeText={(text: string) => {
                                    setName(text);
                                    execAsync(SQL_UPDATE_INSPECTION_NAME(text, inspectionState.id!));
                                }}
                                style={{ marginLeft: 5, width: "100%" }}
                            />
                        </View>
                        <View style={styles.formComponent}>
                            <TextInput
                                label={"Number"}
                                value={number}
                                onChangeText={(text: string) => {
                                    setNumber(text);
                                    execAsync(SQL_UPDATE_INSPECTION_NUMBER(text, inspectionState.id!));
                                }}
                                style={{ marginLeft: 5, width: "100%" }}
                            />
                        </View>
                        <View style={styles.formComponent}>
                            {Platform.OS !== 'ios' && (
                                <Button mode='contained' onPress={() => setShowDatePicker(true)}>{format(date, "MMMM do, yyyy")}</Button>
                            )}
                            {(showDatePicker || Platform.OS === 'ios') && (
                                <RNDateTimePicker
                                    value={date}
                                    display='inline'
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        setShowDatePicker(false)
                                        if (event.type === 'set' && date) {
                                            setDate(date)
                                        }
                                    }} />
                            )}
                        </View>
                        <View style={styles.formComponent}>
                            {Platform.OS !== 'ios' && (
                                <Button mode='contained' onPress={() => setShowTimePicker(true)}>{format(date, "hh:mma")}</Button>
                            )}
                            {(showTimePicker || Platform.OS === 'ios') && (
                                <RNDateTimePicker
                                    value={time}
                                    mode={"time"}
                                    style={{ width: 100 }}
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        setShowTimePicker(false)
                                        if (event.type === 'set' && date) {
                                            setTime(date)
                                        }
                                    }} />
                            )}
                        </View>
                        <View style={styles.formComponent}>
                            <AddressPicker editMode value={address} onChange={onAddressChange} />
                        </View>
                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={[{
                                    label: "Quoted",
                                    value: "Quoted",
                                }, {
                                    label: "Confirmed",
                                    value: "Confirmed",
                                }, {
                                    label: "Completed Paid",
                                    value: "Completed Paid",
                                }, {
                                    label: "Completed Pending Payment",
                                    value: "Completed Pending Payment",
                                },]}
                                onValueChange={(status: string) => {
                                    setStatus(status);
                                    execAsync(SQL_UPDATE_STATUS(status, inspectionState.id!));
                                }}
                                label={"Status"}
                                value={status}
                                useValueAsDisplay
                            />
                        </View>

                        <View style={styles.formComponent}>
                            <View style={{ display: "flex", "flexDirection": "row" }}>
                                <View style={{ marginTop: 8, "flexDirection": "row", alignContent: "flex-start", alignItems: "flex-start", flex: 1 }}>
                                    <Subheading>Clients</Subheading>
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
                            <SafeAreaView style={{ flex: 1 }}>
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
                            </SafeAreaView>
                        </View>

                        <View style={styles.formComponent}>
                            <Subheading>Cover Image</Subheading>
                            {coverPhoto && (<PhotoPreview
                                disabled={true}
                                onPress={() => { }}
                                photo={coverPhoto}
                            />)}
                            <View style={styles.buttons}>
                                <Button mode="text" onPress={onCoverChange}>Change</Button>
                                <Button mode="text" onPress={onCoverClear}>Clear</Button>
                            </View>
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
                                        execAsync(SQL_INSERT_INSPECTION_CONTACT(theContact.id!, inspectionState.id!));
                                    }
                                }} />
                        }
                    </ScrollView>
                )}
            </View>
        )
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        marginHorizontal: 0,
        height: '100%',
    },
    formComponent: {
        padding: 10
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
    }
});

export default memo(GeneralTab, () => true);