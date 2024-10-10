import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "react-native-paper";

interface ModalButtonProps {
  size: number;
  onPress: () => void;
}

export const ModalButton = ({ size, onPress }: ModalButtonProps) => {
  const insets = useSafeAreaInsets();
  return (
    <IconButton
      style={{
        width: size,
        position: "absolute",
        top: insets.top + 16,
        right: 16,
        height: size,
        backgroundColor: "#222121",
      }}
      icon="sticker"
      iconColor="white"
      onPress={onPress}
    />
  );
};
