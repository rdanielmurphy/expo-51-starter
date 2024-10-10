import { IPdfConfig } from "./IPdfConfig"
import { breakTextIntoLines, PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { IPosition } from "./types";
import { BLACK } from "./colors";

export interface IFont {
    font: string
    size: number
    lineHeight: number
}

export const TITLE_SIZE = 30;
export const HEADING_SIZE = 24;
export const SUBHEADING_SIZE = 18;
export const PARAGRAPH_SIZE = 12;
export const TINY_SIZE = 8;

export const FONTS = {
    'Title': {
        font: "boldFont",
        size: TITLE_SIZE,
        lineHeight: 1,
    },
    'Heading': {
        font: "font",
        size: HEADING_SIZE,
        lineHeight: 1,
    },
    'Subheading': {
        font: "boldFont",
        size: SUBHEADING_SIZE,
        lineHeight: 1,
    },
    'Paragraph': {
        font: "font",
        size: PARAGRAPH_SIZE,
        lineHeight: 1,
    },
    'ParagraphBold': {
        font: "boldFont",
        size: PARAGRAPH_SIZE,
        lineHeight: 1,
    },
    'Tiny': {
        font: "font",
        size: TINY_SIZE,
        lineHeight: 1,
    }
}

export type TEXT_TYPE = 'Title' | 'Heading' | 'Subheading' | 'Paragraph' | 'ParagraphBold' | 'Tiny'

export const getFont = (type: TEXT_TYPE, config: IPdfConfig) => {
    return config[FONTS[type].font];
}

export const getFontSize = (type: TEXT_TYPE) => {
    return FONTS[type].size;
}

export const getLineHeight = (type: TEXT_TYPE) => {
    return FONTS[type].lineHeight;
}

export const getWidthOfText = (text: string, type: TEXT_TYPE, config: IPdfConfig) => {
    const font = getFont(type, config);
    const fontSize = getFontSize(type);
    return font.widthOfTextAtSize(text, fontSize);
}

export const getWidthAndHeightOfText = (text: string, type: TEXT_TYPE, maxWidth: number, config: IPdfConfig) => {
    const font = getFont(type, config);
    const fontSize = getFontSize(type);
    return getBoundingBox(text ?? "", config.pdfDoc, font, fontSize, FONTS[type].lineHeight, maxWidth);
}

export const getBoundingBox = (text: string, doc: PDFDocument, font: PDFFont, fontSize: number, lineHeight: number, maxWidth: number) => {
    // Function to measure the width of a length of text. Lifted from the 'drawText' source.
    // font refers to an instance of PDFFont
    const measureWidth = (s?: string) => font.widthOfTextAtSize(s ?? "", fontSize);

    // We split the text into an array of lines
    // doc refers to an instance of PDFDocument
    const lines = breakTextIntoLines(text, doc.defaultWordBreaks, maxWidth, measureWidth);

    // We get the index of the longest line
    const longestLine = lines.reduce((prev, val, idx) => val.length > lines[prev].length ? idx : prev, 0);
    // The width of our bounding box will be the width of the longest line of text
    const textWidth = measureWidth(lines[longestLine]);
    // The height of our bounding box will be the number of lines * the font size * line height
    const textHeight = lines.length * fontSize * lineHeight;

    // Note: In my code I express the line height like in CSS (e.g. 1.15), if you express your line height in
    // a PDF-LIB compatible way, you'd do it like this:
    // const textHeight = lines.length * fontSize * (lineHeight / fontSize);

    return { width: textWidth, height: textHeight, lines: lines };
}

export const insertText = (
    text: string,
    type: TEXT_TYPE,
    page: PDFPage,
    config: IPdfConfig,
    x?: number,
    y?: number): IPosition => {

    const font = getFont(type, config);
    const fontSize = getFontSize(type);
    const lineHeight = getFontSize(type);

    const newY = y ? y - fontSize : undefined;
    page.drawText(text ?? "", {
        x: x,
        y: newY,
        size: fontSize,
        font: font,
        color: BLACK,
        lineHeight: lineHeight,
    });

    return {
        x: x,
        y: newY
    }
}

export const insertCenteredText = (
    text: string,
    type: TEXT_TYPE,
    page: PDFPage,
    config: IPdfConfig,
    y?: number) => {

    const font = getFont(type, config);
    const fontSize = getFontSize(type);
    const lineHeight = getFontSize(type);

    const textWidth = getWidthOfText(text, type, config);

    const newX = page.getWidth() / 2 - textWidth / 2;
    const newY = y ? y - fontSize : undefined;

    page.drawText(text, {
        x: newX,
        y: newY,
        size: fontSize,
        font: font,
        color: BLACK,
        lineHeight: lineHeight,
    });

    return {
        x: newX,
        y: newY
    }
}
