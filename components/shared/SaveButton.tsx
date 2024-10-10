import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "react-native-paper";

interface ShareButtonProps {
  size: number;
  onPress: () => void;
}

export const SaveButton = ({ size, onPress }: ShareButtonProps) => {
  const insets = useSafeAreaInsets();
  return (
    <IconButton
      style={{
        width: size,
        position: "absolute",
        top: insets.top + 16,
        height: size,
        backgroundColor: "#222121",
      }}
      icon="content-save"
      iconColor="white"
      onPress={onPress}
    />
  );
};
