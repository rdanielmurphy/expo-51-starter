import React from 'react'
import { FlatList, StyleSheet, TouchableHighlight, View } from 'react-native';
import { Divider, Subheading, Surface } from 'react-native-paper';

export const SettingsScreen = (navigation: any) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <FlatList
                data={[{
                    url: 'EditPreInspectionAgreement',
                    name: 'Pre-inspection Agreement'
                }, {
                    url: 'SendErrorLog',
                    name: 'Send Error Log'
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
