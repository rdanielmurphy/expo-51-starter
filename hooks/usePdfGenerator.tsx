import { useCallback } from 'react';
import { Asset } from 'expo-asset';
import { readAsset } from '../lib/files';
import { generateInvoice, generatePreInspectionAgreement, generateReport } from '../lib/pdf/pdfGenerator';
import { SQL_GENERATE_INSPECTION_REPORT, SQL_GENERATE_INSPECTION_REPORT_OVERVIEW, SQL_GENERATE_INSPECTION_REPORT_SUMMARY, SQL_GENERATE_INSPECTION_REPORT_DATA, SQL_GET_CLOUD_ACCOUNT_EMAIL, SQL_GET_CLOUD_ACCOUNT_PHONE_NUMBER, SQL_GET_INSPECTOR_INFO, SQL_GET_INSPECTOR_SIG, SQL_GET_USER_LICENSES, SQL_GET_PHOTOTS_BY_INSPECTION_ID, SQL_GET_INSPECTION_SERVICES, SQL_GET_INSPECTION_CONTACTS, SQL_GET_INVOICE_PAYMENTS, SQL_GET_CLOUD_ACCOUNT_ADDRESSES } from '../lib/sqlCommands';
import { readAsStringAsync } from 'expo-file-system';
import { replaceWithCorrectUri } from '../lib/photos';
import { IInpsectionData, IInspectionDataAddress, IInspectionDataSection, IInspectionDataSubSection, IInspectionDataSubSectionOption, IInspectionDataSubSectionPhoto, IInspectionDataSubSectionSubOption, IInspectionDataSubSectionValue } from '../lib/pdf/IInspectionData';
import { Platform } from 'react-native';
import { numberToUSD } from '../lib/currency';
import { format } from 'date-fns';
import { useDbContext } from '../contexts/DbContext';
import { removeSpanTags } from '../lib/stringHelpers';

const getBase64Image = async (asset: Asset): Promise<string> => {
    return await readAsset(asset);
}

interface IInspectionDataSubSectionSubOptionWithId extends IInspectionDataSubSectionSubOption {
    id: number
}

export interface IPreInspectionAgreementProps {
    clients: string[]
    clientSignatures: string[]
    clientAddress: IInspectionDataAddress,
    preInspectorAgreement: string
    exclusions: string
    BPY: boolean
    BPN: boolean
    APY: boolean
    APN: boolean
}

