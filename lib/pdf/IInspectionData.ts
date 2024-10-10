export interface IInspectionDataAddress {
    street1: string
    street2: string
    city: string
    state: string
    zipCode: number
}

export interface IInspectionDataOverviewSummary {
    subsections: IInspectionDataOverviewSummarySubsection[]
}

export interface IInspectionDataOverviewSummarySubsection {
    title: string
    description: string
}

export interface IInspectionDataInvoiceInspection {
    name: string
    fee: string
}

export interface IInspectionDataInvoice {
    total: string
    payments: IInspectionDataInvoicePayment[]
    inspections: IInspectionDataInvoiceInspection[]
}

export interface IInspectionDataInvoicePayment {
    paymentMethod: string
    amount: string
}

export interface IInspectionDataSection {
    title: string
    order: number
    subsections: IInspectionDataSubSection[]
}

export interface IInspectionDataSubSectionPhoto {
    uri: string
    comment: string
}

export interface IInspectionDataSubSectionOption {
    name: string
    order: number
    values: IInspectionDataSubSectionValue[]
    subOptions: IInspectionDataSubSectionSubOption[]
}

export interface IInspectionDataSubSectionValue {
    type: number
    order: number
    value: string
    checked: boolean
    isHighlighted: boolean
    highlightColor: string
}

export interface IInspectionDataSubSectionSubOption {
    text: string
    isHighlighted: boolean
    highlightColor: string
    values: IInspectionDataSubSectionValue[]
}

export interface IInspectionDataSubSection {
    name: string
    order: number
    photos: IInspectionDataSubSectionPhoto[]
    options: IInspectionDataSubSectionOption[]
}

export interface IInpsectionData {
    logo: string
    cover: string
    address: IInspectionDataAddress
    date: number
    preparedByCompany: string
    preparedByPhoneNumber: string
    preparedByEmail: string
    preparedFor: string
    reportNumber: string
    inspectorName: string
    licenseCertification: string
    signature: string
    overview: IInspectionDataOverviewSummary
    summary: IInspectionDataOverviewSummary
    invoice: IInspectionDataInvoice
    sections: IInspectionDataSection[]
    agentName: string
    clientAddress: IInspectionDataAddress
    clientSignatures: string[]
    clients: string[]
    clientName: string
    companyName: string
    companyAddress: IInspectionDataAddress
    preInspectorAgreement: string
    exclusions: string
    notvalidin: string
    BPY: boolean
    BPN: boolean
    APY: boolean
    APN: boolean
}