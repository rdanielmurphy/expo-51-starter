import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import React, { useState } from "react";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	useAnimatedGestureHandler,
} from "react-native-reanimated";
import {
	PanGestureHandler,
	PinchGestureHandler,
	PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";

// cretaed Animated version
const AnimatedView = Animated.createAnimatedComponent(View);

const { width, height } = Dimensions.get("window");

interface IIconStickerProps {
	iconName: string
}

const IconSticker = ({ iconName }: IIconStickerProps) => {
	const [size, setSize] = useState<number>(128);
	const scale = useSharedValue(1);

	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);

	const onPinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
		onActive: (event: any) => {
			scale.value = event.scale;
		},
	}, [size]);

	const onDrag = useAnimatedGestureHandler({
		onStart: (event: any, context: any) => {
			context.translateX = translateX.value;
			context.translateY = translateY.value;
		},
		onActive: (event: any, context: any) => {
			translateX.value = event.translationX + context.translateX;
			translateY.value = event.translationY + context.translateY;
		},
	});

	const containerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: translateX.value,
				},
				{
					translateY: translateY.value,
				},
			],
		};
	});

	const imageStyle = useAnimatedStyle<Animated.AnimateStyle<ViewStyle>>(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});

	return (
		<PinchGestureHandler onGestureEvent={onPinchHandler}>
			<AnimatedView style={[containerStyle, {
				// borderColor: 'red',
				// borderLeftWidth: 1,
				// borderBottomWidth: 1,
				// borderRightWidth: 1,
				// borderTopWidth: 1,
				top: 1 * (height / 2),
				left: 1 * (width / 2),
				width: size,
			}]}>
				<PanGestureHandler
					onGestureEvent={onDrag}
					minPointers={1}
					maxPointers={1}>
					<AnimatedView style={[imageStyle]}>
						<Icon name={iconName} color="red" size={size} />
					</AnimatedView>
				</PanGestureHandler>

			</AnimatedView>
		</PinchGestureHandler>
	);
};

export default IconSticker;

const styles = StyleSheet.create({});
