import { IPdfConfig } from "./IPdfConfig"
import createEmptyPage, { BORDER_PADDING, BORDER_WIDTH } from "./createEmptyPage";
import { getFont, getFontSize, getWidthAndHeightOfText, getWidthOfText, insertCenteredText, insertText } from "./text";
import { IInpsectionData, IInspectionDataSection, IInspectionDataSubSection, IInspectionDataSubSectionOption, IInspectionDataSubSectionPhoto, IInspectionDataSubSectionValue } from "./IInspectionData";
import { PDFPage, rgb } from "pdf-lib";
import { BLACK, GREY, WHITE } from "./colors";
import { insertImage } from "./images";

const createSectionPage = (data: IInpsectionData, s: IInspectionDataSection, config: IPdfConfig) => {
    const page = createEmptyPage(data, config);

    const titlePos = insertCenteredText(s.title, "Title", page, config, page.getHeight() - 50);
    page.moveTo(0, titlePos.y);
    page.moveDown(10);

    return page
}

const insertSubsectionHeader = (
    text: string,
    page: PDFPage,
    config: IPdfConfig,
    x?: number,
    y?: number
) => {
    const font = getFont('ParagraphBold', config);
    const fontSize = getFontSize('ParagraphBold');
    const lineHeight = getFontSize('ParagraphBold');

    const newY = y ? y - fontSize : undefined;
    page.drawRectangle({
        x: x,
        y: newY - 3,
        width: page.getWidth() - ((BORDER_PADDING + BORDER_WIDTH) * 2) - 10,
        height: lineHeight + 3,
        opacity: .75,
        color: GREY,
    });
    page.drawText(text, {
        x: x + 5,
        y: newY,
        size: fontSize,
        font: font,
        color: WHITE,
        lineHeight: lineHeight,
    });
    page.moveDown(lineHeight + 6);
}

const SUBSECTION_PADDING = 35;
const CHECKBOX_SIZE = 13;
const PHOTO_WIDTH = 125;
const PHOTO_HEIGHT = 175;
const PHOTO_WIDTH_PADDING = 20;
const PHOTO_HEIGHT_PADDING = 25;
const PHOTO_BOX_WIDTH = PHOTO_WIDTH + PHOTO_WIDTH_PADDING;
const PHOTO_BOX_HEIGHT = PHOTO_HEIGHT + PHOTO_HEIGHT_PADDING;

const calculateCheckboxWidth = (config: IPdfConfig, name: string) => {
    const textWidth = getWidthOfText(name, 'Paragraph', config);
    return textWidth + 5 + CHECKBOX_SIZE + 1
}

const calculateSuboptionsWidth = (config: IPdfConfig, name: string, options: IInspectionDataSubSectionValue[]) => {
    let totalWidth = getWidthOfText(name, 'Paragraph', config) + 5;
    options.forEach(o => totalWidth += calculateCheckboxWidth(config, o.value) + CHECKBOX_SIZE + 1)
    return totalWidth;
}

const renderHighlight = (page: PDFPage, width: number, height: number, color: string, x: number, y: number) => {
    const colorNumber = parseInt(color);
    const red = (colorNumber >> 16) & 0x0ff;
    const green = (colorNumber >> 8) & 0x0ff;
    const blue = (colorNumber) & 0x0ff;
    page.drawRectangle({
        width: width + 2,
        height: height,
        x: x - 1,
        y: y - height + 2,
        color: rgb(red / 255, green / 255, blue / 255),
    });
}

const renderCheckbox = (page: PDFPage, config: IPdfConfig, checked: boolean, name: string, x: number, y: number) => {
    page.drawSquare({
        size: CHECKBOX_SIZE,
        borderColor: BLACK,
        borderWidth: 1,
        x: x,
        y: y - CHECKBOX_SIZE
    });
    if (checked) {
        insertText("X", 'ParagraphBold', page, config, x + 2, y + 1);
    }
    insertText(name, 'Paragraph', page, config, x + CHECKBOX_SIZE + 5, y);
}

