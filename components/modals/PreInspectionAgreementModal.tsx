import React, { useCallback, useEffect, useRef } from 'react'
import { Image, Platform, StyleSheet, View } from 'react-native';
import { Checkbox, Divider, ProgressBar, Subheading, Text, TextInput } from 'react-native-paper';
import { IPreInspectionAgreementProps, usePdfGenerator } from '../../hooks/usePdfGenerator';
import { saveAndSharePdf } from '../../lib/pdfCreator';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { SQL_GET_CONTACT_ADDRESSES, SQL_GET_INSPECTION_CONTACTS, SQL_UPDATE_INSPECTION_CONTACT_SIG } from '../../lib/sqlCommands';
import { populateContact } from '../../lib/sqlCommon';
import { IContact } from '../../lib/types';
import { replaceWithCorrectUri } from '../../lib/photos';
import { useDbContext } from '../../contexts/DbContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import SignatureScreen from "react-native-signature-canvas";
import * as FileSystem from "expo-file-system";
import { FileInfo } from 'expo-file-system';
import { updateSnackbar } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { Asset } from 'expo-media-library';
import { saveToPhone } from '../../lib/camera';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useMembership } from '../../hooks/useMembership';

const SIG_HEIGHT = 75;

const style = `.m-signature-pad {
    margin-left: 0%;
    margin-top: 0%;
  }
.m-signature-pad--body {border: none}
 .m-signature-pad--footer
          .button {
            bottom: 0px;
            background-color: white;
            line-height: 30px;
            text-align: center;
            color: #FFF;
            border: none;
            outline: none;
      }
`;

