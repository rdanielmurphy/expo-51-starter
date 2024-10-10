import { SQLResultSet } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, ProgressBar, Subheading, TextInput } from 'react-native-paper';
import { SQL_DELETE_ADDRESS, SQL_DELETE_CLOUD_ACCOUNT_ADDRESS, SQL_DELETE_CLOUD_ACCOUNT_EMAIL, SQL_DELETE_CLOUD_ACCOUNT_PHONE_NUMBERS, SQL_DELETE_EMAIL, SQL_DELETE_IMAGE, SQL_DELETE_PHONE_NUMBER, SQL_GET_CLOUD_ACCOUNT, SQL_GET_CLOUD_ACCOUNT_ADDRESSES, SQL_GET_CLOUD_ACCOUNT_EMAILS, SQL_GET_CLOUD_ACCOUNT_PHONENUMBERS, SQL_INSERT_ADDRESS, SQL_INSERT_CLOUD_ACCOUNT, SQL_INSERT_CLOUD_ACCOUT_ADDRESS, SQL_INSERT_CLOUD_ACCOUT_EMAIL, SQL_INSERT_CLOUD_ACCOUT_PHONE_NUMBER, SQL_INSERT_EMAIL, SQL_INSERT_IMAGE, SQL_INSERT_PHONE_NUMBER, SQL_UPDATE_ADDRESS, SQL_UPDATE_CLOUD_ACCOUNT_NAME, SQL_UPDATE_CLOUD_ACCOUNT_STATES_NOT_INCLUDED, SQL_UPDATE_EMAIL, SQL_UPDATE_PHONE_NUMBER } from '../../lib/sqlCommands';
import { IAddress, IEmail, IPhonenumber } from '../../lib/types';
import { IPhoto } from '../../redux/reducers/photos';
import { EmailModal } from '../modals/AddEmailModal';
import { PhonenumberModal } from '../modals/AddPhonenumberModal';
import { AddressModal } from '../modals/AddressModal';
import { ClickableList, IClickableListItem } from '../shared/ClickableList';
import PhotoPreview from '../shared/PhotoPreview';
import { updateAddPhotoModal, updateSnackbar } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { launchCamera, launchPicker, saveToPhone } from '../../lib/camera';
import { Asset } from 'expo-media-library';
import * as SQLite from 'expo-sqlite/next';
import { initialState } from '../../redux/reducers/addPhotoModal';
import { AddPhotoModal } from '../modals/AddPhotoModal';
import { useDbContext } from '../../contexts/DbContext';

