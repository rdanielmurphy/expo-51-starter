import { PDFPage } from 'pdf-lib'
import { IPdfConfig } from './IPdfConfig';
import { BLACK } from './colors';

export const CHECKBOX_SIZE = 25;
export const CHECKBOX_TEXT_PADDING = 5;

export const addCheckboxToPage = async (id: string, label: string, x: number, y: number, page: PDFPage, config: IPdfConfig) => {
    const form = config.pdfDoc.getForm();

    const checkBox = form.createCheckBox(`checkbox.${id}`);
    checkBox.addToPage(page, {
        x: x,
        y: y,
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        textColor: BLACK,
        backgroundColor: config.checkboxBackgroundColor,
        borderColor: config.checkboxBorderColor,
        borderWidth: config.checkboxBorderWidth,
    });
    checkBox.enableReadOnly();
    page.drawText(label, {
        x: x + CHECKBOX_SIZE + CHECKBOX_TEXT_PADDING,
        y: y,
        font: config.font,
        color: BLACK,
    });
}