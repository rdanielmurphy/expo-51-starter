import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useEffect, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface IAppError {
    message: string;
    stack?: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_REV_KAT_GOOGLE_API_KEY: string;
        }
    }
}

const KEY = process.env.EXPO_PUBLIC_REV_KAT_GOOGLE_API_KEY as string || '';

export function useMembership() {
    const [ready, setReady] = useState<boolean>(false);
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [renewalDate, setRenewalDate] = useState<string | null>(null);
    const { handleError } = useErrorHandler();

    useEffect(() => {
        const getData = async () => {
            Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

            try {
                Purchases.configure({ apiKey: KEY });
            } catch (e: Error | any) {
                handleError("useMembership", "configure", e?.message, e?.stack);
            }

            try {
                const customer = await Purchases.getCustomerInfo();
                if (customer && customer.activeSubscriptions && customer.activeSubscriptions.length > 0) {
                    const sub = customer.activeSubscriptions[0];
                    setCurrentPlan(sub);
                    setRenewalDate(customer.allExpirationDates[sub]);
                }
            } catch (e: Error | any) {
                handleError("useMembership", "getCustomerInfo", e?.message, e?.stack);
            }

            setReady(true);
        }

        getData();
    }, []);

    return { ready, currentPlan, renewalDate };
}
