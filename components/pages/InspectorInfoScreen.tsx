import React, { useCallback, useEffect, useState } from 'react'
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, ProgressBar, Subheading, TextInput } from 'react-native-paper';
import { AddSignatureModal } from '../modals/AddSignatureModal';
import * as FileSystem from "expo-file-system";
import { FileInfo } from 'expo-file-system';
import { saveToPhone } from '../../lib/camera';
import { updateSnackbar } from '../../redux/actions';
import { Asset } from 'expo-media-library';
import { useDispatch } from 'react-redux';
import * as SQLite from 'expo-sqlite/next';
import {
    SQL_DELETE_ADDRESS, SQL_DELETE_EMAIL, SQL_DELETE_IMAGE, SQL_DELETE_PHONE_NUMBER,
    SQL_DELETE_USER_ADDRESS, SQL_DELETE_USER_EMAIL, SQL_DELETE_USER_PHONE_NUMBERS,
    SQL_GET_INSPECTOR_INFO, SQL_GET_IMAGE, SQL_GET_USER_ADDRESSES, SQL_GET_USER_EMAILS,
    SQL_GET_USER_LICENSES, SQL_GET_USER_PHONENUMBERS, SQL_INSERT_ADDRESS, SQL_INSERT_EMAIL,
    SQL_INSERT_IMAGE, SQL_INSERT_LICENSE, SQL_INSERT_PHONE_NUMBER, SQL_INSERT_USER,
    SQL_INSERT_USER_ADDRESS, SQL_INSERT_USER_EMAIL, SQL_INSERT_USER_PHONE_NUMBER,
    SQL_UPDATE_ADDRESS, SQL_UPDATE_EMAIL, SQL_UPDATE_INSPECTOR_DISPLAY_NAME,
    SQL_UPDATE_INSPECTOR_FIRST_NAME, SQL_UPDATE_INSPECTOR_LAST_NAME, SQL_UPDATE_LICENSE,
    SQL_UPDATE_PHONE_NUMBER,
    SQL_UPDATE_SIGNATURE
} from '../../lib/sqlCommands';
import { IPhoto } from '../../redux/reducers/photos';
import { getAssetFromAlbum, replaceWithCorrectUri } from '../../lib/photos';
import { IAddress, IEmail, ILicense, IPhonenumber } from '../../lib/types';
import { ClickableList, IClickableListItem } from '../shared/ClickableList';
import { EmailModal } from '../modals/AddEmailModal';
import { PhonenumberModal } from '../modals/AddPhonenumberModal';
import { AddressModal } from '../modals/AddressModal';
import { LicenseModal } from '../modals/LicenseModal';
import { useDbContext } from '../../contexts/DbContext';

