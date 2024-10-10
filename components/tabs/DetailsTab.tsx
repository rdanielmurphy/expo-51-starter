import * as React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import GeneralTab from './GeneralTab';
import PropertyDetailsTab from './PropertyDetailsTab';
import RelatedContactsTab from './RelatedContactsTab';
import { primary, tertiary } from '../../lib/colors';

const DetailsTab = () => {
    const layout = useWindowDimensions();

    const renderScene = SceneMap({
        general: GeneralTab,
        propertyDetails: PropertyDetailsTab,
        relatedContacts: RelatedContactsTab,
    });

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'general', title: 'General' },
        { key: 'propertyDetails', title: 'Property Details' },
        { key: 'relatedContacts', title: 'Related Contacts' },
    ]);

    return (
        <View style={styles.container}>
            <View style={{ flex: 5 }}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{ width: 200 }}
                            pressColor={tertiary}
                            indicatorStyle={{ backgroundColor: tertiary }}
                            indicatorContainerStyle={{ backgroundColor: primary }}
                        />
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
});

export default React.memo(DetailsTab, () => true);