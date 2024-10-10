import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ArrowIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={150}
    height={50}
    fill={"red"}
    viewBox="0 0 250 250"
    preserveAspectRatio="none"
    {...props}
  >
    <Path d="M10.212 12.007 7.645 9.414h15.124v-4H7.62l2.585-2.586L7.377 0 0 7.378l7.37 7.443 2.842-2.814z" />
  </Svg>
)
export default ArrowIcon
