import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Subheading, useTheme } from 'react-native-paper';

const SectionHeading = (props: { name?: string, children?: React.ReactNode }) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        titleContainer: {
            backgroundColor: colors.backdrop,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
        },
    });

    return <View style={styles.titleContainer}>
        {props.name && (<Subheading>{props.name}</Subheading>)}
        {props.children}
    </View>
}

export default SectionHeading;