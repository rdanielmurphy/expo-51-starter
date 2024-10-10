import React from 'react'
import { FlatList, StyleSheet, TouchableHighlight, View } from 'react-native';
import { Divider, Subheading, Surface } from 'react-native-paper';

export const AdministrationScreen = (navigation: any) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <FlatList
                data={[{
                    url: 'CompanyInfo',
                    name: 'Company Info'
                }, {
                    url: 'InspectorInfo',
                    name: 'Inspector Info'
                }, {
                    url: 'InspectionTemplates',
                    name: 'Inspection Templates'
                }, {
                    url: 'AdditionalServices',
                    name: 'Additional Services'
                }, {
                    url: 'EditCommentGroups',
                    name: 'Comments'
                }, {
                    url: 'EditSummary',
                    name: 'Summary'
                }, {
                    url: 'EditOverview',
                    name: 'Overview'
                }, {
                    url: 'FileImport',
                    name: 'File Import'
                }, {
                    url: 'ExportDb',
                    name: 'Export Database'
                }]}
                ItemSeparatorComponent={Divider}
                keyExtractor={(_item, index) => index.toString()}
                renderItem={({ item, index, separators }) => (
                    <Surface key={item.name} style={styles.surface}>
                        <TouchableHighlight
                            key={index}
                            onPress={() => {
                                navigation.navigation.navigate(item.url)
                            }}
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            <View key={item.name} style={styles.view}>
                                <View style={{ flex: 1, flexBasis: '90%' }}>
                                    <Subheading>{item.name}</Subheading>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    surface: {
        margin: 5,
    },
    view: {
        flexDirection: "row",
        padding: 20,
    }
});
