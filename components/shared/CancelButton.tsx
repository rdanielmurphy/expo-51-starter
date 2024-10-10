import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";

interface CancelButtonProps {
    size: number;
    onPress: () => void;
}

export const CancelButton = ({ size, onPress }: CancelButtonProps) => {
    const insets = useSafeAreaInsets();
    return (
        <IconButton
            style={{
                width: size,
                position: "absolute",
                top: insets.top + 16,
                left: 80,
                height: size,
                backgroundColor: "#222121",
            }}
            icon="window-close"
            iconColor="white"
            onPress={onPress}
        />
    );
};
