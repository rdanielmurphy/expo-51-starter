import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "react-native-paper";

interface InfoButtonProps {
    size: number;
    onPress: () => void;
}

export const UndoButton = ({ size, onPress }: InfoButtonProps) => {
    const insets = useSafeAreaInsets();
    return (
        <IconButton
            style={{
                width: size,
                position: "absolute",
                top: insets.top + 16,
                left: 160,
                height: size,
                backgroundColor: "#222121",
            }}
            icon="undo"
            iconColor="white"
            onPress={onPress}
        />
    );
};
