import React, { memo, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { SQL_GET_OVERVIEW_BY_SCRIPT_ID, SQL_UPDATE_OVERVIEW_TEXT } from '../../lib/sqlCommands';
import { InspectionState } from '../../redux/reducers/inspection';
import RichTextValue from '../form/RichTextValue';
import SectionHeading from '../shared/SectionHeading';
import { useDbContext } from '../../contexts/DbContext';

const OverviewTab = () => {
    const { execAsync, getAllAsync, ready } = useDbContext();
    const [flatListItems, setFlatListItems] = useState<any[]>();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    useEffect(() => {
        const getOverviewItems = async () => {
            const results = await getAllAsync(SQL_GET_OVERVIEW_BY_SCRIPT_ID(inspectionState.script_id!));
            const sortedResults = results.sort((a: any, b: any) => a.number - b.number);
            setFlatListItems(sortedResults);
        }

        if (ready) {
            getOverviewItems()
        }
    }, [ready, inspectionState.script_id])

    const updateTextBox = React.useCallback((sql: string) => {
        execAsync(sql);
    }, [execAsync]);

    return (
        <ScrollView>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {flatListItems?.map((i, index) => (
                    <View style={{ height: 200, justifyContent: 'center' }} key={index}>
                        {i.name && <SectionHeading name={i.name} />}
                        <RichTextValue
                            value={i}
                            column={"text"}
                            onUpdate={updateTextBox}
                            sqlMethod={SQL_UPDATE_OVERVIEW_TEXT}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

export default memo(OverviewTab, () => true);