const renderPhoto = (page: PDFPage, config: IPdfConfig, photo: IInspectionDataSubSectionPhoto, x: number, y: number) => {
    insertImage(page,
        photo.uri,
        {
            x: x,
            y: y + PHOTO_HEIGHT_PADDING,
            width: PHOTO_WIDTH,
            height: PHOTO_HEIGHT,
        },
        config);

    page.drawRectangle({
        height: PHOTO_HEIGHT + (photo.comment && photo.comment.length > 0 ? PHOTO_HEIGHT_PADDING : 0),
        width: PHOTO_WIDTH + PHOTO_WIDTH_PADDING,
        borderColor: BLACK,
        borderWidth: 1,
        x: x - PHOTO_WIDTH_PADDING / 2,
        y: y + (photo.comment && photo.comment.length > 0 ? 0 : PHOTO_HEIGHT_PADDING)
    });

    if (photo.comment && photo.comment.length > 0) {
        const calculation = getWidthAndHeightOfText(photo.comment, 'Paragraph', PHOTO_BOX_WIDTH - 15, config);
        insertText(calculation.lines[0] + (calculation.lines.length > 1 ? "..." : ""), 'Paragraph', page, config, page.getX(), page.getY() + PHOTO_HEIGHT_PADDING - 5);
    }
}

