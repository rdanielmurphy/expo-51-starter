import { IPickerItem } from "../components/shared/StandardPicker"
import { IUserDefinedField } from "../hooks/useUserDefinedFields"

export const getUserDefinedFieldValues = (fields: IUserDefinedField[], fieldType: string): IPickerItem[] => {
    return fields.filter((i) => i["fieldType"] === fieldType).map((li) => ({
        "label": li.fieldLabel.toString(),
        "value": li.fieldValue.toString(),
    } as IPickerItem))
}