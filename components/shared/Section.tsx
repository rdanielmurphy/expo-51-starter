import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';

interface ISectionProps {
    title: string
}

export const Section = (props: ISectionProps) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text>{props.title}</Text>
            <Divider />
        </View>
    )
}