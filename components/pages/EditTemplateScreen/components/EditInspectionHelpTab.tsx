import React, { memo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const EditInspectionHelpTab = () => {
    return (
        <View style={{ flex: 1, paddingLeft: 16, paddingRight: 16, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center' }}>
                <Text variant='headlineLarge'>You are in edit template mode.</Text>
            </View>
            <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
                <Text>
                    <Text variant="bodyLarge">- You can add  </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>sections, subsections, options,</Text>
                    <Text variant="bodyLarge"> and all the types of </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>values</Text>
                    <Text variant="bodyLarge"> here.</Text>
                </Text>
                <Text>
                    <Text variant="bodyLarge">-  You can export the current inspection template using the </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>Export Template</Text>
                    <Text variant="bodyLarge"> option in the menu.  Then you can use it later for a future inspection.</Text>
                </Text>
                <Text>
                    <Text variant="bodyLarge">- Once you are done, you can click </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>Finish Editing</Text>
                    <Text variant="bodyLarge"> in the menu.</Text>
                </Text>
                <Text>
                    <Text variant="bodyLarge">- To get started, either </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>add a section</Text>
                    <Text variant="bodyLarge"> or use the </Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '800' }}>menu on the left</Text>
                    <Text variant="bodyLarge"> to navigate to an existing section</Text>
                </Text>
            </View>
        </View >
    );
};

export default memo(EditInspectionHelpTab, () => true);