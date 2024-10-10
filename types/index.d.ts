export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_PUBLIC_REV_KAT_GOOGLE_API_KEY: string;
            EXPO_PUBLIC_GOOGLE_PLACES_API_KEY: string;
        }
    }
}