import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ProgressBar, Text, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
    SQL_DELETE_OPTION_BY_SECTION_ID,
    SQL_DELETE_SECTION_BY_SECTION_ID,
    SQL_DELETE_SUBSECTION_BY_SECTION_ID,
    SQL_DELETE_VALUE_BY_SECTION_ID,
    SQL_DELETE_VALUE_OPTION_BY_SECTION_ID,
    SQL_GET_PROPERTY_BY_INSPECTION_ID,
    SQL_GET_SECTIONS,
    SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG,
    SQL_GET_SECTION_COUNT_BY_TAG,
    SQL_UPDATE_PROPERTY_NUMBER_FIELD,
    SQL_UPDATE_PROPERTY_STRING_FIELD
} from '../../../lib/sqlCommands';
import { InspectionState } from '../../../redux/reducers/inspection';
import { useCallback, useEffect } from 'react';
import { IPickerItem, StandardPicker } from '../../shared/StandardPicker';
import { getUserDefinedFieldValues } from '../../../lib/userDefinedFieldsHelper';
import { useUserDefinedFields } from '../../../hooks/useUserDefinedFields';
import CurrencyInput from 'react-native-currency-input';
import OnOffToggle from '../../shared/OnOffToggle';
import { useDbContext } from '../../../contexts/DbContext';
import { ConfirmDialog, ProgressDialog } from 'react-native-simple-dialogs';
import { SectionTag } from '../../shared/SectionTagDropdown';
import { RemoveSectionsModal } from './components/RemoveSectionsModal';
import { updateTemplateInspection } from '../../../redux/actions';
import LoadingText from '../../shared/ProgressText';
import { BasementType, CrawlspaceType, GarageType } from '../../../lib/types';
import { useSections } from '../../../hooks/useSections';