export const PreInspectionAgreementModal = ({ inspectionId, onClose }: { inspectionId: number, onClose: () => void }) => {
    const { execAsync, getAllAsync, getFirstAsync } = useDbContext();
    const { handleError } = useErrorHandler();
    const { currentPlan } = useMembership();

    const [includeExclusions, setIncludeExclusions] = React.useState<boolean>(false);
    const [exclusions, setExclusions] = React.useState<string>("");
    const [bap, setBap] = React.useState<boolean>(false);
    const [sap, setSap] = React.useState<boolean>(false);
    const [building, setBuilding] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [contacts, setContacts] = React.useState<IContact[]>([]);
    const [signatureMode, setSignatureMode] = React.useState<boolean>(false);
    const [signature, setSignature] = React.useState<string>();
    const [contactIdSig, setContactIdSig] = React.useState<number>(-1);
    const { generatePreInspectionAgreementReport } = usePdfGenerator();
    const ref = useRef();
    const dispatch = useDispatch();

    const onDone = useCallback(async () => {
        setBuilding(true)

        try {
            const clientSignatures = [];
            for (let i = 0; i < contacts.length; i++) {
                const contact = contacts[i];
                if (contact.contactSignaturePath) {
                    clientSignatures.push(await FileSystem.readAsStringAsync(replaceWithCorrectUri(contact.contactSignaturePath), { encoding: "base64" }));
                }
            }

            const clientAddress = contacts.length > 0 ? await getFirstAsync(SQL_GET_CONTACT_ADDRESSES(contacts[0].id!)) : {};
            const res = await getFirstAsync("SELECT * FROM agreement");
            const data = {
                preInspectorAgreement: res.piaText ?? "",
                exclusions: exclusions,
                BPY: bap === true,
                BPN: bap === false,
                APY: sap === true,
                APN: sap === false,
                clientSignatures: clientSignatures,
                clientAddress: clientAddress ? {
                    street1: clientAddress.street1,
                    street2: clientAddress.street2,
                    city: clientAddress.city,
                    state: clientAddress.state,
                    zipCode: clientAddress.zipCode as number,
                } : {},
            } as IPreInspectionAgreementProps;
            const pdfDoc = await generatePreInspectionAgreementReport(inspectionId, data, currentPlan !== null);
            const pdfBytes = await pdfDoc.save();
            saveAndSharePdf(`pre-inspection-agreement-${inspectionId}.pdf`, pdfBytes);
            onClose();
        } catch (e: Error | any) {
            handleError("PreInspectionAgreementModal", "onDone", e?.message, e?.stack);
        } finally {
            setBuilding(false)
        }
    }, [generatePreInspectionAgreementReport, bap, sap, contacts, currentPlan]);

    useEffect(() => {
        const getClients = async () => {
            setLoading(true);

            try {
                const contactsRes = await getAllAsync(SQL_GET_INSPECTION_CONTACTS(inspectionId));
                const theContacts: IContact[] = [];
                for (let i = 0; i < contactsRes.length; i++) {
                    const co = contactsRes[i];
                    theContacts.push(await populateContact(getAllAsync, co));
                }
                setContacts(theContacts);
            } catch (e) {
                console.error('error creating documents', e);
            } finally {
                setLoading(false);
            }
        }

        getClients();
    }, [inspectionId, getAllAsync]);

    const onCancel = useCallback(() => onClose(), [])

    const onIncludeExclusionsClicked = useCallback(() => {
        setIncludeExclusions(!includeExclusions);
    }, [includeExclusions])

    const onBAPClick = useCallback(() => {
        setBap(!includeExclusions);
    }, [includeExclusions])

    const onSAPClick = useCallback(() => {
        setSap(!includeExclusions);
    }, [includeExclusions]);

    const onSigClick = useCallback((contactId?: number) => {
        if (!contactId) return;

        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        setContactIdSig(contactId);
        setSignatureMode(true);
    }, []);

    const onCancelSig = useCallback(() => {
        ScreenOrientation.unlockAsync();
        setSignatureMode(false);
    }, [])

    const failSnackbar = useCallback((message?: string) =>
        updateSnackbar({
            show: true,
            type: "fail",
            onDismissSnackBar: () => { },
            message: message ? message : "Could not add signature"
        })(dispatch), [dispatch])

    const onSaveSig = useCallback(() => {
        ScreenOrientation.unlockAsync();

        if (signature && signature.length > 0) {
            setBuilding(true);
            const path = FileSystem.cacheDirectory + "inspector_sig.png";
            FileSystem.writeAsStringAsync(
                path,
                signature.replace("data:image/png;base64,", ""),
                { encoding: FileSystem.EncodingType.Base64 }
            )
                .then(() => FileSystem.getInfoAsync(path))
                .then(async (fileInfo: FileInfo) => {
                    saveToPhone(fileInfo.uri, (err: string) => {
                        setBuilding(false);
                        failSnackbar(err);
                    }, async (asset: Asset) => {
                        const fileUri = Platform.OS === 'ios' ? asset.uri : asset.filename;
                        execAsync(SQL_UPDATE_INSPECTION_CONTACT_SIG(contactIdSig, fileUri));
                        const contact = contacts.find(c => c.inspectionContactId === contactIdSig);
                        if (contact) {
                            contact.contactSignaturePath = fileUri;
                        }
                        setContacts([...contacts]);
                        setSignatureMode(false);
                        setBuilding(false);
                    });
                })
                .catch(console.error)
        }
    }, [signature, contactIdSig, contacts])

    // Called after ref.current.readSignature() reads a non-empty base64 string
    const handleOK = useCallback((signature: any) => {
        setSignature(signature);
    }, [signature])

    // Called after ref.current.clearSignature()
    const handleClear = useCallback(() => {
        setSignature("");
    }, [])

    // Called after end of stroke
    const handleEnd = useCallback(() => {
        if (ref?.current) {
            // @ts-ignore
            ref.current.readSignature();
        }
    }, [ref])

    return (
        <Dialog
            visible={true}
            title={signatureMode ? "Sign in the white area" : "Pre-Inspection Agreement"}
            buttons={(
                <ModalButtons
                    confirmDisabled={building}
                    cancelDisabled={building}
                    confirmText={signatureMode ? "Save" : "Generate"}
                    cancelAction={signatureMode ? onCancelSig : onCancel}
                    confirmAction={signatureMode ? onSaveSig : onDone} />
            )}
            onTouchOutside={onClose}>
            <View>
                {signatureMode && (
                    <View style={{ display: 'flex', borderColor: 'black', borderWidth: 1 }}>
                        <View style={styles.signatureContainer}>
                            <SignatureScreen
                                // @ts-ignore
                                ref={ref!}
                                onEnd={handleEnd}
                                onOK={handleOK}
                                onClear={handleClear}
                                descriptionText={"Sign here"}
                                webStyle={style}
                            />
                        </View>
                    </View>
                )}
                {!signatureMode && (
                    <View>
                        {(building || loading) && <ProgressBar indeterminate={true} />}
                        <View>
                            <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
                                <Checkbox
                                    disabled={building}
                                    status={includeExclusions ? 'checked' : 'unchecked'}
                                    onPress={onIncludeExclusionsClicked}
                                />
                                <Text
                                    style={styles.checkboxText}
                                    onPress={onIncludeExclusionsClicked}>
                                    Include Exclusions
                                </Text>
                            </View>
                            {includeExclusions && (
                                <TextInput
                                    disabled={building}
                                    label="Exclusions"
                                    value={exclusions}
                                    onChangeText={setExclusions}
                                />
                            )}
                        </View>
                        <Divider />
                        <View>
                            <Subheading>Attendees:</Subheading>
                            <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
                                <Checkbox
                                    disabled={building}
                                    status={bap ? 'checked' : 'unchecked'}
                                    onPress={onBAPClick}
                                />
                                <Text
                                    style={styles.checkboxText}
                                    onPress={onBAPClick}>
                                    Buyer's Agent Present
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', minWidth: 50, height: 50 }}>
                                <Checkbox
                                    disabled={building}
                                    status={sap ? 'checked' : 'unchecked'}
                                    onPress={onSAPClick}
                                />
                                <Text
                                    style={styles.checkboxText}
                                    onPress={onSAPClick}>
                                    Seller's Agent Present
                                </Text>
                            </View>
                        </View>
                        <Divider />
                        <View>
                            <Subheading>Client Signatures:</Subheading>
                            {contacts.filter(c => c.tag === "Client").map((contact, index) => (
                                <View key={index}>
                                    <Text>Signature: {contact.firstName} {contact.lastName}</Text>
                                    {contact.contactSignaturePath && (
                                        <View onTouchStart={() => onSigClick(contact.inspectionContactId)}>
                                            <Image
                                                source={{ uri: replaceWithCorrectUri(contact.contactSignaturePath) }}
                                                style={{ height: SIG_HEIGHT, width: '100%' }}
                                            />
                                        </View>
                                    )}
                                    {!contact.contactSignaturePath && (
                                        <View
                                            style={styles.signatureNeededView}
                                            onTouchStart={() => onSigClick(contact.inspectionContactId)}>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    checkboxText: {
        marginTop: 7,
    },
    signatureContainer: {
        height: 200,
        width: "100%",
    },
    signatureNeededView: {
        height: SIG_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
    },
    signatureView: {
        overflow: "hidden",
    },
});
