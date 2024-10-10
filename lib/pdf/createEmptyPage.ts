import { IPdfConfig } from "./IPdfConfig"
import { degrees, grayscale, rgb } from 'pdf-lib'
import { getWidthOfText, insertText } from "./text";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { IInpsectionData } from "./IInspectionData";

export const BORDER_PADDING = 20;
export const BORDER_WIDTH = 2;
export const PAGE_START = BORDER_PADDING + BORDER_WIDTH;

const createEmptyPage = (data: IInpsectionData, config: IPdfConfig, hideHeaderFooter: boolean = false) => {
    const page = config.pdfDoc.addPage();
    page.drawRectangle({
        x: BORDER_PADDING,
        y: BORDER_PADDING,
        width: page.getWidth() - BORDER_PADDING * 2,
        height: page.getHeight() - BORDER_PADDING * 2,
        borderWidth: BORDER_WIDTH,
        borderColor: grayscale(0.75),
        color: rgb(1, 1, 1),
        opacity: 0.75,
        borderOpacity: 0.75,
    });

    // Header
    if (!hideHeaderFooter) {
        const pageCount = config.pdfDoc.getPages().length;
        const a = data.address;
        const addressString = `${a.street1}${a.street2 ? ' ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.zipCode} Page ${pageCount}`;
        const textWidth = getWidthOfText(addressString, 'Paragraph', config);
        insertText(addressString,
            'Paragraph',
            page,
            config,
            page.getWidth() - textWidth - BORDER_PADDING,
            page.getHeight() - 2);
    }

    // Footer
    if (!hideHeaderFooter) {
        const preparedString = `This confidential report is prepared exclusively for ${data.preparedFor}`;
        const companyString = `@${format(new Date(data.date), "yyyy", { locale: enUS })} ${data.preparedByCompany}`;
        const textPreparedWidth = getWidthOfText(preparedString, 'Tiny', config);
        insertText(preparedString,
            'Tiny',
            page,
            config,
            page.getWidth() - textPreparedWidth - BORDER_PADDING,
            19);
        const textCompanyWidth = getWidthOfText(companyString, 'Tiny', config);
        insertText(companyString,
            'Tiny',
            page,
            config,
            page.getWidth() - textCompanyWidth - BORDER_PADDING,
            11);
    }

    // Watermark
    if (config.preview) {
        const { height } = page.getSize()
        page.drawText('Preview', {
            x: 5,
            y: height / 2 + 300,
            size: 250,
            font: config.font,
            color: rgb(0.75, 0.75, 0.75),
            rotate: degrees(-55),
        });
    }

    return page;
}

export default createEmptyPage;