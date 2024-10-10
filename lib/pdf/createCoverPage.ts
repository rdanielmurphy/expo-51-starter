import { IPdfConfig } from "./IPdfConfig"
import createEmptyPage, { PAGE_START } from "./createEmptyPage";
import { insertImage } from "./images";
import { insertCenteredText, PARAGRAPH_SIZE, SUBHEADING_SIZE } from "./text";
import { INNER_PADDING } from "./constants";
import { drawerDivider } from "./misc";
import { format } from 'date-fns'
import { enUS } from "date-fns/locale";
import { IInpsectionData } from "./IInspectionData";

const LOGO_HEIGHT = 125;
const COVER_HEIGHT = 150;

const createCoverPage = (data: IInpsectionData, config: IPdfConfig) => {
    const page = createEmptyPage(data, config, true);

    const logoY = page.getHeight() - (PAGE_START + INNER_PADDING) - LOGO_HEIGHT;
    insertImage(page,
        data.logo,
        {
            x: PAGE_START + INNER_PADDING,
            y: logoY,
            width: page.getWidth() - ((PAGE_START + INNER_PADDING) * 2),
            height: LOGO_HEIGHT,
        },
        config);

    const titlePos = insertCenteredText("Home Inspection Report", "Title", page, config, logoY);

    const coverX = (page.getWidth() / 2) - (page.getWidth() / 8);
    const coverY = titlePos.y - COVER_HEIGHT - 10;
    insertImage(page,
        data.cover,
        {
            x: coverX,
            y: coverY,
            width: page.getWidth() / 4,
            height: COVER_HEIGHT,
        },
        config);

    const a = data.address;
    const addressString = `${a.street1}${a.street2 ? ' ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.zipCode}`;
    const addressPos = insertCenteredText(addressString, "Paragraph", page, config, coverY);

    const dividerY = addressPos.y - 10;
    drawerDivider(dividerY, page);

    page.moveTo(0, dividerY - 25);

    const insertInfoLine = (heading: string, desc: string, desc2?: string, desc3?: string) => {
        insertCenteredText(heading, "Subheading", page, config);
        page.moveDown(SUBHEADING_SIZE);
        insertCenteredText(desc, "Paragraph", page, config);
        page.moveDown(PARAGRAPH_SIZE);
        if (desc2) {
            insertCenteredText(desc2, "Paragraph", page, config);
            page.moveDown(PARAGRAPH_SIZE);
        }
        if (desc3) {
            insertCenteredText(desc3, "Paragraph", page, config);
            page.moveDown(PARAGRAPH_SIZE);
        }
        page.moveDown(15);
    }

    insertInfoLine("Inspection Date:", format(new Date(data.date), "cccc MMMM dd, yyyy", { locale: enUS }));
    insertInfoLine("Prepared For:", data.preparedFor);
    insertInfoLine("Prepared By:", data.preparedByCompany, data.preparedByPhoneNumber, data.preparedByEmail);
    insertInfoLine("Report Number:", data.reportNumber);
    insertInfoLine("Inspector:", data.inspectorName);
    insertInfoLine("License/Certification #:", data.licenseCertification);

    const sigWidth = 200
    const sigHeight = 50
    const sigX = (page.getWidth() / 2) - (sigWidth / 2)
    const sigY = page.getY() - sigHeight - 10;
    insertCenteredText("Inspector Signature:", "Subheading", page, config);
    insertImage(page,
        data.signature,
        {
            x: sigX,
            y: sigY,
            width: sigWidth,
            height: sigHeight,
        },
        config);

    return page;
}

export default createCoverPage;