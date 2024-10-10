import { IPdfConfig } from "./IPdfConfig"
import createEmptyPage, { BORDER_PADDING } from "./createEmptyPage";
import { TEXT_TYPE, getWidthAndHeightOfText, getWidthOfText, insertCenteredText, insertText } from "./text";
import { drawerDivider } from "./misc";
import { format } from "date-fns";
import { IInpsectionData } from "./IInspectionData";
import statesMap from "./states";
import { insertImage } from "./images";
import { PDFPage } from "pdf-lib";
import { BLACK } from "./colors";

const MIN_X = BORDER_PADDING + 10;
const SIG_WIDTH = 150;
const SIG_HEIGHT = 30;
const CHECKBOX_SIZE = 15;

const createTitle = (text: string, page: any, config: IPdfConfig) => {
    const titlePos = insertCenteredText(text, "Heading", page, config, page.getHeight() - 30);
    page.moveTo(MIN_X, titlePos.y ?? 0);
    drawerDivider(page.getY() - 10, page);
}

const replaceVariables = (text: string, data: IInpsectionData) => {
    if (text.includes("<CLIENTNAME>")) {
        text = text.replace("<CLIENTNAME>", data.clientName ?? "-");
    }
    if (text.includes("<AGENTNAME>")) {
        text = text.replace("<AGENTNAME>", data.agentName ?? "-");
    }
    if (text.includes("<CURRENTDATE>")) {
        text = text.replace("<CURRENTDATE>", format(new Date(), "MMMM dd, yyyy"));
    }
    if (text.includes("<CLIENTS>")) {
        text = text.replace("<CLIENTS>", data.clients.join(", ") ?? "-");
    }
    if (text.includes("<REPORTNUMBER>")) {
        text = text.replace("<REPORTNUMBER>", data.reportNumber ?? "-");
    }
    if (text.includes("<INSPECTIONADDRESS>")) {
        const a = data.address;
        const addressString = a ? `${a.street1}${a.street2 ? ' ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.zipCode}` : '-';
        text = text.replace("<INSPECTIONADDRESS>", addressString);
    }
    if (text.includes("<FEES>")) {
        text = text.replace("<FEES>", data.invoice.total ?? "-");
    }
    if (text.includes("<LICENSE>")) {
        text = text.replace("<LICENSE>", data.licenseCertification ?? "-");
    }
    if (text.includes("<INSPSTATE>")) {
        text = text.replace("<INSPSTATE>", statesMap.get(data.address.state)?.name ?? "-");
    }
    if (text.includes("<EXCLUSIONS>")) {
        text = text.replace("<EXCLUSIONS>", data.exclusions ?? "-");
    }
    if (text.includes("<COMPANYNAME>")) {
        text = text.replace("<COMPANYNAME>", data.companyName ?? "-");
    }
    if (text.includes("<NOTVALIDIN>")) {
        text = text.replace("<NOTVALIDIN>", data.notvalidin ?? "-");
    }
    if (text.includes("<COMPANYSTREETADDRESS>")) {
        const a = data.address;
        const addressString = a ? `${a.street1}${a.street2 ? ' ' + a.street2 : ''}` : '-';
        text = text.replace("<COMPANYSTREETADDRESS>", addressString);
    }
    if (text.includes("<COMPANYCSZ>")) {
        const a = data.companyAddress;
        const addressString = a ? `${a.city}, ${a.state} ${a.zipCode}` : "-";
        text = text.replace("<COMPANYCSZ>", addressString);
    }

    const lines = text.split("\r\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length === 0) {
            lines[i] = "<br>";
        }
    }
    text = lines.join("\r\n");

    return text;
}

const replaceSignature = (page: PDFPage, text: string, tag: string, config: IPdfConfig, signature: string): {
    newXPos: number,
    newText: string
} => {
    let xPos = page.getX()
    const indexOf = text.indexOf(tag);
    const preSigText = text.substring(0, indexOf);
    insertText(preSigText, 'Paragraph', page, config, page.getX(), page.getY());
    const preSigTextWidth = getWidthOfText(preSigText, 'Paragraph', config);
    xPos = xPos + preSigTextWidth;

    insertImage(page,
        signature,
        {
            x: xPos,
            y: page.getY() - SIG_HEIGHT + 4,
            width: SIG_WIDTH,
            height: SIG_HEIGHT,
        },
        config);
    text = text.substring(indexOf, text.length).replace(tag, "");
    xPos = xPos + SIG_WIDTH;

    return {
        newXPos: xPos,
        newText: text
    }
}

