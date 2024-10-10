import { SQL_GET_CONTACT_ADDRESSES, SQL_GET_CONTACT_EMAILS, SQL_GET_CONTACT_LICENSES, SQL_GET_CONTACT_PHONENUMBERS } from './sqlCommands';
import { IAddress, IContact, IEmail, ILicense, IPhonenumber } from "./types";

export const populateContact = async (
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any[]>,
    dbContact: IContact) => {
    const addressesRes = await getAllAsync(SQL_GET_CONTACT_ADDRESSES(dbContact.id!));
    const cAddresses: IAddress[] = []
    addressesRes.forEach(async (a) => {
        cAddresses.push({
            addr1: a.street,
            addr2: a.street2,
            city: a.city,
            state: a.state,
            zip: a.zipCode,
        })
    })
    const emailsRes = await getAllAsync(SQL_GET_CONTACT_EMAILS(dbContact.id!));
    const cEmails: IEmail[] = []
    emailsRes.forEach(async (e) => {
        cEmails.push({
            id: e.id,
            email: e.emailAddress,
            type: e.emailType,
            isPrimary: e.isPrimary === 1
        })
    })
    const phonesRes = await getAllAsync(SQL_GET_CONTACT_PHONENUMBERS(dbContact.id!));
    const cPhones: IPhonenumber[] = []
    phonesRes.forEach(async (p) => {
        cPhones.push({
            id: p.id,
            number: p.phoneNumber,
            extension: p.extension,
            type: p.phoneType,
            isPrimary: p.isPrimary === 1
        })
    })
    const licensesRes = await getAllAsync(SQL_GET_CONTACT_LICENSES(dbContact.id!));
    const cLicenses: ILicense[] = []
    licensesRes.forEach(async (l) => {
        cLicenses.push({
            id: l.id,
            licenseNumber: l.licenseNumber,
            state: l.state,
            startDate: l.startDate,
            type: l.type,
        })
    })
    const contact: IContact = {
        firstName: dbContact.firstName,
        lastName: dbContact.lastName,
        id: dbContact.id,
        tag: dbContact.tag,
        role: dbContact.role,
        addresses: cAddresses,
        emails: cEmails,
        phones: cPhones,
        licenses: cLicenses,
        contactSignaturePath: dbContact.contactSignaturePath,
        inspectionContactId: dbContact.inspectionContactId,
    }
    return contact
}