export const InspectorInfoScreen = (navigation: any) => {
    const { execAsync, getFirstAsync, getAllAsync, runAsync, ready } = useDbContext();
    const [firstName, setFirstName] = useState<string>()
    const [lastName, setLastName] = useState<string>()
    const [signaturePhoto, setSignaturePhoto] = useState<IPhoto>()
    const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [addresses, setAddresses] = useState<IAddress[]>()
    const [emails, setEmails] = useState<IEmail[]>()
    const [phones, setPhones] = useState<IPhonenumber[]>()
    const [licenses, setLicenses] = useState<ILicense[]>()
    const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
    const [editableAddress, setEditableAddress] = useState<IAddress | undefined>(undefined)
    const [showEmailModal, setShowEmailModal] = useState<boolean>(false)
    const [editableEmail, setEditableEmail] = useState<IEmail | undefined>(undefined)
    const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
    const [editablePhone, setEditablePhone] = useState<IPhonenumber | undefined>(undefined)
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false)
    const [editableLicense, setEditableLicense] = useState<ILicense | undefined>(undefined)
    const dispatch = useDispatch();

    useEffect(() => {
        const getData = async () => {
            try {
                const userInfo = await getFirstAsync(SQL_GET_INSPECTOR_INFO());

                if (userInfo === undefined || userInfo === null) {
                    await execAsync(SQL_INSERT_USER());
                } else {
                    setFirstName(userInfo.firstName);
                    setLastName(userInfo.lastName);
                    if (userInfo && userInfo.signatureId) {
                        const sigRow = await getFirstAsync(SQL_GET_IMAGE(userInfo.signatureId));
                        // const theAsset = await getAssetFromAlbum(sigRow.fileName);
                        setSignaturePhoto({
                            id: sigRow.id,
                            uri: sigRow.fileName
                        });
                    }
                    const addressResults = await getAllAsync(SQL_GET_USER_ADDRESSES());
                    const emailsResults = await getAllAsync(SQL_GET_USER_EMAILS());
                    const phonesResults = await getAllAsync(SQL_GET_USER_PHONENUMBERS());
                    const licensesResults = await getAllAsync(SQL_GET_USER_LICENSES());

                    const addressList: IAddress[] = []
                    for (let i = 0; i < addressResults.length; ++i) {
                        const item = addressResults[i];
                        addressList.push({
                            id: item.id,
                            addr1: item.street,
                            addr2: item.street2,
                            city: item.city,
                            state: item.state,
                            zip: item.zipCode,
                            type: item.type,
                            isPrimary: item.isPrimary === 1
                        });
                    }
                    setAddresses(addressList);

                    const emailsList: IEmail[] = []
                    for (let i = 0; i < emailsResults.length; ++i) {
                        const item = emailsResults[i];
                        emailsList.push({
                            id: item.id,
                            email: item.emailAddress,
                            type: item.emailType,
                            isPrimary: item.isPrimary === 1
                        });
                    }
                    setEmails(emailsList);

                    const phonesList: IPhonenumber[] = []
                    for (let i = 0; i < phonesResults.length; ++i) {
                        const item = phonesResults[i];
                        phonesList.push({
                            id: item.id,
                            number: item.phoneNumber,
                            extension: item.extension,
                            type: item.phoneType,
                            isPrimary: item.isPrimary === 1
                        });
                    }
                    setPhones(phonesList);

                    const licenseList: ILicense[] = []
                    for (let i = 0; i < licensesResults.length; ++i) {
                        const item = licensesResults[i];
                        licenseList.push({
                            id: item.id,
                            licenseNumber: item.licenseNumber,
                            state: item.state,
                            startDate: item.startDate,
                            type: item.type,
                        });
                    }
                    setLicenses(licenseList);
                }

                setIsLoaded(true)
            } catch (err) {
                console.error('Failed to get company info', err)
            }
        }

        if (ready) {
            getData();
        }
    }, [ready])

    const onFirstNameChange = useCallback((text: string) => {
        setFirstName(text);
        execAsync(SQL_UPDATE_INSPECTOR_FIRST_NAME(text));
        execAsync(SQL_UPDATE_INSPECTOR_DISPLAY_NAME(text, lastName || ""));
    }, [firstName, lastName, ready])

    const onLastNameChange = useCallback((text: string) => {
        setLastName(text);
        execAsync(SQL_UPDATE_INSPECTOR_LAST_NAME(text));
        execAsync(SQL_UPDATE_INSPECTOR_DISPLAY_NAME(firstName || "", text));
    }, [firstName, lastName, ready])

    const onSignatureClear = useCallback(() => {
        if (signaturePhoto && signaturePhoto.id) {
            execAsync(SQL_DELETE_IMAGE(signaturePhoto.id));
            setSignaturePhoto(undefined);
        }
    }, [signaturePhoto, ready])

    const onSignatureChange = useCallback(() => {
        setShowSignatureModal(true)
    }, [ready])

    const onNewAddress = useCallback(
        async (address: IAddress) => {
            try {
                const addressRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_ADDRESS(address.city, address.isPrimary ? 1 : 0, address.state, address.addr1, address.addr2 || "", address.type || "", address.zip));
                address.id = addressRes.lastInsertRowId;
                setAddresses(addresses ? [...addresses, address] : [address]);
                execAsync(SQL_INSERT_USER_ADDRESS(addressRes.lastInsertRowId!));
            }
            catch (e) {
                console.error(e)
            }
        }, [addresses, ready]
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
            execAsync(SQL_UPDATE_ADDRESS(address, address.id!));
        }, [addresses, ready]
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
            execAsync(SQL_DELETE_ADDRESS(item.id!));
            execAsync(SQL_DELETE_USER_ADDRESS(item.id!));
        }, [addresses, ready]
    );

    const onNewEmail = useCallback(
        async (email: IEmail) => {
            try {
                const emailRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_EMAIL(email.email, email.isPrimary ? 1 : 0, email.type));
                email.id = emailRes.lastInsertRowId;
                setEmails(emails ? [...emails, email] : [email]);
                execAsync(SQL_INSERT_USER_EMAIL(emailRes.lastInsertRowId!));
            }
            catch (e) {
                console.error(e)
            }
        }, [emails, ready]
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
            execAsync(SQL_UPDATE_EMAIL(email, email.id!));
        }, [emails, ready]
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
            execAsync(SQL_DELETE_EMAIL(item.id!));
            execAsync(SQL_DELETE_USER_EMAIL(item.id!));
        }, [emails, ready]
    );

    const onNewPhone = useCallback(
        async (phone: IPhonenumber) => {
            try {
                const phoneRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_PHONE_NUMBER(phone.number, phone.extension, phone.isPrimary ? 1 : 0, phone.type));
                phone.id = phoneRes.lastInsertRowId;
                setPhones(phones ? [...phones, phone] : [phone]);
                execAsync(SQL_INSERT_USER_PHONE_NUMBER(phoneRes.lastInsertRowId!));
            }
            catch (e) {
                console.error(e)
            }
        }, [phones, ready]
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
            execAsync(SQL_UPDATE_PHONE_NUMBER(phone, phone.id!));
        }, [phones, ready]
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
            execAsync(SQL_DELETE_PHONE_NUMBER(item.id!));
            execAsync(SQL_DELETE_USER_PHONE_NUMBERS(item.id!));
        }, [phones, ready]
    );

    const onNewLicense = useCallback(
        async (license: ILicense) => {
            try {
                const licenseRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_LICENSE(license.licenseNumber, license.state, license.startDate, license.type));
                license.id = licenseRes.lastInsertRowId;
                setLicenses(licenses ? [...licenses, license] : [license]);
            }
            catch (e) {
                console.error(e)
            }
        }, [phones, ready, licenses]
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
            execAsync(SQL_UPDATE_LICENSE(license, license.id!));
        }, [phones, ready, licenses]
    );

    const onLicenseDelete = useCallback(
        (item: IClickableListItem) => {
            const newList: ILicense[] = [];
            licenses?.forEach((a) => {
                if (a.id !== item.id) {
                    newList.push(a);
                }
            });
            setLicenses(newList);
            execAsync(SQL_DELETE_PHONE_NUMBER(item.id!));
        }, [emails, ready]
    );

    const successSnackbar = useCallback(() =>
        updateSnackbar({
            show: true,
            type: "success",
            onDismissSnackBar: () => { },
            message: "Added signature"
        })(dispatch), [dispatch]);

    const failSnackbar = useCallback((message?: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message ? message : "Could not add signature"
        })(dispatch), [dispatch])

    const onSignatureSubmit = useCallback((signature?: string) => {
        setShowSignatureModal(false)

        if (signature && signature.length > 0) {
            const path = FileSystem.cacheDirectory + "inspector_sig.png";
            FileSystem.writeAsStringAsync(
                path,
                signature.replace("data:image/png;base64,", ""),
                { encoding: FileSystem.EncodingType.Base64 }
            )
                .then(() => FileSystem.getInfoAsync(path))
                .then(async (fileInfo: FileInfo) => {
                    saveToPhone(fileInfo.uri, (err: string) => {
                        failSnackbar(err);
                    }, async (asset: Asset) => {
                        const fileUri = Platform.OS === 'ios' ? asset.uri : asset.filename;
                        const imageResult: SQLite.SQLiteRunResult = await runAsync(
                            SQL_INSERT_IMAGE(fileUri, undefined, undefined, 1));
                        execAsync(SQL_UPDATE_SIGNATURE(imageResult.lastInsertRowId!));
                        setSignaturePhoto({
                            id: imageResult.lastInsertRowId!,
                            uri: fileUri,
                        });
                        successSnackbar();
                    });
                })
                .catch(console.error);
        }
    }, [ready, signaturePhoto]);

    return (
        isLoaded ? (
            <ScrollView>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="name-given"
                            label={"First Name"}
                            value={firstName}
                            onChangeText={onFirstNameChange}
                        />
                    </View>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='name-family'
                            label={"Last Name"}
                            value={lastName}
                            onChangeText={onLastNameChange}
                        />
                    </View>
                    <View style={styles.formComponent}>
                        <Subheading>Signature</Subheading>
                        <View style={{ display: 'flex', alignItems: "center" }} >
                            {signaturePhoto && (
                                <Image
                                    source={{ uri: replaceWithCorrectUri(signaturePhoto.uri) }}
                                    style={{ height: 150, width: 150 }}
                                />
                            )}
                        </View>
                        <View style={styles.buttons}>
                            <Button mode="text" onPress={onSignatureClear}>Clear</Button>
                            <Button mode="text" onPress={onSignatureChange}>Change</Button>
                        </View>
                    </View>
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
                    {showSignatureModal &&
                        <AddSignatureModal
                            onCancel={() => setShowSignatureModal(false)}
                            onSubmit={onSignatureSubmit}
                        />
                    }
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
                </View>
            </ScrollView>
        ) : (
            <View>
                <ProgressBar indeterminate={true} />
            </View >
        )
    )
}

const styles = StyleSheet.create({
    button: {
        margin: 10,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    signatureContainer: {
        backgroundColor: 'white'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    formComponent: {
        padding: 10
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
    }
});