const addCheckbox = (id: number, checked: boolean, page: PDFPage, text: string, tag: string, config: IPdfConfig): {
    newXPos: number,
    newText: string
} => {
    let xPos = page.getX();
    let yPos = page.getY();

    const indexOf = text.indexOf(tag);
    const preCBText = text.substring(0, indexOf);
    insertText(preCBText, 'Paragraph', page, config, xPos, yPos);
    const preCBTextWidth = getWidthOfText(preCBText, 'Paragraph', config);
    xPos = xPos + preCBTextWidth;

    const form = config.pdfDoc.getForm();
    const checkBox = form.createCheckBox(`checkbox.${id}`);
    checkBox.addToPage(page, {
        x: xPos + 5,
        y: yPos - (CHECKBOX_SIZE),
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        textColor: BLACK,
        backgroundColor: config.checkboxBackgroundColor,
        borderColor: config.checkboxBorderColor,
        borderWidth: config.checkboxBorderWidth,
    });
    checkBox.enableReadOnly();
    if (checked) {
        checkBox.check();
    }

    text = text.substring(indexOf, text.length).replace(tag, "");
    xPos = xPos + CHECKBOX_SIZE + 5;

    return {
        newXPos: xPos,
        newText: text
    }
}

const createPreInspectionAgreement = (data: IInpsectionData, config: IPdfConfig) => {
    let currentPage = createEmptyPage(data, config, true);
    currentPage.moveTo(MIN_X, currentPage.getHeight() - 30);
    const lineHeight = 20;
    const minY = 30 + lineHeight;
    const maxWidth = currentPage.getWidth() - (BORDER_PADDING * 2.5);
    let checkboxCounter = 0;

    const pages = data.preInspectorAgreement.split("<PAGEBREAK>");
    for (let i = 0; i < pages.length; i++) {
        const p = replaceVariables(pages[i], data);
        const calculation = getWidthAndHeightOfText(p, 'Paragraph', maxWidth, config);
        calculation.lines.forEach((l, i2) => {
            if (currentPage.getY() < minY) {
                currentPage = createEmptyPage(data, config, true);
                currentPage.moveTo(MIN_X, currentPage.getHeight() - 30);
            }

            if (l === "<br>") {
                l = l.replace("<br>", " ");
            } else {
                l = l.replace("<br>", "");
            }

            let xPos = currentPage.getX()
            let hasSignature = false;

            // title
            if (l.includes("<TITLE>")) {
                const titleTag = l.match(/<TITLE>(.*?)<\/TITLE>/);
                const titleTagText = titleTag ? titleTag[1] : "";

                createTitle(titleTagText, currentPage, config);
                l = l.replace(/<TITLE>(.*?)<\/TITLE>/, "");
            }

            // signatures
            if (l.includes("<SIGNATURE>")) {
                hasSignature = true
                const res = replaceSignature(currentPage, l, "<SIGNATURE>", config, data.signature);
                l = res.newText;
                xPos = res.newXPos;
            }
            if (l.includes("<CLIENTSIGNATURES>")) {
                hasSignature = true
                for (let i = 0; i < data.clientSignatures.length; i++) {
                    const sig = data.clientSignatures[i];
                    const res = replaceSignature(currentPage, l, "<CLIENTSIGNATURES>", config, sig);
                    currentPage.moveRight(res.newXPos);
                    l = res.newText;
                    xPos = res.newXPos;
                }
            }

            // checkboxes
            if (l.includes("<BPY>")) {
                const res = addCheckbox(checkboxCounter++, data.BPY, currentPage, l, "<BPY>", config);
                l = res.newText;
                xPos = res.newXPos;
                currentPage.moveTo(xPos, currentPage.getY());
            }
            if (l.includes("<BPN>")) {
                const res = addCheckbox(checkboxCounter++, data.BPN, currentPage, l, "<BPN>", config);
                l = res.newText;
                xPos = res.newXPos;
                currentPage.moveTo(xPos, currentPage.getY());
            }
            if (l.includes("<APY>")) {
                const res = addCheckbox(checkboxCounter++, data.APY, currentPage, l, "<APY>", config);
                l = res.newText;
                xPos = res.newXPos;
                currentPage.moveTo(xPos, currentPage.getY());
            }
            if (l.includes("<APN>")) {
                const res = addCheckbox(checkboxCounter++, data.APN, currentPage, l, "<APN>", config);
                l = res.newText;
                xPos = res.newXPos;
                currentPage.moveTo(xPos, currentPage.getY());
            }

            insertText(l, 'Paragraph', currentPage, config, xPos, currentPage.getY());
            if (i2 < calculation.lines.length - 1) {
                currentPage.moveTo(MIN_X, currentPage.getY() - (hasSignature ? SIG_HEIGHT - 6 : lineHeight));
            }
        });
        if (i < pages.length - 1) {
            currentPage = createEmptyPage(data, config, true);
            currentPage.moveTo(MIN_X, currentPage.getHeight() - 30);
        }
    }
}

export default createPreInspectionAgreement;