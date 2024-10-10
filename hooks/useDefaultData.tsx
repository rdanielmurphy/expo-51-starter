import { useState, useEffect } from 'react';
import { Asset, useAssets } from 'expo-asset'
import { getJson, readAsset } from '../lib/files';

interface IDefaultData {
    defaultDocuments: Object
    defaultInspectionTypes: Object
    defaultOverview: Object
    defaultReportDefinitions: Object
    defaultStates: Object
    defaultSummary: Object
    defaultUserFields: Object
    texasSummaryData: Object
}

export function useDefaultData() {
    const [data, setData] = useState<IDefaultData | null>(null);
    const [assets, error] = useAssets([
        require('../assets/default_data/default_documents.txt'),
        require('../assets/default_data/default_inspection_types.txt'),
        require('../assets/default_data/default_overview.txt'),
        require('../assets/default_data/default_report_definitions.txt'),
        require('../assets/default_data/default_states.txt'),
        require('../assets/default_data/default_summary.txt'),
        require('../assets/default_data/default_user_fields.txt'),
        require('../assets/default_data/texas_summary_data.txt'),
    ]);

    useEffect(() => {
        const downloadFiles = async (assets: Asset[]) => {
            const promiseArray: Promise<string>[] = [];
            assets.forEach((a: Asset) => {
                promiseArray.push(readAsset(a));
            });
            const result = await Promise.all(promiseArray);
            setData({
                defaultDocuments: getJson(result[0], false),
                defaultInspectionTypes: getJson(result[1], false),
                defaultOverview: getJson(result[2], false),
                defaultReportDefinitions: getJson(result[3], false),
                defaultStates: getJson(result[4], true),
                defaultSummary: getJson(result[5], false),
                defaultUserFields: getJson(result[6], true),
                texasSummaryData: getJson(result[7], false),
            });
        }

        if (data === null && assets && assets.length > 0) {
            downloadFiles(assets);
        }
    }, [assets]);

    return data;
}