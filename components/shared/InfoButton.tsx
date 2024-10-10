import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";

interface InfoButtonProps {
    size: number;
    onPress: () => void;
}

export const InfoButton = ({ size, onPress }: InfoButtonProps) => {
    const insets = useSafeAreaInsets();
    return (
        <IconButton
            style={{
                width: size,
                position: "absolute",
                bottom: insets.top + 16,
                left: 16,
                height: size,
                backgroundColor: "#222121",
            }}
            icon="information-outline"
            iconColor="white"
            onPress={onPress}
        />
    );
};