export const CompanyInfoScreen = (navigation: any) => {
    const { ready, execAsync, getFirstAsync, getAllAsync, runAsync } = useDbContext();
    const dispatch = useDispatch();

    const [companyName, setCompanyName] = useState<string>()
    const [statesNotIncluded, setStatesNotIncluded] = useState<string>()
    const [addresses, setAddresses] = useState<IAddress[]>()
    const [emails, setEmails] = useState<IEmail[]>()
    const [phones, setPhones] = useState<IPhonenumber[]>()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [logoPhoto, setLogoPhoto] = useState<IPhoto>();

    const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
    const [editableAddress, setEditableAddress] = useState<IAddress | undefined>(undefined)
    const [showEmailModal, setShowEmailModal] = useState<boolean>(false)
    const [editableEmail, setEditableEmail] = useState<IEmail | undefined>(undefined)
    const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
    const [editablePhone, setEditablePhone] = useState<IPhonenumber | undefined>(undefined)

    useEffect(() => {
        const getData = async () => {
            try {
                const cloudAccount = await getFirstAsync(SQL_GET_CLOUD_ACCOUNT());
                if (cloudAccount === undefined || cloudAccount === null) {
                    await execAsync(SQL_INSERT_CLOUD_ACCOUNT());
                } else {
                    setCompanyName(cloudAccount.name);
                    setStatesNotIncluded(cloudAccount.statesNotIncluded);
                    if (cloudAccount.logoName) {
                        setLogoPhoto({
                            id: cloudAccount.logoId,
                            uri: cloudAccount.logoName
                        });
                    }
                    const addressResults = await getAllAsync(SQL_GET_CLOUD_ACCOUNT_ADDRESSES());
                    const emailsResults = await getAllAsync(SQL_GET_CLOUD_ACCOUNT_EMAILS());
                    const phonesResults = await getAllAsync(SQL_GET_CLOUD_ACCOUNT_PHONENUMBERS());

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

    const onCompanyNameChange = (text: string) => {
        setCompanyName(text);
        execAsync(SQL_UPDATE_CLOUD_ACCOUNT_NAME(text));
    };

    const onNotValidNameChange = (text: string) => {
        setStatesNotIncluded(text);
        execAsync(SQL_UPDATE_CLOUD_ACCOUNT_STATES_NOT_INCLUDED(text));
    };

    const onNewAddress = useCallback(
        async (address: IAddress) => {
            try {
                const addressRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_ADDRESS(address.city, address.isPrimary ? 1 : 0, address.state, address.addr1, address.addr2 || "", address.type || "", address.zip));
                address.id = addressRes.lastInsertRowId;
                setAddresses(addresses ? [...addresses, address] : [address]);
                execAsync(SQL_INSERT_CLOUD_ACCOUT_ADDRESS(addressRes.lastInsertRowId!));
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
            execAsync(SQL_DELETE_CLOUD_ACCOUNT_ADDRESS(item.id!));
        }, [addresses, ready]
    );

    const onNewEmail = useCallback(
        async (email: IEmail) => {
            try {
                const emailRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_EMAIL(email.email, email.isPrimary ? 1 : 0, email.type));
                email.id = emailRes.lastInsertRowId;
                setEmails(emails ? [...emails, email] : [email]);
                execAsync(SQL_INSERT_CLOUD_ACCOUT_EMAIL(emailRes.lastInsertRowId!));
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
            execAsync(SQL_DELETE_CLOUD_ACCOUNT_EMAIL(item.id!));
        }, [emails, ready]
    );

    const onNewPhone = useCallback(
        async (phone: IPhonenumber) => {
            try {
                const phoneRes: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_PHONE_NUMBER(phone.number, phone.extension, phone.isPrimary ? 1 : 0, phone.type));
                phone.id = phoneRes.lastInsertRowId;
                setPhones(phones ? [...phones, phone] : [phone]);
                execAsync(SQL_INSERT_CLOUD_ACCOUT_PHONE_NUMBER(phoneRes.lastInsertRowId!));
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
            execAsync(SQL_DELETE_CLOUD_ACCOUNT_PHONE_NUMBERS(item.id!));
        }, [phones, ready]
    );

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

    const onCoverChange = () => {
        updateAddPhotoModal({
            show: true,
            name: "Logo",
            onCameraClick: () => launchCamera(failSnackbar, saveCoverToPhone),
            onExisitingClick: () => launchPicker(saveCoverToPhone)
        })(dispatch);
    }

    const saveCoverToPhone = async (uri: string) => {
        await saveToPhone(uri, (err: string) => {
            failSnackbar(err);
        }, async (asset: Asset) => {
            const imageResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_IMAGE(asset.uri, undefined, 1));
            if (logoPhoto && logoPhoto.id) {
                execAsync(SQL_DELETE_IMAGE(logoPhoto.id));
            }
            setLogoPhoto({
                id: imageResult.lastInsertRowId!,
                uri: asset.uri
            });
            successSnackbar();
            updateAddPhotoModal(initialState)(dispatch);
        });
    };

    const onCoverClear = () => { }

    return (
        isLoaded ? (
            <ScrollView>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="name"
                            label={"Company Name"}
                            value={companyName}
                            onChangeText={onCompanyNameChange}
                        />
                    </View>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete='off'
                            label={"States/Provinces where agreement is not valid"}
                            value={statesNotIncluded}
                            onChangeText={onNotValidNameChange}
                        />
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
                    <View style={styles.formComponent}>
                        <Subheading>Cover Image</Subheading>
                        {logoPhoto && (<PhotoPreview
                            disabled={true}
                            onPress={() => { }}
                            photo={logoPhoto}
                        />)}
                        <View style={styles.buttons}>
                            <Button mode="text" onPress={onCoverChange}>Change</Button>
                            <Button mode="text" onPress={onCoverClear}>Clear</Button>
                        </View>
                    </View>
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
                    <AddPhotoModal />
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
