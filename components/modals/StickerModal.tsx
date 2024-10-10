import { FlatList, Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useEmojiContext } from "../../contexts/EmojiContext";

const StickerModal = () => {
	const { addEmoji } = useEmojiContext();
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
				<IconList
					onClose={() => navigation.goBack()}
					onSelect={(item: string) => addEmoji(item)}
				/>
			</View>
		</View>
	);
};

export default StickerModal;

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

export const IconList = ({ onClose, onSelect }: { onClose: () => void, onSelect: (item: string) => void }) => {
	// List of emojis
	const [emoji] = useState([
		"close",
		"panorama-fish-eye",
		"arrow-back",
		"arrow-forward",
	]);

	return (
		<View style={{ paddingBottom: 36 }}>
			<FlatList
				data={emoji}
				renderItem={({ item }) => (
					<Pressable
						style={{ marginHorizontal: 6 }}
						onPress={() => {
							onSelect(item);
							onClose();
						}}
					>
						<Icon name={item} color="red" size={48} />
					</Pressable>
				)}
				numColumns={7}
			/>
		</View>
	);
};
