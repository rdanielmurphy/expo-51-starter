import {
  Skia,
  type SkMatrix,
  type SkSize,
  vec,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector, ComposedGesture } from "react-native-gesture-handler";
import { SharedValue, runOnJS } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { rotateZ, scale, toM4, translate } from "../../lib/MatrixHelpers";
import { useEffect, useState } from "react";
interface GestureHandlerProps {
  matrix: SharedValue<SkMatrix>;
  size: SkSize;
  debug?: boolean;
}

export const GestureHandler = ({ matrix, size }: GestureHandlerProps) => {
  const pivot = useSharedValue(Skia.Point(0, 0));
  const offset = useSharedValue(Skia.Matrix());
  const [style, setStyle] = useState<any>();

  const pan = Gesture.Pan().runOnJS(true).onChange((event) => {
    matrix.value = translate(matrix.value, event.changeX, event.changeY);
  });
  const pinch = Gesture.Pinch().runOnJS(true)
    .onBegin((event) => {
      offset.value = matrix.value;
      pivot.value = vec(event.focalX, event.focalY);
    })
    .onChange((event) => {
      matrix.value = scale(offset.value, event.scale, pivot.value);
    });

  const rotate = Gesture.Rotation().runOnJS(true)
    .onBegin((event) => {
      offset.value = matrix.value;
      pivot.value = vec(event.anchorX, event.anchorY);
    })
    .onChange((event) => {
      matrix.value = rotateZ(offset.value, event.rotation, pivot.value);
    });
  const gesture = Gesture.Race(pan, pinch, rotate);

  const setItUp = () => {
    const theStyle = useAnimatedStyle(() => ({
      position: "absolute",
      width: size.width,
      height: size.height,
      top: 0,
      left: 0,
      transform: [
        {
          translateX: -size.width / 2,
        },
        {
          translateY: -size.height / 2,
        },
        { matrix: toM4(matrix.value) },
        {
          translateX: size.width / 2,
        },
        {
          translateY: size.height / 2,
        },
      ],
    }));

    setStyle(theStyle);
  }

  if (style === undefined) {
    runOnJS(setItUp)();
  }

  return gesture ? (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} />
    </GestureDetector>
  ) : <></>;
};
