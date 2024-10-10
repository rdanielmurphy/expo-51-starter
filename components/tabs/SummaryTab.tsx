import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { SQL_GET_SUMMARY_BY_SCRIPT_ID, SQL_UPDATE_SUMMARY_TEXT } from '../../lib/sqlCommands';
import { InspectionState } from '../../redux/reducers/inspection';
import RichTextValue from '../form/RichTextValue';
import SectionHeading from '../shared/SectionHeading';
import { useDbContext } from '../../contexts/DbContext';

export const SummaryTab = ({ navigation }: any) => {
    const { execAsync, getAllAsync, ready } = useDbContext();
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    const updateSummaryData = useCallback(async () => {
        if (ready) {
            const rows = await getAllAsync(SQL_GET_SUMMARY_BY_SCRIPT_ID(inspectionState.script_id!));
            const sortedResults = rows.sort((a: any, b: any) => a.number - b.number);
            setFlatListItems(sortedResults);
        }
    }, [ready]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            updateSummaryData();
        });

        if (ready) {
            updateSummaryData();
        }

        return unsubscribe;
    }, [ready]);
    
    const updateTextBox = React.useCallback((sql: string) => {
        execAsync(sql);
    }, [execAsync]);

    return (
        <ScrollView>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {flatListItems?.map((i, index) => (
                    <View style={{ height: 200, justifyContent: 'center' }} key={index.toString() + i.text}>
                        {i.name && <SectionHeading name={i.name} />}
                        <RichTextValue
                            value={i}
                            column={"text"}
                            onUpdate={updateTextBox}
                            sqlMethod={SQL_UPDATE_SUMMARY_TEXT}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}