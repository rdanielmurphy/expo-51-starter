import React, { useCallback } from 'react';
import { GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { GooglePlacesAutocompleteAndroid } from './components/GooglePlacesAutocompleteAndroid';
import { IAddress } from '../../../lib/types';
import { el } from 'date-fns/locale';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

interface IProps {
    onSelect: (address: IAddress) => void;
}

const GooglePlacesInput = ({ onSelect }: IProps) => {
    const onInput = useCallback((_data: GooglePlaceData, details: GooglePlaceDetail | null) => {
        let address = {} as IAddress;
        let streetNumber = '';
        let streetName = '';

        if (details && details.address_components) {
            for (let i = 0; i < details?.address_components.length; i++) {
                const element = details?.address_components[i];
                if (element) {
                    if (element.types.includes('street_number')) {
                        streetNumber = element.long_name;
                    } else if (element.types.includes('route')) {
                        streetName = element.long_name;
                    } else if (element.types.includes('locality')) {
                        address.city = element.long_name;
                    } else if (element.types.includes('administrative_area_level_1')) {
                        address.state = element.short_name;
                    } else if (element.types.includes('postal_code')) {
                        address.zip = element.long_name;
                    }
                }
            }
        }

        address.addr1 = `${streetNumber} ${streetName}`;
        onSelect(address);
    }, []);

    return (
        <GooglePlacesAutocompleteAndroid
            placeholder='Address search'
            onPress={onInput}
            disableScroll
            autoFillOnNotFound={true}
            fetchDetails
            query={{
                key: KEY,
                language: 'en',
            }}
        />
    );
};

export default GooglePlacesInput;