import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { IPdfConfig } from './IPdfConfig';
import createCoverPage from './createCoverPage';
import createSummaryOverviewPage from './createSummaryOverviewPage';
import createInvoicePage from './createInvoicePage';
import { IInpsectionData, IInspectionDataSection } from './IInspectionData';
import createSectionPages from './createSectionPage';
import createPreInspectionAgreement from './createPreInspectionAgreement';

export const generateReport = async (data: IInpsectionData, noPreview?: boolean): Promise<PDFDocument> => { // TODO: Pass in report settings here
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const preview = data.preparedByEmail !== "mikelicht322@gmail.com" &&
        data.preparedByEmail !== "rdanielmurphy@gmail.com" &&
        data.preparedByEmail !== "info@affluent-llc.com";

    const config: IPdfConfig = {
        pdfDoc: pdfDoc,
        font: timesRomanFont,
        boldFont: timesRomanFontBold,
        checkboxBorderWidth: 2,
        checkboxBorderColor: rgb(0, 0, 0),
        checkboxBackgroundColor: rgb(1, 1, 1),
        preview: preview
        // preview: !noPreview,
    };

    createCoverPage(data, config);
    createSummaryOverviewPage("Report Overview", data, "overview", config);
    createSummaryOverviewPage("Report Summary", data, "summary", config);
    createInvoicePage(data, config);
    data.sections.sort((a, b) => a.order - b.order).forEach((s: IInspectionDataSection) => {
        createSectionPages(data, s, config);
    });

    return pdfDoc;
}

export const generateInvoice = async (data: IInpsectionData, noPreview?: boolean): Promise<PDFDocument> => { // TODO: Pass in report settings here
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const config: IPdfConfig = {
        pdfDoc: pdfDoc,
        font: timesRomanFont,
        boldFont: timesRomanFontBold,
        checkboxBorderWidth: 2,
        checkboxBorderColor: rgb(0, 0, 0),
        checkboxBackgroundColor: rgb(1, 1, 1),
        preview: !noPreview,
    };

    createInvoicePage(data, config);

    return pdfDoc;
}

export const generatePreInspectionAgreement = async (data: IInpsectionData, noPreview?: boolean): Promise<PDFDocument> => { // TODO: Pass in report settings here
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const config: IPdfConfig = {
        pdfDoc: pdfDoc,
        font: timesRomanFont,
        boldFont: timesRomanFontBold,
        checkboxBorderWidth: 2,
        checkboxBorderColor: rgb(0, 0, 0),
        checkboxBackgroundColor: rgb(1, 1, 1),
        preview: !noPreview,
    };

    createPreInspectionAgreement(data, config);

    return pdfDoc;
}