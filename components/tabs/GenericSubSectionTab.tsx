import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import GenericOption from '../form/GenericOption';
import PhotosOption from '../form/PhotosOption';
import SectionHeading from '../shared/SectionHeading';
import { InspectionState } from '../../redux/reducers/inspection';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
    optionContainer: {
        marginBottom: 10,
    },
});

interface IGenericSubSectionTabProps {
    sectionId: number;
    subsectionName: string;
    subsectionId: number;
    templateMode?: boolean;
    executeSQL: (sqlStatement: string, log?: boolean | undefined) => Promise<any>;
    navigate: any;
}

const GenericSubSectionTab = (props: IGenericSubSectionTabProps) => {
    const { colors } = useTheme();
    const [options, setOptions] = React.useState<any[]>([]);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    React.useEffect(() => {
        const theOptions = inspectionState.options ?
            inspectionState.options?.filter((v: any) => v.subsection_id === props.subsectionId) : [];
        setOptions(theOptions ?? []);
    }, [inspectionState.optionsRefreshCounter, props.subsectionId]);

    return (
        <ScrollView>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: colors.background }} >
                {options?.sort((a: any, b: any) => a.number - b.number).map((o: any) =>
                    <View key={o.id}>
                        {o.name && <SectionHeading name={o.name} />}
                        <View style={styles.optionContainer}>
                            <GenericOption executeSQL={props.executeSQL} optionId={o.id} />
                        </View>
                    </View>
                )}
                {!props.templateMode && (
                    <PhotosOption
                        navigate={props.navigate}
                        sectionId={props.sectionId}
                        subsectionId={props.subsectionId}
                        subsectionName={props.subsectionName}
                    />
                )}
            </View>
        </ScrollView>
    )
}

export default React.memo(GenericSubSectionTab, (prevProps: any, nextProps: any) => {
    return prevProps.subsectionId === nextProps.subsectionId &&
        prevProps.subsectionName === nextProps.subsectionName &&
        prevProps.sectionId === nextProps.sectionId;
});
