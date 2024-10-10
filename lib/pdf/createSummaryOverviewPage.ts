import { IPdfConfig } from "./IPdfConfig"
import createEmptyPage, { BORDER_PADDING } from "./createEmptyPage";
import { getWidthAndHeightOfText, HEADING_SIZE, insertCenteredText, insertText, TITLE_SIZE } from "./text";
import { drawerDivider } from "./misc";
import { PDFPage } from "pdf-lib";
import { IInpsectionData } from "./IInspectionData";

const createAnotherPage = (title: string, data: IInpsectionData, config: IPdfConfig) => {
    const page = createEmptyPage(data, config);
    const titlePos = insertCenteredText(title + " cont.", "Title", page, config, page.getHeight() - 50);
    const titleY = titlePos.y - TITLE_SIZE - 5;
    page.moveTo(0, titleY);
    return page;
}

const createSummaryOverviewPage = (title: string, data: IInpsectionData, key: string, config: IPdfConfig) => {
    const page = createEmptyPage(data, config);

    const titlePos = insertCenteredText(title, "Title", page, config, page.getHeight() - 50);
    const titleY = titlePos.y - TITLE_SIZE - 5;
    const titleHeight = page.getHeight() - titleY;
    page.moveTo(0, titleY);

    const subsectionWidth = page.getWidth() - (BORDER_PADDING * 2);

    const renderSubSection = (currentPage: PDFPage, subsection: any, index: number) => {
        insertCenteredText(subsection.title, "Heading", currentPage, config);
        drawerDivider(currentPage.getY() - 10, currentPage);
        currentPage.moveDown(10);

        const calculation = getWidthAndHeightOfText(subsection.description, 'Paragraph', subsectionWidth, config);
        insertText(calculation.lines.join("\n"), 'Paragraph', currentPage, config, BORDER_PADDING + 10, currentPage.getY());
        currentPage.moveDown(HEADING_SIZE + calculation.height + 10);
    }

    const subsections = [];
    (data[key].subsections as any[]).forEach((subsection: any, index: number) => {
        const calculation = getWidthAndHeightOfText(subsection.description, 'Paragraph', subsectionWidth, config);
        subsections.push({
            subsection: subsection,
            height: calculation.height,
        })
    });

    // calulate how many pages we need
    const pageHeight = page.getHeight() - BORDER_PADDING - titleHeight;
    let yCount = 0;
    let currentPage = page;
    subsections.forEach((s, i) => {
        yCount += s.height + HEADING_SIZE + 20;
        if (yCount < pageHeight) {
            renderSubSection(currentPage, s.subsection, i);
        } else {
            yCount = 0;
            const newPage = createAnotherPage(title, data, config);
            currentPage = newPage;
            renderSubSection(newPage, s.subsection, i);
        }
    });

    return page;
}

export default createSummaryOverviewPage;