const createSectionPages = (data: IInpsectionData, s: IInspectionDataSection, config: IPdfConfig) => {
    const firstPage = createSectionPage(data, s, config);
    let currentSectionXOffset = 0;
    const subsectionMaxWidth = firstPage.getWidth() - (BORDER_PADDING * 2);
    const lineHeight = 20;
    const minY = 30 + lineHeight;

    const getLastPage = () => config.pdfDoc.getPage(config.pdfDoc.getPageCount() - 1)

    const createNewPage = (subectionName: string) => {
        const newPage = createSectionPage(data, s, config);
        insertSubsectionHeader(subectionName + " cont.", newPage, config, BORDER_PADDING + 5, newPage.getY());
        newPage.moveTo(currentSectionXOffset, newPage.getY());

        return newPage;
    }

    const renderOption = (subsectionName: string, page: PDFPage, option: IInspectionDataSubSectionOption) => {
        let currentPage = page;
        let optionTitleWidth = SUBSECTION_PADDING;
        if (currentPage.getY() < minY) {
            currentPage = createNewPage(subsectionName);
        }
        if (option.name && option.name.length > 0) {
            const width = getWidthOfText(option.name, 'ParagraphBold', config);
            insertText(option.name, 'ParagraphBold', currentPage, config, BORDER_PADDING + 10, currentPage.getY());
            optionTitleWidth = width > SUBSECTION_PADDING ? width : SUBSECTION_PADDING;
        }
        currentSectionXOffset = BORDER_PADDING + 10 + optionTitleWidth + 10;
        currentPage.moveTo(currentSectionXOffset, currentPage.getY());
        option.values.sort((a, b) => a.order - b.order).forEach((v, i: number) => {
            if (currentPage.getY() < minY) {
                currentPage = createNewPage(subsectionName);
            }
            if (v.type === 0) {
                const theWidth = calculateCheckboxWidth(config, v.value);
                if (theWidth + currentPage.getX() > subsectionMaxWidth) {
                    currentPage.moveTo(currentSectionXOffset, currentPage.getY() - lineHeight);
                }
                if (currentPage.getY() < minY) {
                    currentPage = createNewPage(subsectionName);
                }
                if (v.isHighlighted) {
                    renderHighlight(currentPage, theWidth, lineHeight,
                        v.highlightColor, currentPage.getX(), currentPage.getY());
                }
                renderCheckbox(currentPage, config, v.checked, v.value, currentPage.getX(), currentPage.getY());
                currentPage.moveRight(calculateCheckboxWidth(config, v.value) + 2);
            } else if (v.value !== undefined && v.value.length > 0) {
                if (i > 0) {
                    currentPage.moveTo(currentSectionXOffset, currentPage.getY() - lineHeight);
                }
                const calculation = getWidthAndHeightOfText(v.value, 'Paragraph', subsectionMaxWidth - currentSectionXOffset, config);
                if (v.isHighlighted) {
                    renderHighlight(currentPage, calculation.width, calculation.height,
                        v.highlightColor, currentPage.getX(), currentPage.getY() - 4);
                }
                calculation.lines.forEach((l, i2) => {
                    if (currentPage.getY() < minY) {
                        currentPage = createNewPage(subsectionName);
                    }
                    if (v.isHighlighted && calculation.lines.length > 1) {
                        renderHighlight(currentPage, calculation.width, lineHeight,
                            v.highlightColor, currentPage.getX(), currentPage.getY() - 4);
                    }
                    insertText(l, 'Paragraph', currentPage, config, currentPage.getX(), currentPage.getY());
                    if (i2 < calculation.lines.length - 1) {
                        currentPage.moveTo(currentSectionXOffset, currentPage.getY() - lineHeight);
                    }
                });
            }
        });
        if (option.subOptions) {
            option.subOptions.forEach((v) => {
                const theWidth = calculateSuboptionsWidth(config, v.text, v.values);
                if (theWidth + currentPage.getX() > subsectionMaxWidth) {
                    currentPage.moveTo(currentSectionXOffset, currentPage.getY() - lineHeight);
                }
                if (currentPage.getY() < minY) {
                    currentPage = createSectionPage(data, s, config);
                    insertSubsectionHeader(subsectionName, currentPage, config, BORDER_PADDING + 5, currentPage.getY());
                    currentPage.moveTo(currentSectionXOffset, currentPage.getY());
                }
                if (v.isHighlighted) {
                    renderHighlight(currentPage, theWidth, lineHeight,
                        v.highlightColor, currentPage.getX(), currentPage.getY());
                }
                const textWidth = getWidthOfText(v.text + ":", 'Paragraph', config) + 5;
                insertText(v.text + ":", 'Paragraph', currentPage, config, currentPage.getX(), currentPage.getY());
                currentPage.moveRight(textWidth);
                v.values.forEach((v2) => {
                    const theWidth = calculateCheckboxWidth(config, v2.value);
                    if (theWidth + currentPage.getX() > subsectionMaxWidth) {
                        currentPage.moveTo(currentSectionXOffset, currentPage.getY() - lineHeight);
                    }
                    renderCheckbox(currentPage, config, v2.checked, v2.value, currentPage.getX(), currentPage.getY());
                    currentPage.moveRight(calculateCheckboxWidth(config, v2.value) + 2);
                });
            });
        }
        currentPage.moveDown(lineHeight);

        return currentPage;
    }

    const renderSubSection = (subsection: IInspectionDataSubSection) => {
        let page = getLastPage();
        if (page.getY() < minY) {
            page = createSectionPage(data, s, config);
        }
        if (subsection.name && subsection.name.length > 0) {
            insertSubsectionHeader(subsection.name, page, config, BORDER_PADDING + 5, page.getY());
        }
        subsection.options.sort((a, b) => a.order - b.order).forEach((o => {
            page = renderOption(subsection.name, page, o)
        }));

        if (subsection.photos && subsection.photos.length > 0) {
            const widthOfPhotoTitle = getWidthOfText("Photos", 'ParagraphBold', config);
            insertText("Photos", 'ParagraphBold', page, config, BORDER_PADDING + 10, page.getY());
            currentSectionXOffset = BORDER_PADDING + widthOfPhotoTitle + 40;
            page.moveTo(currentSectionXOffset, page.getY() - PHOTO_BOX_HEIGHT);

            // check width
            if (PHOTO_BOX_WIDTH + page.getX() > subsectionMaxWidth) {
                page.moveTo(currentSectionXOffset, page.getY() - PHOTO_BOX_HEIGHT);
            }
            // check height
            if (page.getY() < 20) {
                page = createSectionPage(data, s, config);
                page.moveTo(currentSectionXOffset, page.getY() - PHOTO_BOX_HEIGHT);
            }

            subsection.photos.forEach(p => {
                // check width
                if (PHOTO_BOX_WIDTH + page.getX() > subsectionMaxWidth) {
                    page.moveTo(currentSectionXOffset, page.getY() - PHOTO_BOX_HEIGHT - 5);
                }
                // check height
                if (page.getY() < 20) {
                    page = createSectionPage(data, s, config);
                    page.moveTo(currentSectionXOffset, page.getY() - PHOTO_BOX_HEIGHT);
                }
                renderPhoto(page, config, p, page.getX(), page.getY());
                page.moveRight(PHOTO_BOX_WIDTH + 10);
            });

            page.moveDown(10);
        }
    }

    (s.subsections as any[]).sort((a, b) => a.order - b.order).forEach((subsection: any, index: number) => {
        renderSubSection(subsection);
    });
}

export default createSectionPages;