import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Easing
} from 'react-native';

interface IProps {
    value: boolean
    onToggle: (value: boolean) => void
}

export default function OnOffToggle({ value, onToggle }: IProps) {
    const positionButton = useRef(new Animated.Value(0)).current;
    const [isOn, setIsOn] = React.useState<boolean>(value);

    const isOnRef = useRef(false);

    const startAnimToOff = () => {
        Animated.timing(positionButton, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: false
        }).start()
    };

    const startAnimToOn = () => {
        Animated.timing(positionButton, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: false
        }).start()
    };

    React.useEffect(() => {
        if (isOn) {
            startAnimToOn();
        } else {
            startAnimToOff();
        }
    }, [isOn]);

    const positionInterPol = positionButton.interpolate({ inputRange: [0, 1], outputRange: [0, 40] })

    const backgroundColorAnim = positionButton.interpolate({ inputRange: [0, 1], outputRange: ["#767577", "#81b0ff"] })

    const initialOpacityOn = positionButton.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })

    const initialOpacityOff = positionButton.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })

    const onPress = () => {
        if (isOnRef.current) {
            // startAnimToOff();
            isOnRef.current = false
            setIsOn(false);
            onToggle(false);
        } else {
            // startAnimToOn();
            isOnRef.current = true
            setIsOn(true);
            onToggle(true);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={{ height: 30, width: 70 }} activeOpacity={0.9} onPress={onPress} >
                <Animated.View style={[styles.mainStyes, {
                    backgroundColor: backgroundColorAnim
                }]} >
                    <Animated.Text
                        style={[
                            styles.eahcStyles,
                            {
                                opacity: initialOpacityOn,
                            },
                        ]}>
                        ON
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.eahcStylesOf,
                            {
                                opacity: initialOpacityOff,
                            },
                        ]}>
                        OFF
                    </Animated.Text>
                    <Animated.View style={[styles.basicStyle, {
                        transform: [{
                            translateX: positionInterPol
                        }]
                    }]} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 8,
    },
    basicStyle: {
        height: 20,
        width: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        marginTop: 5,
        marginLeft: 5,
    },
    eahcStyles: {
        fontSize: 14,
        color: '#000',
        position: 'absolute',
        top: 6,
        left: 5,
    },
    eahcStylesOf: {
        fontSize: 14,
        color: '#fff',
        position: 'absolute',
        top: 6,
        right: 5,
    },
    mainStyes: {
        borderRadius: 30,
        backgroundColor: '#81b0ff',
        height: 30,
        width: 70,
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
