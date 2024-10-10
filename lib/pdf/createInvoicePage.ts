import { IPdfConfig } from "./IPdfConfig"
import createEmptyPage, { BORDER_PADDING } from "./createEmptyPage";
import { getWidthOfText, insertCenteredText, insertText, PARAGRAPH_SIZE } from "./text";
import { drawerDivider } from "./misc";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { IInpsectionData, IInspectionDataInvoicePayment } from "./IInspectionData";

const printPaymentMethod = (payment: IInspectionDataInvoicePayment) =>
(
    `${payment.paymentMethod} (${payment.amount})`
)

const createInvoicePage = (data: IInpsectionData, config: IPdfConfig) => {
    const page = createEmptyPage(data, config);

    const titlePos = insertCenteredText("Receipt/Invoice", "Title", page, config, page.getHeight() - 50);
    page.moveTo(0, titlePos.y);
    drawerDivider(page.getY() - 10, page);
    page.moveDown(10);

    const payments = data.invoice.payments
    const address = data.address
    insertText(data.preparedByCompany, 'ParagraphBold', page, config, BORDER_PADDING + 10, page.getY());
    insertText("Property Address", 'ParagraphBold', page, config, (page.getWidth() / 2), page.getY());
    page.moveDown(PARAGRAPH_SIZE + 5);
    insertText(data.preparedByPhoneNumber, 'ParagraphBold', page, config, BORDER_PADDING + 10, page.getY());
    insertText(address.street1 + " " + address.street2, 'ParagraphBold', page, config, (page.getWidth() / 2), page.getY());
    page.moveDown(PARAGRAPH_SIZE + 5);
    insertText(address.city + ", " + address.state + " " + address.zipCode, 'ParagraphBold', page, config, (page.getWidth() / 2), page.getY());
    page.moveDown(PARAGRAPH_SIZE + 10);
    insertText("Date: " + format(new Date(data.date), "MMMM dd, yyyy", { locale: enUS }), 'Paragraph', page, config, BORDER_PADDING + 10, page.getY());
    insertText("Inspection Number: " + data.reportNumber, 'Paragraph', page, config, (page.getWidth() / 2), page.getY());
    page.moveDown(PARAGRAPH_SIZE + 5);
    insertText("Inspected By: " + data.inspectorName, 'Paragraph', page, config, BORDER_PADDING + 10, page.getY());
    insertText("Payment Method(s): " + (payments.length > 0 ? printPaymentMethod(payments[0]) : "-"), 'Paragraph', page, config, (page.getWidth() / 2), page.getY());
    if (payments.length > 1) {
        const paymentWidth = getWidthOfText("Payment Method(s): ", 'Paragraph', config);
        page.moveDown(PARAGRAPH_SIZE + 5);
        insertText(printPaymentMethod(payments[1]), 'Paragraph', page, config, (page.getWidth() / 2) + paymentWidth, page.getY());
        page.moveDown(PARAGRAPH_SIZE + 5);
        if (payments.length > 2) {
            insertText(printPaymentMethod(payments[2]), 'Paragraph', page, config, (page.getWidth() / 2) + paymentWidth, page.getY());
        }
        page.moveDown(PARAGRAPH_SIZE + 5);
        if (payments.length > 3) {
            insertText(printPaymentMethod(payments[3]), 'Paragraph', page, config, (page.getWidth() / 2) + paymentWidth, page.getY());
        }
        page.moveDown(PARAGRAPH_SIZE + 10);
    } else {
        page.moveDown(PARAGRAPH_SIZE + 25);
    }
    insertText("Client: " + data.preparedFor, 'Paragraph', page, config, BORDER_PADDING + 10, page.getY());
    page.moveDown(PARAGRAPH_SIZE + 10);
    insertText("Inspection", 'ParagraphBold', page, config, BORDER_PADDING + 10, page.getY());
    insertText("Fee", 'ParagraphBold', page, config, 300, page.getY());
    page.moveDown(PARAGRAPH_SIZE + 5);
    drawerDivider(page.getY(), page);
    page.moveDown(5);

    (data.invoice.inspections as any[]).forEach((v: any) => {
        insertText(v.name, 'Paragraph', page, config, BORDER_PADDING + 10, page.getY());
        insertText(v.fee, 'Paragraph', page, config, 300, page.getY());
        page.moveDown(PARAGRAPH_SIZE + 5);
    });

    page.moveDown(50);
    drawerDivider(page.getY(), page);
    page.moveDown(5);
    insertText("Total", 'ParagraphBold', page, config, BORDER_PADDING + 10, page.getY());
    insertText(data.invoice.total, 'ParagraphBold', page, config, 300, page.getY());

    return page;
}

export default createInvoicePage;