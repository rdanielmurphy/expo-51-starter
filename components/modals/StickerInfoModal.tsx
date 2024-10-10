import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { Headline, Subheading } from "react-native-paper";

const StickerInfoModal = () => {
    const navigation = useNavigation();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "rgb(34, 33, 33)",
                flexDirection: "row",
                flexWrap: "wrap",
            }}
        >
            <View style={{ position: 'absolute', right: 25, top: 50 }}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Icon name="close" color="#fff" size={48} />
                </Pressable>
            </View>
            <View style={{ position: 'absolute', left: 25, top: 100 }}>
                <Headline style={{ color: "white" }}>How to use stickers</Headline>
                <Subheading style={{ color: "white" }}>- Click sticker button to bring up the sitcker list</Subheading>
                <Subheading style={{ color: "white" }}>- Select a sticker, it will get added to the middle of the image</Subheading>
                <Subheading style={{ color: "white" }}>- Press and hold sticker to move it around</Subheading>
                <Subheading style={{ color: "white" }}>- Pinch/zoom to enlarge it or shrink it</Subheading>
                <Subheading style={{ color: "white" }}>- Click undo button to remove it</Subheading>
            </View>
        </View>
    );
};

export default StickerInfoModal;

const styles = StyleSheet.create({
    modalContent: {
        height: "25%",
        width: "100%",
        backgroundColor: "#25292e",
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
        position: "absolute",
        bottom: 0,
    },
    titleContainer: {
        height: "30px",
        backgroundColor: "#464C55",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        color: "#fff",
        fontSize: 16,
    },
    pickerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 50,
        paddingVertical: 20,
    },
});
