import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useMediaQuery } from "react-responsive";
import "@expo/match-media";
import * as ScreenOrientation from 'expo-screen-orientation';
import Logo from './shared/Logo';
import { tertiary } from '../lib/colors';
import ErrorHandler from './shared/ErrorHandler';

const MainScreenLogo = ({ fontsLoaded }: { fontsLoaded: boolean }) => (
    <View style={{ margin: 'auto', alignItems: 'center' }}>
        <View style={{ height: 200, width: 200 }}>
            <Logo />
        </View>
        <View style={{ height: 45, width: "100%" }}>
            {fontsLoaded && (
                <Text style={{ textAlign: 'center', color: tertiary, fontFamily: 'Urbanist', fontSize: 36, fontWeight: 'normal' }}>
                    Invoice Genie
                </Text>
            )}
        </View>
        <View style={{ height: 50, width: "100%" }}>
            {fontsLoaded && (
                <Text style={{ textAlign: 'center', color: tertiary, fontFamily: 'Urbanist', fontSize: 19, fontWeight: 'normal' }}>
                    Simple Invoicing Solutions
                </Text>
            )}
        </View>
    </View>
)

export const MainScreen = (navigation: any) => {
    const [topMargin, setTopMargin] = React.useState<number>(10);
    // const [fontsLoaded] = useFonts({
    //     'Urbanist': require('../assets/fonts/urbanist.woff2')
    // });
    const devMode = __DEV__;

    const isPhone = useMediaQuery({
        query: "(min-device-width:200) and (max-device-width:600)",
    });

    const onNewInspectionClick = useCallback(() => {
        navigation.navigation.navigate("NewInspection");
    }, []);

    ScreenOrientation.getOrientationAsync().then(data => {
        if (data === ScreenOrientation.Orientation.PORTRAIT_DOWN || data === ScreenOrientation.Orientation.PORTRAIT_UP) {
            setTopMargin(150);
        } else {
            setTopMargin(10);
        }
    });

    return (
        <ErrorHandler>
            {/* {!ready && devMode &&
                <View style={{ flex: 1, justifyContent: 'center', marginTop: -50 }}>
                    <MainScreenLogo fontsLoaded={true} />
                    {error && (<Text style={styles.errorText}>Error: {error}</Text>)}
                    <View style={{ paddingLeft: 8, paddingRight: 8, paddingBottom: 16 }}>
                        <ProgressBar animatedValue={progress ? progress * .01 : 0} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text>Updating database ...</Text>
                    </View>
                </View>
            }
            {!ready && !devMode &&
                <ScrollView>
                    <View style={{ flex: 1, justifyContent: 'center', marginTop: topMargin }}>
                        {error && (<Text style={styles.errorText}>Error: {error}</Text>)}
                        <ActivityIndicator color="secondary" size="large" />
                        <Text style={styles.loadingText}>Loading Database...</Text>
                        <Text style={styles.loadingText}>Statuses:</Text>
                        {messages.map((m: string, i: number) => <Text key={i} style={styles.loadingText}>{m}</Text>)}
                    </View>
                </ScrollView>
            } */}
            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10, marginRight: 10, marginTop: -50 }}>
                <MainScreenLogo fontsLoaded={true} />
                <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="plus" mode="contained" onPress={onNewInspectionClick}>
                    Create New Inspection Report
                </Button>
                <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="pencil" mode="contained" onPress={() => navigation.navigation.navigate("ExistingReports")}>
                    Existing Reports
                </Button>
                <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="information-outline" mode="contained" onPress={() => navigation.navigation.navigate("Administration")}>
                    Administration
                </Button>
                <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="cog" mode="contained" onPress={() => navigation.navigation.navigate("Settings")}>
                    Settings
                </Button>
                {devMode && (
                    <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="tune" mode="contained" onPress={() => navigation.navigation.navigate("SqlTablesView")}>
                        SQL Table View
                    </Button>
                )}
                {/* <Button style={isPhone ? styles.buttonSmall : styles.buttonLarge} icon="wallet-membership" mode="contained" onPress={() => navigation.navigation.navigate("MembershipScreen")}>
                        Membership
                    </Button> */}
            </View>
        </ErrorHandler>
    )
}

const styles = StyleSheet.create({
    buttonLarge: {
        margin: 10,
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
    },
    buttonSmall: {
        margin: 10,
        width: 300,
        alignSelf: "center",
    },
    errorText: {
        textAlign: 'center',
        width: 200,
        alignSelf: "center",
        color: "red",
    },
    loadingText: {
        textAlign: 'center',
        width: 200,
        alignSelf: "center",
    }
});