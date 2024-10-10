import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Button, Headline, Paragraph, ProgressBar, Subheading } from 'react-native-paper';
import RevenueCatUI from 'react-native-purchases-ui';
import { format } from 'date-fns';
import { updateSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';
import { useMembership } from '../../../hooks/useMembership';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

const PLANS = new Map([
    ['monthly:montly', {
        name: 'Monthly membership',
        price: '$38.99',
    },],
    ['annual:annual', {
        name: 'Annual membership',
        price: '$299.99',
    }],
]);

export const MembershipScreen = (navigation: any) => {
    const dispatch = useDispatch();
    const { handleError } = useErrorHandler();
    const { ready, currentPlan, renewalDate } = useMembership();

    const handlePaywallOpenClick = useCallback(async () => {
        try {
            const result = await RevenueCatUI.presentPaywall();
            if (result === 'PURCHASED') {
                updateSnackbar({
                    show: true,
                    type: "success",
                    onDismissSnackBar: () => { },
                    message: "Welcome new member!"
                })(dispatch);
                navigation.navigation.navigate("Main");
            }
        } catch (e: Error | any) {
            handleError("useMembership", "configure", e?.message, e?.stack);
        }
    }, []);

    return (
        <View>
            {!ready && <ProgressBar indeterminate />}
            {currentPlan === null && (
                <View>
                    <View style={styles.titleContainer}>
                        <Headline>Membership Options</Headline>
                    </View>
                    <View style={styles.titleContainer}>
                        <Paragraph>Becoming a member removes the watermark from your documents!</Paragraph>
                    </View>
                    <Button onPress={handlePaywallOpenClick}>Become a member</Button>
                </View>
            )}
            {currentPlan !== null && (
                <View>
                    <View style={styles.titleContainer}>
                        <Headline>Thank you for being a member!</Headline>
                    </View>
                    <View style={styles.titleContainer}>
                        <Paragraph>Current Plan:</Paragraph>
                    </View>
                    <View style={styles.view}>
                        <Subheading>{PLANS.get(currentPlan)?.name}</Subheading>
                        <Text>{PLANS.get(currentPlan)?.price}</Text>
                        {renewalDate !== null && <Text>Renews {format(new Date(renewalDate), "MMMM do yyyy")}</Text>}
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    surface: {
        margin: 5,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 25,
    },
    view: {
        flexDirection: "column",
        paddingLeft: 16,
    }
});
