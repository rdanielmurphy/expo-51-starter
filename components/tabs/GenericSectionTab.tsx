import * as React from 'react';
import { View, useWindowDimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { TabView, TabBar } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { InspectionState } from '../../redux/reducers/inspection';
import GenericSubSectionTab from './GenericSubSectionTab';
import { updateSubsection } from '../../redux/actions';
import { primary, tertiary } from '../../lib/colors';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    templateMode?: boolean;
    navigate: (route: string) => void;
}

const GenericSectionTab = (props: IProps) => {
    const { execAsync } = useDbContext();
    const dispatch = useDispatch();
    const layout = useWindowDimensions();
    const [ready, setReady] = React.useState<boolean>(false);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [index, setIndex] = React.useState(0);
    const [routes, setRoutes] = React.useState<any[]>([]);

    React.useEffect(() => {
        const getData = async () => {
            const sectionId = inspectionState.section_id;
            try {
                const theRoutes: any[] = []
                inspectionState.subsections?.filter((s: any) => s.section_id === sectionId)
                    .sort((a, b) => a.number - b.number).forEach((r) => {
                        const key = `subsection-${r.id}`
                        theRoutes.push({ key: key, title: r.name, sectionId: sectionId, subsectionId: r.id, subsectionName: r.name })
                    })

                if (theRoutes.length > 0) {
                    updateSubsection({ subsection_id: theRoutes[0].subsectionId })(dispatch);
                }
                setRoutes(theRoutes);

                setReady(true);
            } catch (e) {
                console.error(e)
            }
        }
        getData();
    }, [inspectionState.id, inspectionState.subsectionRefreshCounter, inspectionState.section_id]);

    const handleIndexChange = React.useCallback((i: number) => {
        setIndex(i);
        const route = routes[i];
        if (route && route.subsectionId) {
            updateSubsection({ subsection_id: route.subsectionId })(dispatch);
        }
    }, [inspectionState.subsectionRefreshCounter, routes]);

    const renderTabBar = React.useCallback((props: any) => (
        <TabBar
            {...props}
            scrollEnabled={true}
            tabStyle={{ width: layout.width / 2 }}
            pressColor={tertiary}
            indicatorStyle={{ backgroundColor: tertiary }}
            indicatorContainerStyle={{ backgroundColor: primary }}
        />
    ), [layout.width]);

    const navigate = React.useCallback((route: string) => {
        props.navigate(route)
    }, [props.navigate]);

    React.useEffect(() => {
        const r = routes.findIndex((r) => r.subsectionId === inspectionState.subsection_id)
        if (r !== -1) {
            setIndex(r)
        }
    }, [inspectionState.subsection_id, routes])

    return (
        !ready && !props.navigate ? (
            <View>
                <ProgressBar indeterminate={true} />
            </View>
        ) : (
            <View style={[styles.container, {
                flexDirection: "column"
            }]}>
                <View style={{ flex: 5 }}>
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={(props2: any) => {
                            return (
                                <GenericSubSectionTab
                                    sectionId={inspectionState.section_id ?? -1}
                                    subsectionId={props2.route.subsectionId}
                                    subsectionName={props2.route.subsectionName}
                                    templateMode={props.templateMode}
                                    navigate={navigate}
                                    executeSQL={execAsync}
                                />
                            )
                        }}
                        onIndexChange={handleIndexChange}
                        initialLayout={{ width: layout.width }}
                        renderTabBar={renderTabBar}
                        lazy
                        renderLazyPlaceholder={() => (
                            <View style={styles.progress}>
                                <ActivityIndicator size="large" />
                            </View>
                        )}
                    />
                </View>
            </View>
        )
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progress: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default React.memo(GenericSectionTab);