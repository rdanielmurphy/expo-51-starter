import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, ProgressBar, Subheading, TextInput } from 'react-native-paper';
import { useScripts } from '../../hooks/useScripts';
import { useUserDefinedFields } from '../../hooks/useUserDefinedFields';
import { getNewAddressInsertStatement } from '../../lib/addressHelper';
import { IAddress } from '../../lib/types';
import { AddressPicker } from '../shared/AddressPicker';
import { IPickerItem, StandardPicker } from '../shared/StandardPicker';
import * as SQLite from 'expo-sqlite/next';
import {
    SQL_GET_MASTER_OVERVIEW_SECTION,
    SQL_GET_MASTER_SUMMARY_SECTION,
    SQL_GET_OVERVIEW_SECTION,
    SQL_GET_SECTIONS,
    SQL_GET_SUMMARY_SECTION,
    SQL_GET_SUMMARY_SUBSECTION,
    SQL_INSERT_INSPECTION,
    SQL_INSERT_INVOICE,
    SQL_INSERT_INVOICE_PAYMENT,
    SQL_INSERT_OVERVIEW,
    SQL_INSERT_OVERVIEW_SECTION,
    SQL_INSERT_PROPERTY,
    SQL_INSERT_SCRIPT,
    SQL_INSERT_SUMMARY,
    SQL_INSERT_SUMMARY_SECTION,
    SQL_INSERT_SUMMARY_SUBSECTION,
    SQL_UPDATE_SCRIPT_OVERVIEW_SUMMARY
} from '../../lib/sqlCommands';
import { getUserDefinedFieldValues } from '../../lib/userDefinedFieldsHelper';
import LoadingText from './ProgressText';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { useDbContext } from '../../contexts/DbContext';
import { useSections } from '../../hooks/useSections';

interface IProps {
    modalStyle?: boolean
    onClose: () => void
    onSubmit: (inspectionId: number) => void
}

