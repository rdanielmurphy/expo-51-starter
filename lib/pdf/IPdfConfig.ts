import { PDFDocument, PDFFont, RGB } from 'pdf-lib'

export interface IPdfConfig {
    pdfDoc: PDFDocument
    font: PDFFont
    boldFont: PDFFont
    checkboxBorderWidth: number
    checkboxBorderColor: RGB
    checkboxBackgroundColor: RGB
    preview?: boolean
}