const PropertyDetailsTab = (a: any) => {
    const { colors } = useTheme();
    const { ready, execAsync, getFirstAsync, getAllAsync } = useDbContext();
    const { addSection } = useSections();
    const dispatch = useDispatch();
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    // items
    const [basementList, setBasementList] = React.useState<IPickerItem[]>();
    const [bathroomList, setBathroomList] = React.useState<IPickerItem[]>();
    const [bedroomList, setBedroomList] = React.useState<IPickerItem[]>();
    const [crawlSpaceList, setCrawlSpaceList] = React.useState<IPickerItem[]>();
    const [garageTypeList, setGarageTypeList] = React.useState<IPickerItem[]>();
    const [propertyTypeList, setPropertyTypeList] = React.useState<IPickerItem[]>();
    const [propertyStyleList, setPropertyStyleList] = React.useState<IPickerItem[]>();
    const [fireplaceList, setFireplaceList] = React.useState<IPickerItem[]>();
    const [slabGradeList, setSlabGradeList] = React.useState<IPickerItem[]>();
    const [furnaceList, setFurnaceList] = React.useState<IPickerItem[]>();
    const [furnaceFuelList, setFurnaceFuelList] = React.useState<IPickerItem[]>();
    const [acUnitList, setAcUnitList] = React.useState<IPickerItem[]>();
    const [waterHeaterList, setWaterHeaterList] = React.useState<IPickerItem[]>();
    const [waterHeaterFuelList, setWaterHeaterFuelList] = React.useState<IPickerItem[]>();
    const [garageList, setGarageList] = React.useState<IPickerItem[]>();

    // data
    const [bathroom, setBathroom] = React.useState<string>();
    const [addlRoom, setAddlRoom] = React.useState<string>();
    const [basement, setBasement] = React.useState<string>();
    const [crawlSpace, setCrawlSpace] = React.useState<string>();
    const [garageType, setGarageType] = React.useState<string>();
    const [type, setType] = React.useState<string>();
    const [style, setStyle] = React.useState<string>();
    const [fireplaces, setFireplaces] = React.useState<number>();
    const [slabGrade, setSlabGrade] = React.useState<string>();
    const [furnaces, setFurnaces] = React.useState<number>();
    const [furnaceFuel, setFurnaceFuel] = React.useState<string>();
    const [acUnits, setAcUnits] = React.useState<number>();
    const [waterHeaters, setWaterHeaters] = React.useState<number>();
    const [waterHeaterFuel, setWaterHeaterFuel] = React.useState<string>();
    const [garage, setGarage] = React.useState<string>();
    const [size, setSize] = React.useState<number>();
    const [price, setPrice] = React.useState<number>();
    const [year, setYear] = React.useState<number>();
    const [age, setAge] = React.useState<number>();
    const [utilOn, setUtilOn] = React.useState<boolean>(false);
    const [notes, setNotes] = React.useState<string>("");

    const [propertyId, setPropertyId] = React.useState<number>();
    const [loadingData, setLoadingData] = React.useState<boolean>(true);
    const [loadingUI, setLoadingUI] = React.useState<boolean>(true);
    const [saving, setSaving] = React.useState<boolean>(false);
    const [deleting, setDeleting] = React.useState<boolean>(false);

    const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = React.useState<string>("");
    const [dialogTitle, setDialogTitle] = React.useState<string>("");
    const [dialogTag, setDialogTag] = React.useState<SectionTag>();
    const [dialogType, setDialogType] = React.useState<"add" | "remove">();
    const [amountToChange, setAmountToChange] = React.useState<number>(0);
    const [tagCount, setTagCount] = React.useState<number | undefined>(0);
    const [removeDialogVisable, setRemoveDialogVisable] = React.useState<boolean>(false);
    const [templateHasBasement, setTemplateHasBasement] = React.useState<boolean>(false);
    const [templateHasCrawlspace, setTemplateHasCrawlspace] = React.useState<boolean>(false);
    const [templateHasGarage, setTemplateHasGarage] = React.useState<boolean>(false);
    const [templateHasBathrooms, setTemplateHasBathrooms] = React.useState<boolean>(false);
    const [templateHasBedrooms, setTemplateHasBedrooms] = React.useState<boolean>(false);
    const [refreshSectionDataCounter, setRefreshSectionDataCounter] = React.useState<number>(0);

    const ref = React.useRef(null);

    useEffect(() => {
        const getInspection = async () => {
            try {
                const thePropertyObject = await getFirstAsync(SQL_GET_PROPERTY_BY_INSPECTION_ID(inspectionState.id!));
                setPropertyId(thePropertyObject.id);
                setBathroom(thePropertyObject.bathrooms);
                setAddlRoom(thePropertyObject.bedrooms);
                setBasement(thePropertyObject.basementType);
                setCrawlSpace(thePropertyObject.crawlspaceType);
                setGarageType(thePropertyObject.garageType);
                setFireplaces(thePropertyObject.fireplaces);
                setSlabGrade(thePropertyObject.slabOnGrade);
                setFurnaces(thePropertyObject.furnaces);
                setFurnaceFuel(thePropertyObject.furnaceFuel);
                setAcUnits(thePropertyObject.acUnit);
                setWaterHeaters(thePropertyObject.waterHeaters);
                setWaterHeaterFuel(thePropertyObject.waterHeaterFuel);
                setGarage(thePropertyObject.garages);
                setSize(thePropertyObject.squareFeet);
                setPrice(thePropertyObject.purchasePrice);
                setStyle(thePropertyObject.style);
                setType(thePropertyObject.type);
                setYear(thePropertyObject.yearBuilt);
                setAge(thePropertyObject.age);
                setUtilOn(thePropertyObject.utilitiesOn === 1);
                setNotes(thePropertyObject.notes);
            } catch (e) {
                console.error('fail', e)
            }
        }

        getInspection();
    }, [ready, inspectionState.id, getFirstAsync]);

    useEffect(() => {
        const getData = async () => {
            try {
                const masterSectionsRes = await getAllAsync(SQL_GET_SECTIONS(inspectionState.master_script_id!));
                masterSectionsRes.forEach((s) => {
                    if (s.tag === SectionTag.BasementType) {
                        setTemplateHasBasement(true);
                    } else if (s.tag === SectionTag.CrawlspaceType) {
                        setTemplateHasCrawlspace(true);
                    } else if (s.tag === SectionTag.GarageType) {
                        setTemplateHasGarage(true);
                    } else if (s.tag === SectionTag.Bathrooms) {
                        setTemplateHasBathrooms(true);
                    } else if (s.tag === SectionTag.Bedrooms) {
                        setTemplateHasBedrooms(true);
                    }
                });

                setLoadingData(false);
            } catch (e) {
                console.error('fail', e)
            }
        }
        getData();
    }, [refreshSectionDataCounter, getAllAsync, inspectionState.master_script_id]);

    useEffect(() => {
        if (loadedUserDefinedFields && userDefinedFields) {
            const basements = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBasement");
            const bathrooms = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBathrooms");
            const bedrooms = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBedrooms");
            const crawls = getUserDefinedFieldValues(userDefinedFields.items, "PropertyCrawl");
            const garageTypes = getUserDefinedFieldValues(userDefinedFields.items, "PropertyGarageType");
            const propTypes = getUserDefinedFieldValues(userDefinedFields.items, "PropertyType");
            const propStyles = getUserDefinedFieldValues(userDefinedFields.items, "PropertyStyle");
            const fireplaces = getUserDefinedFieldValues(userDefinedFields.items, "PropertyFireplaces");
            const slabGrades = getUserDefinedFieldValues(userDefinedFields.items, "PropertySlab");
            const furnaces = getUserDefinedFieldValues(userDefinedFields.items, "PropertyFurnaces");
            const furnaceFuels = getUserDefinedFieldValues(userDefinedFields.items, "PropertyFurnaceFuel");
            const acUnits = getUserDefinedFieldValues(userDefinedFields.items, "PropertyAC");
            const waterHeaters = getUserDefinedFieldValues(userDefinedFields.items, "PropertyWaterHeater");
            const waterHeaterFuels = getUserDefinedFieldValues(userDefinedFields.items, "PropertyWaterHeaterFuel");
            const garages = getUserDefinedFieldValues(userDefinedFields.items, "PropertyGarages");

            setBasementList(basements);
            setBathroomList(bathrooms);
            setBedroomList(bedrooms);
            setCrawlSpaceList(crawls);
            setGarageTypeList(garageTypes);
            setPropertyTypeList(propTypes);
            setPropertyStyleList(propStyles);
            setFireplaceList(fireplaces);
            setSlabGradeList(slabGrades);
            setFurnaceList(furnaces);
            setFurnaceFuelList(furnaceFuels);
            setAcUnitList(acUnits);
            setWaterHeaterList(waterHeaters);
            setWaterHeaterFuelList(waterHeaterFuels);
            setGarageList(garages);

            setLoadingUI(false);
        }
    }, [loadedUserDefinedFields, userDefinedFields, inspectionState.id]);

    const onTextFieldChange = useCallback(
        (field: string, value: string) => {
            execAsync(SQL_UPDATE_PROPERTY_STRING_FIELD(field, value, propertyId!));
        }, [execAsync, propertyId]
    );

    const onNumberFieldChange = useCallback(
        (field: string, value: number) => {
            execAsync(SQL_UPDATE_PROPERTY_NUMBER_FIELD(field, value, propertyId!));
        }, [execAsync, propertyId]
    );

    const onUtilToggle = useCallback(
        (value: boolean) => {
            setUtilOn(value);
            execAsync(SQL_UPDATE_PROPERTY_NUMBER_FIELD('utilitiesOn', value ? 1 : 0, propertyId!));
        }, [execAsync, propertyId]
    );

    const onBathroomChange = useCallback(async (t: string) => {
        const newNumber = parseInt(t, 10);
        onTextFieldChange("bathrooms", t);
        setBathroom(t);

        if (templateHasBathrooms) {
            const countRes = await getFirstAsync(SQL_GET_SECTION_COUNT_BY_TAG(inspectionState.script_id!, SectionTag.Bathrooms));
            const count = countRes.count;
            const difference = newNumber - count;
            if (difference !== 0) {
                if (difference > 0) {
                    setDialogType("add");
                    setDialogTitle("Add Bathrooms Section(s)?");
                    setDialogMessage(`You have specified that the property has ${t} bathroom(s). Would you like to add ${difference} bathroom section(s) to the inspection?`);
                } else if (difference < 0) {
                    setDialogType("remove");
                    setDialogTitle("Remove Bathrooms Section(s)?");
                    setDialogMessage(`You have specified that the property has ${t} bathrooms. Would you like to remove ${Math.abs(difference)} bathroom section(s) from the inspection?`);
                }
                setTagCount(count as number);
                setAmountToChange(difference);
                setDialogTag(SectionTag.Bathrooms);
                setDialogVisible(true);
            }
        }
    }, [onTextFieldChange, templateHasBathrooms, dialogTag, getFirstAsync, inspectionState.script_id, refreshSectionDataCounter]);

    const onRoomChange = useCallback(async (t: string) => {
        const newNumber = parseInt(t, 10);
        onNumberFieldChange("bedrooms", newNumber);
        setAddlRoom(t);

        if (templateHasBedrooms) {
            const countRes = await getFirstAsync(SQL_GET_SECTION_COUNT_BY_TAG(inspectionState.script_id!, SectionTag.Bedrooms));
            const count = countRes.count;
            const difference = newNumber - count;
            if (difference !== 0) {
                if (difference > 0) {
                    setDialogType("add");
                    setDialogTitle("Add Bedrooms Section(s)?");
                    setDialogMessage(`You have specified that the property has ${t} bedroom(s). Would you like to add ${difference} bathroom section(s) to the inspection?`);
                } else if (difference < 0) {
                    setDialogType("remove");
                    setDialogTitle("Remove Bedrooms Section(s)?");
                    setDialogMessage(`You have specified that the property has ${t} bedroom. Would you like to remove ${Math.abs(difference)} bathroom section(s) from the inspection?`);
                }
                setTagCount(count as number);
                setAmountToChange(difference);
                setDialogTag(SectionTag.Bedrooms);
                setDialogVisible(true);
            }
        }
    }, [onNumberFieldChange, templateHasBedrooms, dialogTag, getFirstAsync, inspectionState.script_id, refreshSectionDataCounter]);

    const onBasementChange = useCallback(async (t: string) => {
        onTextFieldChange("basementType", t);
        setBasement(t);

        const newNumber = (t === BasementType.Full || t === BasementType.Partial) ? 1 : 0;

        if (templateHasBasement) {
            const countRes = await getFirstAsync(SQL_GET_SECTION_COUNT_BY_TAG(inspectionState.script_id!, SectionTag.BasementType));
            const count = countRes.count;
            const difference = newNumber - count;
            if (difference !== 0) {
                if (difference > 0) {
                    setDialogType("add");
                    setDialogTitle("Add Basement Section?");
                    setDialogMessage(`You have specified that the property has a basement. Would you like to add the basement to the inspection?`);
                } else if (difference < 0) {
                    setDialogType("remove");
                    setDialogTitle("Remove Basement Section?");
                    setDialogMessage(`You have specified that the property does not have a basement. Would you like to remove the basement section from the inspection?`);
                }
                setTagCount(undefined);
                setAmountToChange(difference > 0 ? 1 : -1);
                setDialogTag(SectionTag.BasementType);
                setDialogVisible(true);
            }
        }
    }, [onTextFieldChange, templateHasBasement, dialogTag, getFirstAsync, inspectionState.script_id, refreshSectionDataCounter]);

    const onCrawlspaceChange = useCallback(async (t: string) => {
        onTextFieldChange("crawlspaceType", t);
        setCrawlSpace(t);

        if (templateHasCrawlspace) {
            const newNumber = (t === CrawlspaceType.Full || t === CrawlspaceType.Partial) ? 1 : 0;
            const countRes = await getFirstAsync(SQL_GET_SECTION_COUNT_BY_TAG(inspectionState.script_id!, SectionTag.CrawlspaceType));
            const count = countRes.count;
            const difference = newNumber - count;
            if (difference !== 0) {
                if (difference > 0) {
                    setDialogType("add");
                    setDialogTitle("Add Crawlspace Section?");
                    setDialogMessage(`You have specified that the property has a crawlspace. Would you like to add the crawlspace to the inspection?`);
                } else if (difference < 0) {
                    setDialogType("remove");
                    setDialogTitle("Remove Crawlspace Section?");
                    setDialogMessage(`You have specified that the property does not have a crawlspace. Would you like to remove the crawlspace section from the inspection?`);
                }
                setTagCount(undefined);
                setAmountToChange(difference > 0 ? 1 : -1);
                setDialogTag(SectionTag.CrawlspaceType);
                setDialogVisible(true);
            }
        }
    }, [onTextFieldChange, templateHasCrawlspace, dialogTag, getFirstAsync, inspectionState.script_id, refreshSectionDataCounter]);

    const onGarageTypeChange = useCallback(async (t: string) => {
        onTextFieldChange("garageType", t);
        setGarageType(t);

        if (templateHasGarage) {
            const newNumber = (t === GarageType.Attached || t === GarageType.Carport || t === GarageType.Detached) ? 1 : 0;
            const countRes = await getFirstAsync(SQL_GET_SECTION_COUNT_BY_TAG(inspectionState.script_id!, SectionTag.GarageType));
            const count = countRes.count;
            const difference = newNumber - count;
            if (difference !== 0) {
                if (difference > 0) {
                    setDialogType("add");
                    setDialogTitle("Add Garage Section?");
                    setDialogMessage(`You have specified that the property has a garage. Would you like to add the garage to the inspection?`);
                } else if (difference < 0) {
                    setDialogType("remove");
                    setDialogTitle("Remove Garage Section?");
                    setDialogMessage(`You have specified that the property does not have a garage. Would you like to remove the garage section from the inspection?`);
                }
                setTagCount(undefined);
                setAmountToChange(difference > 0 ? 1 : -1);
                setDialogTag(SectionTag.GarageType);
                setDialogVisible(true);
            }
        }
    }, [onTextFieldChange, templateHasGarage, dialogTag, getFirstAsync, inspectionState.script_id, refreshSectionDataCounter]);

    const closeConfirmDialog = useCallback(() => {
        setDialogVisible(false);
    }, []);

    // useEffect(() => {
    //     if (!loadingUI && ref.current) {
    //         console.log('scrolling to top');
    //         ref.current.scrollTo({ x: 0, y: 0, animated: true });
    //     }
    // }, [loadingUI, ref]);

    const addSections = useCallback(async () => {
        setSaving(true);

        try {
            if (dialogTag) {
                const masterSection = await getFirstAsync(SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG(inspectionState.master_script_id!, dialogTag.toString()));
                for (let i = 0; i < amountToChange; i++) {
                    const theSection = masterSection;
                    const newSection = {
                        ...theSection,
                        name: `${theSection.name}${tagCount ? (' ' + (tagCount + i + 1)) : ''}`,
                    };
                    await addSection(inspectionState.script_id!, newSection);
                }
                setRefreshSectionDataCounter(refreshSectionDataCounter + 1);
                updateTemplateInspection({
                    templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
                })(dispatch);
            }
        } catch (e) {
            console.error('fail', e)
        } finally {
            setSaving(false);
            closeConfirmDialog();
        }
    }, [dispatch, dialogTag, amountToChange, tagCount, inspectionState.templateRefreshCounter, refreshSectionDataCounter, closeConfirmDialog, getFirstAsync]);

    const removeSections = useCallback(async (sectionIds: number[]) => {
        try {
            setDeleting(true);
            if (sectionIds && sectionIds.length > 0) {
                for (let i = 0; i < sectionIds.length; i++) {
                    const sectionId = sectionIds[i];
                    await execAsync(SQL_DELETE_VALUE_OPTION_BY_SECTION_ID(sectionId));
                    await execAsync(SQL_DELETE_VALUE_BY_SECTION_ID(sectionId));
                    await execAsync(SQL_DELETE_OPTION_BY_SECTION_ID(sectionId));
                    await execAsync(SQL_DELETE_SUBSECTION_BY_SECTION_ID(sectionId));
                    await execAsync(SQL_DELETE_SECTION_BY_SECTION_ID(sectionId));
                }
            }
            setRefreshSectionDataCounter(refreshSectionDataCounter + 1);
            updateTemplateInspection({
                templateRefreshCounter: inspectionState.templateRefreshCounter ? inspectionState.templateRefreshCounter + 1 : 1,
            })(dispatch);
        } catch (e) {
            console.error('fail', e)
        } finally {
            setDeleting(false);
            setRemoveDialogVisable(false);
            closeConfirmDialog();
        }
    }, [refreshSectionDataCounter, inspectionState.templateRefreshCounter, closeConfirmDialog, dispatch, execAsync]);

    const removeSectionByTag = useCallback(async (tag: SectionTag) => {
        try {
            setDeleting(true);
            const sectionRes = await getFirstAsync(SQL_GET_SECTION_BY_SCRIPT_ID_AND_TAG(inspectionState.script_id!, tag));
            await removeSections([sectionRes.id]);
        } catch (e) {
            console.error('fail', e);
        } finally {
            setDeleting(false);
            setRemoveDialogVisable(false);
            closeConfirmDialog();
        }
    }, [dialogTag, closeConfirmDialog, removeSections]);

    const closeRemovalDialog = useCallback(() => {
        setRemoveDialogVisable(false);
    }, []);

    const handleRemovalDialogSubmit = useCallback((sectionIds: number[]) => {
        removeSections(sectionIds);
        setRemoveDialogVisable(false);
    }, [removeSections]);

    const confirmSectionChange = useCallback(() => {
        if (amountToChange >= -1) {
            if (dialogType === "add") {
                addSections();
            } else if (dialogType === "remove" && dialogTag) {
                removeSectionByTag(dialogTag);
            }
        } else {
            // removing more than 1 section
            closeConfirmDialog();
            setRemoveDialogVisable(true);
        }
    }, [amountToChange, dialogType, dialogTag, addSections, removeSections, removeSectionByTag]);

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background, paddingLeft: 8, paddingRight: 8 }}>
            {(
                <ScrollView style={styles.scrollView} ref={ref}>
                    {(loadingUI || loadingData || saving) ? (
                        <View style={{ flex: 1, padding: 8 }}><ProgressBar indeterminate={true} /></View>
                    ) : (
                        <View>
                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={propertyTypeList || []}
                                    onValueChange={(t) => {
                                        onTextFieldChange("type", t);
                                        setType(t);
                                    }}
                                    label={"Type"}
                                    value={type}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={propertyStyleList || []}
                                    onValueChange={(t) => {
                                        onTextFieldChange("style", t);
                                        setStyle(t);
                                    }}
                                    label={"Style"}
                                    value={style}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <CurrencyInput
                                    renderTextInput={textInputProps =>
                                        <TextInput
                                            {...textInputProps}
                                            label={"Size (sq ft)"}
                                            selectionColor={undefined}
                                        />}
                                    prefix=""
                                    delimiter=","
                                    separator="."
                                    precision={0}
                                    minValue={0}
                                    value={size || null}
                                    onChangeValue={(num: number) => {
                                        onNumberFieldChange("squareFeet", num);
                                        setSize(num);
                                    }} />
                            </View>

                            <View style={styles.formComponent}>
                                <CurrencyInput
                                    renderTextInput={textInputProps =>
                                        <TextInput
                                            {...textInputProps}
                                            label={"Sale Price ($)"}
                                            selectionColor={undefined}
                                        />}
                                    prefix="$"
                                    delimiter=","
                                    separator="."
                                    precision={0}
                                    minValue={0}
                                    value={price || null}
                                    onChangeValue={(num: number) => {
                                        onNumberFieldChange("purchasePrice", num);
                                        setPrice(num);
                                    }} />
                            </View>

                            <View style={styles.formComponent}>
                                <TextInput
                                    label={"Year built"}
                                    keyboardType="numeric"
                                    value={year && year !== -1 ? year.toString() : ""}
                                    maxLength={4}
                                    onChangeText={(text: string) => {
                                        const currentYear = new Date().getFullYear();
                                        const number = parseInt(text, 10);
                                        if (number > 0 && number < currentYear) {
                                            onNumberFieldChange("yearBuilt", number);
                                            onNumberFieldChange("age", currentYear - number);
                                            setYear(number);
                                            setAge(currentYear - number);
                                        } else {
                                            setYear(-1);
                                            setAge(-1);
                                        }
                                    }} />
                            </View>

                            <View style={styles.formComponent}>
                                <View style={{ flex: 1, alignSelf: "flex-start", paddingLeft: 6 }}>
                                    <Text>Age: {age && age >= 0 ? `${age} year(s)` : ''}</Text>
                                </View>
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={bathroomList || []}
                                    onValueChange={onBathroomChange}
                                    label={"Bathroom(s)"}
                                    value={bathroom?.toString()}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={bedroomList || []}
                                    onValueChange={onRoomChange}
                                    label={"Add'l Room(s)"}
                                    value={addlRoom?.toString()}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={fireplaceList || []}
                                    onValueChange={(t: any) => {
                                        onNumberFieldChange("fireplaces", t);
                                        setFireplaces(t);
                                    }}
                                    label={"Fireplace(s)"}
                                    value={fireplaces}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={basementList || []}
                                    onValueChange={onBasementChange}
                                    label={"Basement"}
                                    value={basement}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={crawlSpaceList || []}
                                    onValueChange={onCrawlspaceChange}
                                    label={"Crawl Space"}
                                    value={crawlSpace}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={slabGradeList || []}
                                    onValueChange={(t: any) => {
                                        onTextFieldChange("slabOnGrade", t);
                                        setSlabGrade(t);
                                    }}
                                    label={"Slab on Grade"}
                                    value={slabGrade}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={furnaceList || []}
                                    onValueChange={(t: any) => {
                                        onNumberFieldChange("furnaces", t);
                                        setFurnaces(t);
                                    }}
                                    label={"Furnace(s)"}
                                    value={furnaces}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={furnaceFuelList || []}
                                    onValueChange={(t: any) => {
                                        onTextFieldChange("furnaceFuel", t);
                                        setFurnaceFuel(t);
                                    }}
                                    label={"Furnace Fuel"}
                                    value={furnaceFuel}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={acUnitList || []}
                                    onValueChange={(t: any) => {
                                        onNumberFieldChange("acUnits", t);
                                        setAcUnits(t);
                                    }}
                                    label={"A/C Unit(s)"}
                                    value={acUnits}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={waterHeaterList || []}
                                    onValueChange={(t: any) => {
                                        onNumberFieldChange("waterHeaters", t);
                                        setWaterHeaters(t);
                                    }}
                                    label={"Water Heater(s)"}
                                    value={waterHeaters}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={waterHeaterFuelList || []}
                                    onValueChange={(t: any) => {
                                        onTextFieldChange("waterHeaterFuel", t);
                                        setWaterHeaterFuel(t);
                                    }}
                                    label={"Water Heater Fuel"}
                                    value={waterHeaterFuel}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={garageList || []}
                                    onValueChange={(t: any) => {
                                        onTextFieldChange("garages", t);
                                        setGarage(t);
                                    }}
                                    label={"Garage"}
                                    value={garage}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <StandardPicker
                                    items={garageTypeList || []}
                                    onValueChange={onGarageTypeChange}
                                    label={"Garage Type"}
                                    value={garageType}
                                />
                            </View>

                            <View style={styles.formComponent}>
                                <View style={{ backgroundColor: 'white', flexDirection: "row", paddingVertical: 5, paddingHorizontal: 5, }}>
                                    <View style={{ flex: 1, alignSelf: "center" }}>
                                        <Text>Utilities</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <OnOffToggle
                                            value={utilOn}
                                            onToggle={onUtilToggle} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formComponent}>
                                <Text>Notes:</Text>
                                <TextInput
                                    numberOfLines={15}
                                    autoFocus
                                    defaultValue={notes}
                                    onChangeText={(s: string) => {
                                        onTextFieldChange("notes", s);
                                        setNotes(s);
                                    }}
                                    selectionColor={"#fff"}
                                    cursorColor={"#000"}
                                    multiline
                                />
                            </View>

                            <ConfirmDialog
                                title={dialogTitle}
                                message={dialogMessage}
                                visible={dialogVisible}
                                onTouchOutside={closeConfirmDialog}
                                positiveButton={{
                                    title: "YES",
                                    onPress: confirmSectionChange
                                }}
                                negativeButton={{
                                    title: "NO",
                                    onPress: closeConfirmDialog
                                }}
                            />

                            <RemoveSectionsModal
                                amount={amountToChange}
                                show={removeDialogVisable}
                                tag={dialogTag ? dialogTag.toString() : "None"}
                                onCancel={closeRemovalDialog}
                                onDone={handleRemovalDialogSubmit}
                            />

                        </View>
                    )}
                    <ProgressDialog
                        visible={saving || deleting}
                        message={<LoadingText>{deleting ? "Deleting sections" : "Creating sections"}</LoadingText>}
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        marginHorizontal: 0,
        marginBottom: 16,
        height: '100%',
    },
    formComponent: {
        paddingTop: 5,
        paddingBottom: 5,
    }
});

export default React.memo(PropertyDetailsTab, () => true);