export interface ISection {
    id: number
    name: string
    number: number
    tag: string
    script_id: number
}

export interface ISubsection {
    id: number
    name: string
    number: number
    subsectionIndex: number
    script_id: number
    section_id: number
}

export interface IAddress {
    id?: number
    addr1: string
    addr2?: string
    city: string
    state: string
    zip: string
    type?: string
    isPrimary?: boolean
}

export interface IEmail {
    id?: number
    email: string
    type: string
    isPrimary?: boolean
}

export interface IPhonenumber {
    id?: number
    number: string
    extension: string
    type: string
    isPrimary?: boolean
}

export interface ILicense {
    id?: number
    licenseNumber: string
    state: string
    type: string
    startDate: number
}

export interface IContact {
    id?: number
    firstName: string
    lastName: string
    tag: string
    role?: string
    addresses: IAddress[]
    emails: IEmail[]
    phones: IPhonenumber[]
    licenses: ILicense[]
    contactSignaturePath?: string
    inspectionContactId?: number
}

export interface IValue {
    id: number
    checked: number
    commentListNumber: number
    isNa: number
    number: number
    text: string
    type: number
    userText: string
    script_id: number
    section_id: number
    subsection_id: number
    option_id: number
    isHighlighted: number
    highLightColor: number
    hasAdded: number
}

export const COMMENT = 'Comment';

export const TYPE_MAP = new Map([
    [0, 'Checkbox'],
    [2, COMMENT],
    [1, 'Short Text'],
    [3, 'Long Text'],
    [5, 'Multi Checkbox']
]);

export interface IService {
    id: number
    description: string
    discount?: number
    price: number
    scriptId?: number
    account_id?: number
    master?: number
    isCustom?: number
    enabled: number
}

export interface IInvoicePayment {
    id: number
    invoiceId: number
    paymentMethod: string
    amount: number
    checkNumber: string
}

export interface ICommentGroup {
    id: number
    name: string
    number: number
}

export interface ISummarySection {
    id?: number
    commentListNumber: number
    name: string
    number: number
    text: string
    summary_id: number
}

export interface IOverviewSection {
    id?: number
    commentListNumber: number
    name: string
    number: number
    text: string
    overview_id: number
}

export enum BasementType {
    Partial = '1',
    Full = '2',
    None = '3'
}

export enum CrawlspaceType {
    Partial = '1',
    Full = '2',
    None = '3'
}

export enum GarageType {
    Attached = '1',
    Detached = '2',
    Carport = '3',
    None = '4'
}