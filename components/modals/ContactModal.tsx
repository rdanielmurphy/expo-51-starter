import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Headline, IconButton, Modal, Portal, Subheading, TextInput } from 'react-native-paper';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { IAddress, IContact, IEmail, ILicense, IPhonenumber } from '../../lib/types';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import { ClickableList, IClickableListItem } from '../shared/ClickableList';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import { EmailModal } from './AddEmailModal';
import { PhonenumberModal } from './AddPhonenumberModal';
import { AddressModal } from './AddressModal';
import { LicenseModal } from './LicenseModal';
import { ModalButtons } from '../shared/ModalButtons';
import { Dialog } from 'react-native-simple-dialogs';

interface IProps {
    editMode?: boolean
    value?: IContact
    showRole?: boolean
    onClose: () => void
    onSubmit: (value: IContact) => void
}

export const ContactModal = (props: IProps) => {
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const [firstName, setFirstName] = useState(props.value ? props.value.firstName : '');
    const [lastName, setLastName] = useState(props.value ? props.value.lastName : '');
    const [tag, setTag] = useState(props.value ? props.value.tag : '');
    const [role, setRole] = useState(props.value ? props.value.tag : '');
    const [addresses, setAddresses] = useState(props.value ? props.value.addresses : []);
    const [emails, setEmails] = useState(props.value ? props.value.emails : []);
    const [phones, setPhones] = useState(props.value ? props.value.phones : []);
    const [licenses, setLicenses] = useState(props.value ? props.value.licenses : []);
    const [tags, setTags] = useState<IPickerItem[]>([]);
    const [roles, setRoles] = useState<IPickerItem[]>([]);
    const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
    const [editableAddress, setEditableAddress] = useState<IAddress | undefined>(undefined)
    const [showEmailModal, setShowEmailModal] = useState<boolean>(false)
    const [editableEmail, setEditableEmail] = useState<IEmail | undefined>(undefined)
    const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
    const [editablePhone, setEditablePhone] = useState<IPhonenumber | undefined>(undefined)
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false)
    const [editableLicense, setEditableLicense] = useState<ILicense | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(true);

    const onClose = () => props.onClose();
    const onSubmit = () => {
        const value = {
            firstName,
            lastName,
            tag,
            role,
            id: props.editMode && props.value ? props.value.id : undefined,
            addresses,
            emails,
            phones,
            licenses: tag === "Inspector" ? licenses : []
        } as IContact
        props.onSubmit(value);
    }

    useEffect(() => {
        if (loadedUserDefinedFields && userDefinedFields) {
            const tags = getUserDefinedFieldValues(userDefinedFields.items, "ContactTag").map((i) => ({
                label: i.label,
                value: i.label,
            }))
            setTags(tags);
            if (props.value?.tag) {
                setTag(props.value.tag);
            } else {
                setTag(tags[0].label);
            }

            if (props.showRole) {
                const rolesList = ["Buyer Agent", "Seller Agent", "Buyer/Client", "Seller", "Sponsoring Inspector", "Mortgage Broker", "Real Estate Attorney", "Friend", "Insurange Agent", "Bank"]
                setRoles(rolesList.map((r) => (
                    {
                        label: r,
                        value: r,
                    }
                )))
                if (!props.value?.role) {
                    setRole(roles[0].label);
                }
            }
            setLoading(false);
        }
    }, [loadedUserDefinedFields]);

    const onNewAddress = useCallback(
        async (address: IAddress) => {
            try {
                setAddresses(addresses ? [...addresses, address] : [address]);
            }
            catch (e) {
                console.error(e)
            }
        }, [addresses]
    );

    const onAddressUpdate = useCallback(
        (address: IAddress) => {
            const newList: IAddress[] = [];
            addresses?.forEach((a) => {
                if (a.id === address.id) {
                    newList.push(address);
                } else {
                    newList.push(a);
                }
            });
            setAddresses(newList);
        }, [addresses]
    );

    const onAddressDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: IAddress[] = [];
            addresses?.forEach((a) => {
                if (a.id !== item.id) {
                    newList.push(a);
                }
            });
            setAddresses(newList);
        }, [addresses]
    );

    const onNewEmail = useCallback(
        async (email: IEmail) => {
            try {
                setEmails(emails ? [...emails, email] : [email]);
            }
            catch (e) {
                console.error(e)
            }
        }, [emails]
    );

    const onEmailUpdate = useCallback(
        (email: IEmail) => {
            const newList: IEmail[] = [];
            emails?.forEach((a) => {
                if (a.id === email.id) {
                    newList.push(email);
                } else {
                    newList.push(a);
                }
            });
            setEmails(newList);
        }, [emails]
    );

    const onEmailDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: IEmail[] = [];
            emails?.forEach((a) => {
                if (a.id !== item.id) {
                    newList.push(a);
                }
            });
            setEmails(newList);
        }, [emails]
    );

    const onNewPhone = useCallback(
        async (phone: IPhonenumber) => {
            try {
                setPhones(phones ? [...phones, phone] : [phone]);
            }
            catch (e) {
                console.error(e)
            }
        }, [phones]
    );

    const onPhoneUpdate = useCallback(
        async (phone: IPhonenumber) => {
            const newList: IPhonenumber[] = [];
            phones?.forEach((p) => {
                if (p.id === phone.id) {
                    newList.push(phone);
                } else {
                    newList.push(p);
                }
            });
            setPhones(newList);
        }, [phones]
    );

    const onPhoneDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: IPhonenumber[] = [];
            phones?.forEach((a) => {
                if (a.id !== item.id) {
                    newList.push(a);
                }
            });
            setPhones(newList);
        }, [phones]
    );

    const onNewLicense = useCallback(
        async (license: ILicense) => {
            try {
                setLicenses(licenses ? [...licenses, license] : [license]);
            }
            catch (e) {
                console.error(e)
            }
        }, [licenses]
    );

    const onLicenseUpdate = useCallback(
        async (license: ILicense) => {
            const newList: ILicense[] = [];
            licenses?.forEach((l) => {
                if (l.id === license.id) {
                    newList.push(license);
                } else {
                    newList.push(l);
                }
            });
            setLicenses(newList);
        }, [licenses]
    );

    const onLicenseDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: ILicense[] = [];
            licenses?.forEach((l) => {
                if (l.id !== item.id) {
                    newList.push(l);
                }
            });
            setLicenses(newList);
        }, [licenses]
    );

    const ready = useMemo(() => (
        firstName.length > 0 && lastName.length > 0
    ), [firstName, lastName])

    return (
        <Dialog
            visible={true}
            title={`${props.editMode ? "Edit" : "Add"} Contact`}
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready}
                    confirmText={"Select"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading &&
                <ScrollView style={styles.scrollView}>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="name-given"
                            label={"First Name"}
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='name-family'
                            label={"Last Name"}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={tags || []}
                            onValueChange={setTag}
                            label={"Type"}
                            value={tag}
                        />
                    </View>

                    {props.showRole && (
                        <View style={styles.formComponent}>
                            <StandardPicker
                                items={roles || []}
                                onValueChange={setRole}
                                label={"Role"}
                                value={role}
                            />
                        </View>
                    )}

                    <View>
                        <View style={styles.view}>
                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <Subheading>Addresses</Subheading>
                            </View>
                            <View style={{ flex: 2, flexBasis: 50, alignItems: "flex-end" }}>
                                <IconButton
                                    style={{ width: 50 }}
                                    icon="plus-circle"
                                    onPress={() => {
                                        setEditableAddress(undefined);
                                        setShowAddressModal(true);
                                    }}
                                />
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1 }}>
                            <ClickableList
                                items={addresses?.map((a: IAddress) => ({
                                    id: a.id,
                                    text: `(${a.type}) ${a.addr1}${a.addr2 ? ' ' + a.addr2 + ',' : ','} ${a.city}, ${a.state} ${a.zip}`,
                                    primary: a.isPrimary
                                } as IClickableListItem)) || []}
                                onRowPress={(item: IClickableListItem) => {
                                    const i = addresses ? addresses.findIndex((v) => v.id === item.id) : -1;
                                    if (i >= 0 && addresses) {
                                        setEditableAddress(addresses[i]);
                                        setShowAddressModal(true);
                                    }
                                }}
                                onRowDelete={onAddressDelete} />
                        </SafeAreaView>
                    </View>

                    <View>
                        <View style={styles.view}>
                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <Subheading>Emails</Subheading>
                            </View>
                            <View style={{ flex: 2, flexBasis: 50, alignItems: "flex-end" }}>
                                <IconButton
                                    style={{ width: 50 }}
                                    icon="plus-circle"
                                    onPress={() => {
                                        setEditableAddress(undefined);
                                        setShowEmailModal(true);
                                    }}
                                />
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1 }}>
                            <ClickableList
                                items={emails?.map((e: IEmail) => ({
                                    id: e.id,
                                    text: `(${e.type}) ${e.email}`,
                                    primary: e.isPrimary
                                } as IClickableListItem)) || []}
                                onRowPress={(item: IClickableListItem) => {
                                    const i = emails ? emails.findIndex((v) => v.id === item.id) : -1;
                                    if (i >= 0 && emails) {
                                        setEditableEmail(emails[i]);
                                        setShowEmailModal(true);
                                    }
                                }}
                                onRowDelete={onEmailDelete} />
                        </SafeAreaView>
                    </View>

                    <View>
                        <View style={styles.view}>
                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <Subheading>Phones</Subheading>
                            </View>
                            <View style={{ flex: 2, flexBasis: 50, alignItems: "flex-end" }}>
                                <IconButton
                                    style={{ width: 50 }}
                                    icon="plus-circle"
                                    onPress={() => {
                                        setEditableAddress(undefined);
                                        setShowPhoneNumberModal(true);
                                    }}
                                />
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1 }}>
                            <ClickableList
                                items={phones?.map((p: IPhonenumber) => ({
                                    id: p.id,
                                    text: `(${p.type}) ${p.number}${p.extension ? ' (ext: ' + p.extension + ')' : ''}`,
                                    primary: p.isPrimary
                                } as IClickableListItem)) || []}
                                onRowPress={(item: IClickableListItem) => {
                                    const i = phones ? phones.findIndex((v) => v.id === item.id) : -1;
                                    if (i >= 0 && phones) {
                                        setEditablePhone(phones[i]);
                                        setShowPhoneNumberModal(true);
                                    }
                                }}
                                onRowDelete={onPhoneDelete} />
                        </SafeAreaView>
                    </View>

                    {tag === "Inspector" && (
                        <View>
                            <View style={styles.view}>
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    <Subheading>Licenses</Subheading>
                                </View>
                                <View style={{ flex: 2, flexBasis: 50, alignItems: "flex-end" }}>
                                    <IconButton
                                        style={{ width: 50 }}
                                        icon="plus-circle"
                                        onPress={() => {
                                            setEditableLicense(undefined);
                                            setShowLicenseModal(true);
                                        }}
                                    />
                                </View>
                            </View>
                            <SafeAreaView style={{ flex: 1 }}>
                                <ClickableList
                                    items={licenses?.map((l: ILicense) => ({
                                        id: l.id,
                                        text: `${l.state} - ${l.licenseNumber} - ${l.type}`,
                                        primary: false
                                    } as IClickableListItem)) || []}
                                    onRowPress={(item: IClickableListItem) => {
                                        const i = licenses ? licenses.findIndex((v) => v.id === item.id) : -1;
                                        if (i >= 0 && licenses) {
                                            setEditableLicense(licenses[i]);
                                            setShowLicenseModal(true);
                                        }
                                    }}
                                    onRowDelete={onLicenseDelete} />
                            </SafeAreaView>
                        </View>
                    )}

                    {showAddressModal &&
                        <AddressModal
                            showPrimary={true}
                            showType={true}
                            editMode={editableAddress !== undefined}
                            onClose={() => setShowAddressModal(false)}
                            onSubmit={(value: IAddress) => {
                                if (editableAddress === undefined) {
                                    onNewAddress(value);
                                } else {
                                    onAddressUpdate(value);
                                }
                                setShowAddressModal(false);
                            }}
                            value={editableAddress}
                        />
                    }
                    {showEmailModal &&
                        <EmailModal
                            showPrimary={true}
                            showType={true}
                            editMode={editableEmail !== undefined}
                            onClose={() => setShowEmailModal(false)}
                            onSubmit={(value: IEmail) => {
                                if (editableEmail === undefined) {
                                    onNewEmail(value);
                                } else {
                                    onEmailUpdate(value);
                                }
                                setShowEmailModal(false);
                            }}
                            value={editableEmail}
                        />
                    }
                    {showPhoneNumberModal &&
                        <PhonenumberModal
                            showPrimary={true}
                            showType={true}
                            editMode={editablePhone !== undefined}
                            onClose={() => setShowPhoneNumberModal(false)}
                            onSubmit={(value: IPhonenumber) => {
                                if (editablePhone === undefined) {
                                    onNewPhone(value);
                                } else {
                                    onPhoneUpdate(value);
                                }
                                setShowPhoneNumberModal(false);
                            }}
                            value={editablePhone}
                        />
                    }
                    {showLicenseModal &&
                        <LicenseModal
                            editMode={editableLicense !== undefined}
                            onClose={() => setShowLicenseModal(false)}
                            onSubmit={(value: ILicense) => {
                                if (editableLicense === undefined) {
                                    onNewLicense(value);
                                } else {
                                    onLicenseUpdate(value);
                                }
                                setShowLicenseModal(false);
                            }}
                            value={editableLicense}
                        />
                    }
                </ScrollView>
            }
        </Dialog>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 75,
    },
    containerStyle: {
        backgroundColor: 'white',
        margin: 20,
    },
    formComponent: {
        padding: 10
    },
    scrollView: {
        marginHorizontal: 0,
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        alignContent: "center",
    }
});

