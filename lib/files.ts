import { Asset } from 'expo-asset';
import { readAsStringAsync, ReadingOptions } from 'expo-file-system';

const XMLParser = require('react-xml-parser');
const parser = new XMLParser();

export const readAsset = (asset: Asset, options?: ReadingOptions): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const { localUri } = await asset.downloadAsync();
            const text = await readAsStringAsync(localUri || "", options);
            resolve(text);
        } catch (e) {
            reject(e)
        }
    });
}

export const getJson = (fileContents: string, sanitizeFirst: boolean): Object => {
    const obj: any = {
        items: []
    };
    const allLines = fileContents.split(/\r\n|\n/);
    const jsonStart = allLines[0].indexOf("{");

    allLines.forEach((l: string, i: number) => {
        if (l.length > 0) {
            let jsonString = l.substring(jsonStart);
            if (sanitizeFirst) {
                jsonString = jsonString.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
            }
            try {
                obj.items.push(JSON.parse(jsonString));
            } catch (e) {
                console.error(e, jsonString); // error in the above string (in this case, yes)!
            }
        }
    });

    return obj;
}

export const getXML = (xml: string) => {
    try {
        return parser.parseFromString(xml)
    } catch(_e) {
        return null
    }
}