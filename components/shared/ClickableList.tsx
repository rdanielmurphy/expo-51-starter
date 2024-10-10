import React from "react";
import { FlatList, TouchableHighlight, StyleSheet, View } from "react-native";
import { Divider, IconButton, Surface, Subheading, Title } from "react-native-paper";

export interface IClickableListItem {
    id: number
    text: string
    primary: boolean
}

interface IProps {
    items: IClickableListItem[]
    onRowPress: (item: IClickableListItem) => void
    onRowDelete: (item: IClickableListItem) => void
}

export const ClickableList = (props: IProps) => {
    return (
        <View>
            {props.items.map((item: IClickableListItem, index: number) => (
                <View key={item.id}>
                    <Surface key={index} style={styles.surface}>
                        <TouchableHighlight
                            key={index}
                            onPress={() => {
                                props.onRowPress(item)
                            }}
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD">
                            <View>
                                <View key={item.text} style={styles.view}>
                                    {item.primary === true && (
                                        <View style={{ flex: 2, flexBasis: 25, margin: "auto", justifyContent: "center" }}>
                                            <Title style={{ color: 'green' }}>P</Title>
                                        </View>
                                    )}
                                    <View style={{ flex: 1, flexBasis: '75%', margin: "auto", justifyContent: "center" }}>
                                        <Subheading>{item.text}</Subheading>
                                    </View>
                                    <View style={{ flex: 2, flexBasis: 50 }}>
                                        <IconButton
                                            style={{ width: 50 }}
                                            icon="delete"
                                            onPress={() => {
                                                props.onRowDelete(item)
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Surface>
                    {index !== props.items.length - 1 && <Divider />}
                </View>
            ))}
        </View>
    )
}


const styles = StyleSheet.create({
    view: {
        flexDirection: "row",
        paddingLeft: 5,
    },
    surface: {
        margin: 5,
    },
});