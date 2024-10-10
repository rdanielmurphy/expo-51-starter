import { PDFPage } from "pdf-lib"
import { BLACK } from "./colors"
import { INNER_PADDING } from "./constants"
import { PAGE_START } from "./createEmptyPage"

export const drawerDivider = (y: number, page: PDFPage) => {
    page.drawLine({
        start: { x: PAGE_START + INNER_PADDING, y: y },
        end: { x: page.getWidth() - PAGE_START - INNER_PADDING, y: y },
        thickness: 2,
        color: BLACK,
        opacity: 0.75,
    })
}