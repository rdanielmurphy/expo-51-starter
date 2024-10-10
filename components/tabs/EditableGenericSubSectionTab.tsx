import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import EditableGenericOption from '../form/EditableGenericOption';
import EditableOptionHeader from '../form/EditableOptionHeader';
import * as SQLite from 'expo-sqlite/next';

export interface IDbProps {
    execAsync: (sql?: string, refresh?: boolean, log?: boolean) => Promise<boolean>;
    runAsync: (sql?: string, args?: any[] | undefined, refresh?: boolean, log?: boolean) => Promise<SQLite.SQLiteRunResult>;
    getAllAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean | undefined) => Promise<any[]>;
    getFirstAsync: (sqlStatement: string, args?: any[] | undefined, log?: boolean) => Promise<any>;
}

interface IEditableGenericSubSectionTabProps extends IDbProps {
    sectionId: number;
    subsectionName: string;
    options: any[];
    subsectionId: number;
    values: any[];
    valueOptions: any[];
    navigate: (path: string, params: any) => any;
}

const EditableGenericSubSectionTab = (props: IEditableGenericSubSectionTabProps) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        optionContainer: {
            marginBottom: 10,
            marginTop: 10,
        },
    });

    const theOptions = props.options.filter((v: any) => v.subsection_id === props.subsectionId);

    return (
        <ScrollView>
            <View style={{ paddingBottom: 75, paddingLeft: 5, paddingRight: 5, flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background }}>
                {theOptions.sort((a: any, b: any) => a.number - b.number).map((o: any) =>
                    <View key={o.id}>
                        <EditableOptionHeader
                            id={o.id}
                            name={o.name}
                            execAsync={props.execAsync}
                            runAsync={props.runAsync}
                            getAllAsync={props.getAllAsync}
                            getFirstAsync={props.getFirstAsync}
                        />
                        <View style={styles.optionContainer}>
                            <EditableGenericOption
                                execAsync={props.execAsync}
                                runAsync={props.runAsync}
                                getAllAsync={props.getAllAsync}
                                getFirstAsync={props.getFirstAsync}
                                optionId={o.id}
                                values={props.values}
                                valueOptions={props.valueOptions} 
                                navigate={props.navigate}/>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

export default React.memo(EditableGenericSubSectionTab);