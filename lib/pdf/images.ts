import { IPdfConfig } from "./IPdfConfig"
import { PDFImage, PDFPage, PDFPageDrawImageOptions } from 'pdf-lib'

export const insertImage = async (page: PDFPage,
    encodedImage: string,
    options: PDFPageDrawImageOptions,
    config: IPdfConfig) => {
    let image: PDFImage
    if (encodedImage.charAt(0) === 'i') {
        image = await config.pdfDoc.embedPng(encodedImage);
    } else {
        image = await config.pdfDoc.embedJpg(encodedImage);
    }
    page.drawImage(image, options);
}

export const insertCenteredImage = async (page: PDFPage,
    encodedImage: string,
    options: PDFPageDrawImageOptions,
    config: IPdfConfig) => {
    let image: PDFImage
    if (encodedImage.charAt(0) === 'i') {
        image = await config.pdfDoc.embedPng(encodedImage);
    } else {
        image = await config.pdfDoc.embedJpg(encodedImage);
    }
    page.drawImage(image, options);
}