export const NewInspectionForm = (props: IProps) => {
    const { execAsync, getAllAsync, getFirstAsync, runAsync, ready: dbReady } = useDbContext();
    const { loaded: loadedScripts, scripts } = useScripts();
    const { loaded: loadedUserDefinedFields, userDefinedFields } = useUserDefinedFields();
    const { addSection } = useSections();

    const [templateList, setTemplateList] = React.useState<any[]>([]);
    const [basementList, setBasementList] = React.useState<IPickerItem[]>();
    const [bathroomList, setBathroomList] = React.useState<IPickerItem[]>();
    const [bedroomList, setBedroomList] = React.useState<IPickerItem[]>();
    const [crawlSpaceList, setCrawlSpaceList] = React.useState<IPickerItem[]>();
    const [garageTypeList, setGarageTypeList] = React.useState<IPickerItem[]>();
    const [name, setName] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [address, setAddress] = React.useState<IAddress>();
    const [template, setTemplate] = React.useState<number>();
    const [bathroom, setBathroom] = React.useState<string>();
    const [addlRoom, setAddlRoom] = React.useState<string>();
    const [basement, setBasement] = React.useState<string>();
    const [crawlSpace, setCrawlSpace] = React.useState<string>();
    const [garageType, setGarageType] = React.useState<string>();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [creating, setCreating] = React.useState<boolean>(false);
    const [ready, setReady] = React.useState<boolean>(false);

    const onClose = () => props.onClose();
    const onSubmit = async () => {
        setCreating(true)

        // create inspection in the DB
        // TODO: Improve the performance by grouping the sql
        const basementString = basementList?.find((i) => i.value === basement)?.label;
        const crawlSpaceString = crawlSpaceList?.find((i) => i.value === crawlSpace)?.label;
        const garageString = garageTypeList?.find((i) => i.value === garageType)?.label;
        const hasBasement = basementString === "Partial" || basementString === "Full";
        const hasCrawlspace = crawlSpaceString === "Partial" || crawlSpaceString === "Full";
        const hasGarage = garageString === "Attached" || garageString === "Detached" ||
            garageString === "Carport";
        const bathroomCount = parseInt(bathroom ?? "0", 10);
        const bedroomCount = parseInt(addlRoom ?? "0", 10);

        const startTime = performance.now();
        try {
            const addrResult: SQLite.SQLiteRunResult = await runAsync(getNewAddressInsertStatement(address!, 1, "Home"));
            const propResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_PROPERTY(basement!, +bathroom!, +addlRoom!, crawlSpace!, garageType!, addrResult.lastInsertRowId!));
            const masterScript = templateList.find((i) => i.value = template)
            const scriptResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_SCRIPT(masterScript.label, masterScript.value, masterScript.tag, 1))
            // create overview
            const overviewResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_OVERVIEW(scriptResult.lastInsertRowId!))
            const masterOverview = await getFirstAsync(SQL_GET_MASTER_OVERVIEW_SECTION)
            const masterOverviewSections = await getAllAsync(SQL_GET_OVERVIEW_SECTION(masterOverview.id))
            for (let i = 0; i < masterOverviewSections.length; i++) {
                const item = masterOverviewSections[i]
                await execAsync(SQL_INSERT_OVERVIEW_SECTION(overviewResult.lastInsertRowId!, item.commentListNumber, item.number, item.name))
            }
            // create summary
            const summaryResult = await runAsync(SQL_INSERT_SUMMARY(scriptResult.lastInsertRowId!))
            const summaryOverview = await getFirstAsync(SQL_GET_MASTER_SUMMARY_SECTION)
            const summaryOverviewSections = await getAllAsync(SQL_GET_SUMMARY_SECTION(summaryOverview.id))
            for (let i = 0; i < summaryOverviewSections.length; i++) {
                const item = summaryOverviewSections[i]
                const summarySectionResult = await runAsync(SQL_INSERT_SUMMARY_SECTION(summaryResult.lastInsertRowId!, item.commentListNumber, item.number, item.name, item.text, item.type));
                const summarySubOverviewSections = await getAllAsync(SQL_GET_SUMMARY_SUBSECTION(item.id))
                for (let j = 0; j < summarySubOverviewSections.length; j++) {
                    const item = summarySubOverviewSections[j]
                    await execAsync(SQL_INSERT_SUMMARY_SUBSECTION(summarySectionResult.lastInsertRowId!, item.commentListNumber, item.number, item.name, item.text, item.type))
                }
            }
            await execAsync(SQL_UPDATE_SCRIPT_OVERVIEW_SUMMARY(scriptResult.lastInsertRowId!, overviewResult.lastInsertRowId!, summaryResult.lastInsertRowId!));

            // create sections
            const sectionsResult = await getAllAsync(SQL_GET_SECTIONS(masterScript.value));
            const promises = []
            for (let i = 0; i < sectionsResult.length; i++) {
                const section = sectionsResult[i];
                if ((section.tag === "basementType" && !hasBasement) ||
                    (section.tag === "crawlspaceType" && !hasCrawlspace) ||
                    (section.tag === "garages" && !hasGarage) ||
                    (section.tag === "bathrooms" && bathroomCount <= 0) ||
                    (section.tag === "bedrooms" && bedroomCount <= 0)) {
                    continue;
                }
                if (section.tag === "bathrooms") {
                    for (let i = 0; i < bathroomCount; i++) {
                        promises.push(addSection(scriptResult.lastInsertRowId!, section, bathroomCount > 1 ? i + 1 : undefined));
                    }
                } else if (section.tag === "bedrooms") {
                    for (let i = 0; i < bedroomCount; i++) {
                        promises.push(addSection(scriptResult.lastInsertRowId!, section, bedroomCount > 1 ? i + 1 : undefined));
                    }
                } else {
                    promises.push(addSection(scriptResult.lastInsertRowId!, section));
                }
            }
            await Promise.all(promises);

            // create invoice
            const invoiceResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_INVOICE());
            execAsync(SQL_INSERT_INVOICE_PAYMENT(invoiceResult.lastInsertRowId!));
            const inspectionResult: SQLite.SQLiteRunResult = await runAsync(SQL_INSERT_INSPECTION(name, number, scriptResult.lastInsertRowId!, propResult.lastInsertRowId!, invoiceResult.lastInsertRowId!));
            props.onSubmit(inspectionResult.lastInsertRowId!);
        } catch (e) {
            // failed
            console.error('failed to create inspection', e)
        } finally {
            setCreating(false)
            const finishTime = performance.now();
            console.log(`It took me ${finishTime - startTime} milliseconds to create the inspection!`)
        }
    }

    useEffect(() => {
        if (loadedUserDefinedFields && userDefinedFields && loadedScripts && scripts) {
            const templates = scripts.items.map((s, _i) => ({ label: s.name, value: s.id, tag: s.tag }));
            const basements = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBasement");
            const bathrooms = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBathrooms");
            const bedrooms = getUserDefinedFieldValues(userDefinedFields.items, "PropertyBedrooms");
            const crawls = getUserDefinedFieldValues(userDefinedFields.items, "PropertyCrawl");
            const garages = getUserDefinedFieldValues(userDefinedFields.items, "PropertyGarageType");

            setTemplateList(templates);
            setBasementList(basements);
            setBathroomList(bathrooms);
            setBedroomList(bedrooms);
            setCrawlSpaceList(crawls);
            setGarageTypeList(garages);

            setBasement(basements[2].value);
            setBathroom(bathrooms[0].value);
            setAddlRoom(bedrooms[0].value);
            setCrawlSpace(crawls[2].value);
            setGarageType(garages[3].value);

            if (templates.length > 0) {
                setTemplate(templates[0].value);
            }
            setLoading(false);
        }
    }, [loadedUserDefinedFields, userDefinedFields, loadedScripts, scripts, ready]);

    useEffect(() => {
        setReady(address !== undefined && name.length > 0 && number.length > 0 && dbReady);
    }, [address, name, number, template, dbReady]);

    return (
        <>
            {!loading && !creating &&
                <ScrollView style={styles.scrollView}>
                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="off"
                            nativeID='name'
                            label="Name"
                            value={name}
                            onChangeText={text => setName(text)}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <TextInput
                            autoComplete="off"
                            nativeID='number'
                            label="Number"
                            value={number}
                            onChangeText={text => setNumber(text)}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <AddressPicker value={address} onChange={setAddress} />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={templateList}
                            onValueChange={(t) => setTemplate(t)}
                            label={"Template"}
                            value={template}
                        />
                    </View>

                    <Subheading>Property Information</Subheading>
                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={bathroomList || []}
                            onValueChange={(t) => setBathroom(t)}
                            label={"Bathroom(s)"}
                            value={bathroom}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={bedroomList || []}
                            onValueChange={(t) => setAddlRoom(t)}
                            label={"All'l Room(s)"}
                            value={addlRoom}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={basementList || []}
                            onValueChange={(t) => setBasement(t)}
                            label={"Basement"}
                            value={basement}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={crawlSpaceList || []}
                            onValueChange={(t) => setCrawlSpace(t)}
                            label={"Crawl Space"}
                            value={crawlSpace}
                        />
                    </View>

                    <View style={styles.formComponent}>
                        <StandardPicker
                            items={garageTypeList || []}
                            onValueChange={(t) => setGarageType(t)}
                            label={"Garage Type"}
                            value={garageType}
                        />
                    </View>

                    {props.modalStyle && (
                        <View style={styles.buttons}>
                            <Button mode="text" onPress={onClose}>Cancel</Button>
                            <Button mode="text" disabled={!ready} onPress={onSubmit}>Done</Button>
                        </View>
                    )}
                    {!props.modalStyle && (
                        <View>
                            <Button mode="contained" disabled={!ready} onPress={onSubmit}>Create</Button>
                        </View>
                    )}
                </ScrollView>
            }
            {loading && <ProgressBar indeterminate={true} />}
            <ProgressDialog
                visible={creating}
                message={<LoadingText>Creating Inspection</LoadingText>}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        marginHorizontal: 0,
    },
    buttons: {
        flex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    formComponent: {
        paddingTop: 10,
        paddingBottom: 10,
    }
});