export function usePdfGenerator() {
    const { ready, getAllAsync, getFirstAsync } = useDbContext();

    const getDataForReport = useCallback(async (inspectionId: number): Promise<IInpsectionData> => {
        const reportData = await getFirstAsync(SQL_GENERATE_INSPECTION_REPORT(inspectionId));
        const sigData = await getFirstAsync(SQL_GET_INSPECTOR_SIG());
        const overviewData = await getAllAsync(SQL_GENERATE_INSPECTION_REPORT_OVERVIEW(inspectionId));
        const summaryData = await getAllAsync(SQL_GENERATE_INSPECTION_REPORT_SUMMARY(inspectionId));
        const companyEmail = await getFirstAsync(SQL_GET_CLOUD_ACCOUNT_EMAIL());
        const companyPhone = await getFirstAsync(SQL_GET_CLOUD_ACCOUNT_PHONE_NUMBER());
        const companyAddress = await getFirstAsync(SQL_GET_CLOUD_ACCOUNT_ADDRESSES());
        const inspector = await getFirstAsync(SQL_GET_INSPECTOR_INFO());
        const licenseRes = await getAllAsync(SQL_GET_USER_LICENSES());
        let licenseCertification = "-";
        if (licenseRes.length > 0) {
            for (let i = 0; i < licenseRes.length; i++) {
                const licenseItem = licenseRes[i];
                if (licenseItem.state === reportData.state) {
                    licenseCertification = licenseItem.licenseNumber;
                    break;
                }
            }
        }
        const sectionData = await getAllAsync(SQL_GENERATE_INSPECTION_REPORT_DATA(inspectionId));
        const photosArray = await getAllAsync(SQL_GET_PHOTOTS_BY_INSPECTION_ID(inspectionId));
        const servicesArray = await getAllAsync(SQL_GET_INSPECTION_SERVICES(inspectionId));
        const paymentsArray = await getAllAsync(SQL_GET_INVOICE_PAYMENTS(reportData.invoiceId));
        const contactsArray = await getAllAsync(SQL_GET_INSPECTION_CONTACTS(inspectionId));

        const agents = contactsArray.filter(c => c.tag === "Realtor").map(c => c.displayName);
        const clients = contactsArray.filter(c => c.tag === "Client").map(c => c.displayName);
        let cover: string = "";
        if (reportData.coverFileName) {
            // if (Platform.OS === 'ios') {
            //     console.log(`C ${reportData.coverFileName}`);
            //     const c = await getInfoAsync('ph://3E51D647-0845-49FC-9C85-3BDCEE2A918E', { size: true, md5: true });
            //     const d = await readAsStringAsync("assets-library://AF56B183-C77B-4676-956A-C80C3ECCE69F/L0/001", { encoding: "base64" });

            if (Platform.OS !== 'ios') {
                cover = await readAsStringAsync(replaceWithCorrectUri(reportData.coverFileName), { encoding: "base64" });
            }
        } else {
            const dummyCover = await Asset.fromModule(require('../assets/dummy/dummy_house.txt'));
            cover = await getBase64Image(dummyCover);
        }
        let logo: string = "";
        if (reportData.logoFileName) {
            logo = await readAsStringAsync(replaceWithCorrectUri(reportData.logoFileName), { encoding: "base64" });
        } else {
            const dummyLogo = await Asset.fromModule(require('../assets/dummy/dummy_logo.txt'));
            logo = await getBase64Image(dummyLogo);
        }
        let signature: string = "";
        if (sigData && sigData.fileName) {
            signature = await readAsStringAsync(replaceWithCorrectUri(sigData.fileName), { encoding: "base64" });
        } else {
            const dummySignature = await Asset.fromModule(require('../assets/dummy/dummy_signature.txt'));
            signature = await getBase64Image(dummySignature);
        }
        const inspsectionReportData = {
            logo: logo,
            cover: cover,
            address: {
                "street1": reportData.street ?? "-",
                "street2": reportData.street2 ?? "",
                "city": reportData.city ?? "-",
                "state": reportData.state ?? "-",
                "zipCode": reportData.zipCode ?? "-",
            },
            "date": reportData.inspectionDate ? `${format(reportData.inspectionDate, "yyyy-MM-dd")}` : new Date().getTime(),
            "preparedFor": contactsArray && contactsArray.length > 0 ? contactsArray.map(c => c.displayName).join(", ") : "-",
            "preparedByCompany": reportData.name ? reportData.name : "-",
            "preparedByPhoneNumber": companyPhone && companyPhone.phoneNumber ? companyPhone.phoneNumber : "-",
            "preparedByEmail": companyEmail && companyEmail.emailAddress ? companyEmail.emailAddress.trim() : "-",
            "reportNumber": reportData.number,
            "inspectorName": inspector && inspector.displayName ? inspector.displayName : "-",
            "licenseCertification": licenseCertification,
            "signature": signature,
            "overview": {
                "subsections": overviewData.map(d => ({
                    title: d.name,
                    description: d.text || " ",
                }))
            },
            "summary": {
                "subsections": summaryData.map(d => ({
                    title: d.name,
                    description: d.text || " ",
                }))
            },
            "invoice": {
                "payments": [],
                "inspections": [
                    {
                        "name": "Home Inspection",
                        "fee": numberToUSD(reportData.inspectionFee - (reportData.inspectionDiscount ? reportData.inspectionDiscount : 0)),
                    }
                ],
                "total": numberToUSD(reportData.totalFee),
            },
            "sections": [],
            // preinspection agreement data
            "agentName": agents[0] ?? "-",
            "clientAddress": {
                "street1": "-",
                "street2": "-",
                "city": "-",
                "state": "-",
                "zipCode": 0,
            },
            "clientSignatures": [],
            "clients": clients,
            "clientName": clients.join(", "),
            "companyName": reportData.name ? reportData.name : "-",
            "companyAddress": companyAddress ? {
                "street1": companyAddress.street ?? "-",
                "street2": companyAddress.street2 ?? "",
                "city": companyAddress.city ?? "-",
                "state": companyAddress.state ?? "-",
                "zipCode": companyAddress.zipCode ?? "-",
            } : {
                "street1": "-",
                "street2": "-",
                "city": "-",
                "state": "-",
                "zipCode": "-",
            },
            "preInspectorAgreement": "",
            "exclusions": "",
            "notvalidin": "",
            "BPY": false,
            "BPN": false,
            "APY": false,
            "APN": false,
        } as IInpsectionData;

        inspsectionReportData.invoice.payments.push(...paymentsArray.map(p => ({
            paymentMethod: p.paymentMethod,
            amount: numberToUSD(p.amount ?? 0),
        })));
        inspsectionReportData.invoice.inspections.push(...servicesArray.map(s => ({
            name: s.description,
            fee: numberToUSD(s.price - (s.discount ? s.discount : 0)),
        })));

        const sectionMap = new Map<number, Map<number, any>>();
        const sectionNames = new Map<number, string>();
        const sectionOrders = new Map<number, number>();
        const subsectionNames = new Map<number, string>();
        const subsectionOrders = new Map<number, number>();
        const optionNames = new Map<number, string>();
        const optionOrders = new Map<number, number>();
        let valueOptions = new Map<number, Map<number, IInspectionDataSubSectionSubOptionWithId>>();
        sectionData.forEach(sd => {
            if (sectionMap.get(sd.sectionId) === undefined) {
                sectionMap.set(sd.sectionId, new Map<number, any>());
                sectionNames.set(sd.sectionId, sd.sectionName);
                sectionOrders.set(sd.sectionId, sd.sectionOrder);
            }
            if (sectionMap.get(sd.sectionId)?.get(sd.subsectionId) === undefined) {
                sectionMap.get(sd.sectionId)?.set(sd.subsectionId, new Map<number, any>());
                subsectionNames.set(sd.subsectionId, sd.subsectionName);
                subsectionOrders.set(sd.subsectionId, sd.subsectionOrder);
            }
            if (sectionMap.get(sd.sectionId)?.get(sd.subsectionId)?.get(sd.optionId) === undefined) {
                sectionMap.get(sd.sectionId)?.get(sd.subsectionId)?.set(sd.optionId, new Map<number, IInspectionDataSubSectionValue>());
                optionNames.set(sd.optionId, sd.optionName);
                optionOrders.set(sd.optionId, sd.optionOrder);
            }
            // is an option/value
            if (sd.valueOptionId === null) {
                if (sd.valueType === 0 && sd.checked === 1) {
                    const item: IInspectionDataSubSectionValue = {
                        type: sd.valueType,
                        order: sd.valueOrder,
                        value: sd.valueText,
                        checked: sd.checked,
                        isHighlighted: sd.isHighlighted,
                        highlightColor: sd.highLightColor,
                    };
                    sectionMap.get(sd.sectionId)?.get(sd.subsectionId)?.get(sd.optionId).set(sd.valueId, item);
                } else if (sd.valueType !== 0 && sd.userText !== null && sd.userText !== "") {
                    const item: IInspectionDataSubSectionValue = {
                        type: sd.valueType,
                        order: sd.valueOrder,
                        value: removeSpanTags(sd.userText) ?? "",
                        checked: false,
                        isHighlighted: sd.isHighlighted,
                        highlightColor: sd.highLightColor,
                    };
                    sectionMap.get(sd.sectionId)?.get(sd.subsectionId)?.get(sd.optionId).set(sd.valueId, item);
                }
            }
            // is a value_option
            else {
                if (!valueOptions.has(sd.optionId)) {
                    valueOptions.set(sd.optionId, new Map<number, IInspectionDataSubSectionSubOptionWithId>());
                }
                if (!valueOptions.get(sd.optionId)?.has(sd.valueOptionId)) {
                    const valueOption: IInspectionDataSubSectionSubOptionWithId = {
                        id: sd.valueOptionId,
                        text: sd.valueText,
                        isHighlighted: sd.isHighlighted,
                        highlightColor: sd.highLightColor,
                        values: []
                    };
                    valueOptions.get(sd.optionId)?.set(sd.valueOptionId, valueOption);
                }
                const item: IInspectionDataSubSectionValue = {
                    type: sd.valueType,
                    order: sd.valueOptionOrder,
                    value: sd.valueOptionText,
                    checked: sd.valueOptionChecked,
                    isHighlighted: false,
                    highlightColor: ""
                }
                valueOptions.get(sd.optionId)?.get(sd.valueOptionId)?.values.push(item);
            }
        });

        // add photos
        const subectionPhotos = new Map<number, IInspectionDataSubSectionPhoto[]>();
        if (photosArray.length > 0) {
            for (const p of photosArray) {
                const p64 = await readAsStringAsync(replaceWithCorrectUri(p.fileName), { encoding: "base64" });
                if (subectionPhotos.get(p.subsectionId) === undefined) {
                    subectionPhotos.set(p.subsectionId, []);
                }
                subectionPhotos.get(p.subsectionId)?.push({
                    uri: p64,
                    comment: p.comment,
                });
            }
        }

        const filteredValueOptions = new Map<number, Map<number, IInspectionDataSubSectionSubOptionWithId>>();
        for (let k1 of valueOptions.keys()) {
            const item = valueOptions.get(k1);
            if (item) {
                for (let k2 of item.keys()) {
                    const item2 = item.get(k2)
                    if (item2 && item2.values.filter(v => v.checked).length > 0) {
                        if (!filteredValueOptions.has(k1)) {
                            filteredValueOptions.set(k1, new Map<number, IInspectionDataSubSectionSubOptionWithId>());
                        }
                        filteredValueOptions.get(k1)?.set(k2, item2);
                        break;
                    }
                }
            }
        }

        for (const [k, v] of sectionMap.entries()) {
            let includeSection = false;
            const section = {
                title: sectionNames.get(k) || "",
                order: sectionOrders.get(k) || 0,
                subsections: [],
            } as IInspectionDataSection;
            for (const [k2, v2] of v.entries()) {
                let includeSubSection = false;
                const subsection = {
                    name: subsectionNames.get(k2) || "",
                    order: subsectionOrders.get(k2) || 0,
                    photos: [],
                    options: [],
                } as IInspectionDataSubSection;
                if (subectionPhotos.get(k2)) {
                    includeSubSection = true;
                    subectionPhotos.get(k2)?.forEach(p => subsection.photos.push(p))
                }
                for (const [k3, v3] of v2.entries()) {
                    let includeOption = false
                    const option = {
                        name: optionNames.get(k3) || "",
                        order: optionOrders.get(k3) || 0,
                        values: [],
                        subOptions: [],
                    } as IInspectionDataSubSectionOption;
                    for (const [k4, v4] of v3.entries()) {
                        option.values.push(v4)
                        includeOption = true;
                        includeSection = true;
                        includeSubSection = true;
                    }
                    if (filteredValueOptions.has(k3)) {
                        const suboption = filteredValueOptions.get(k3);
                        for (let k5 of suboption!.keys()) {
                            const so = suboption?.get(k5);
                            if (so) {
                                option.subOptions.push({
                                    text: so.text,
                                    values: so.values,
                                    isHighlighted: so.isHighlighted,
                                    highlightColor: so.highlightColor,
                                });
                                includeOption = true;
                                includeSection = true;
                                includeSubSection = true;
                            }
                        }
                    }
                    if (includeOption) {
                        subsection.options.push(option)
                    }
                }
                if (includeSubSection) {
                    section.subsections.push(subsection);
                }
            }

            if (includeSection) {
                inspsectionReportData.sections.push(section)
            }
        }

        return inspsectionReportData as IInpsectionData;
    }, [ready])

    const generateInspectionReport = useCallback(async (inspectionId: number, noPreview?: boolean) => {
        const data = await getDataForReport(inspectionId);
        return await generateReport(data, noPreview);
    }, [ready]);

    const generateInvoiceReport = useCallback(async (inspectionId: number, noPreview?: boolean) => {
        const data = await getDataForReport(inspectionId);
        return await generateInvoice(data, noPreview);
    }, [ready]);

    const generatePreInspectionAgreementReport = useCallback(async (inspectionId: number, preData: IPreInspectionAgreementProps, noPreview?: boolean) => {
        const reportData = await getDataForReport(inspectionId);
        const data = {
            ...reportData,
            ...preData,
        }
        return await generatePreInspectionAgreement(data, noPreview);
    }, [ready]);

    return { generateInspectionReport, generateInvoiceReport, generatePreInspectionAgreementReport };
}
