import { useCallback } from "react";
import { StandardPicker } from "./StandardPicker";

export enum SectionTag {
    None = "None",
    BasementType = "basementType",
    CrawlspaceType = "crawlspaceType",
    GarageType = "garages",
    Bathrooms = "bathrooms",
    Bedrooms = "bedrooms",
}

const sectionTagPrettyNames = new Map<SectionTag, string>([
    [SectionTag.None, "None"],
    [SectionTag.BasementType, "Basement"],
    [SectionTag.CrawlspaceType, "Crawlspace"],
    [SectionTag.GarageType, "Garage"],
    [SectionTag.Bathrooms, "Bathroom"],
    [SectionTag.Bedrooms, "Bedroom"],
]);

interface IProps {
    disabled?: boolean
    value?: SectionTag
    onChange: (value?: SectionTag) => void
}

const SectionTagDropdown = ({ disabled, value, onChange }: IProps) => {
    const sectionTags = [
        SectionTag.None,
        SectionTag.BasementType,
        SectionTag.CrawlspaceType,
        SectionTag.GarageType,
        SectionTag.Bathrooms,
        SectionTag.Bedrooms
    ].map((t) => ({ label: sectionTagPrettyNames.get(t) ?? "", value: t }));

    const handleChange = useCallback((value: string) => {
        if (value === "None") {
            onChange(undefined);
        } else {
            onChange(value as SectionTag);
        }
    }, [onChange]);

    return (
        <StandardPicker
            items={sectionTags}
            onValueChange={handleChange}
            label={"Tag"}
            value={value as string}
            disabled={disabled}
        />
    );
}

export default SectionTagDropdown;