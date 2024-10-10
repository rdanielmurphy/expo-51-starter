import * as React from 'react';
import { View, StyleSheet, FlatList, SwitchChangeEvent } from 'react-native';
import { SQL_UPDATE_SERVICE_PRICE, SQL_UPDATE_SERVICE_ENABLED } from '../../../../lib/sqlCommands';
import { useCallback } from 'react';
import { Switch, TextInput, Subheading } from 'react-native-paper';
import { IService } from '../../../../lib/types';
import CurrencyInput from 'react-native-currency-input';
import { IServiceTabProps } from '..';
import { useDbContext } from '../../../../contexts/DbContext';

interface IServiceListItemViewProps {
    service: IService
    onEnabledUpdate: (id: number, enabled: number) => void
    onPriceUpdate: (id: number, price: number) => void
}

const ServiceListItemView = ({ service, onEnabledUpdate, onPriceUpdate }: IServiceListItemViewProps) => {
    const [price, setPrice] = React.useState<number>(service.price);
    const [enabled, setEnabled] = React.useState<boolean>(service.enabled === 1);

    const onEnabledChange = useCallback((event: SwitchChangeEvent) => {
        const newEnabled = event.nativeEvent.value;
        onEnabledUpdate(service.id, newEnabled ? 1 : 0);
        setEnabled(newEnabled);
    }, [service.id, onEnabledUpdate]);

    const onPriceChange = useCallback((newPrice: number) => {
        onPriceUpdate(service.id, newPrice);
        setPrice(newPrice);
    }, [service.id, onPriceUpdate]);

    return (
        <View key={service.id} style={{ marginBottom: 8 }}>
            <Subheading>{service.description}</Subheading>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <CurrencyInput
                    renderTextInput={textInputProps =>
                        <TextInput
                            {...textInputProps}
                            selectionColor={undefined}
                        />}
                    style={{ flex: 1, maxWidth: 150 }}
                    prefix="$"
                    delimiter=","
                    separator="."
                    precision={2}
                    minValue={0}
                    value={price}
                    onChangeValue={onPriceChange} />
                <Switch value={enabled} onChange={onEnabledChange} />
            </View>
        </View>
    )
}

export const DefaultServicesTab = ({ services }: IServiceTabProps) => {
    const { ready, execAsync } = useDbContext();

    const onPriceUpdate = useCallback((serviceId: number, newPrice: number) => {
        if (ready) {
            execAsync(SQL_UPDATE_SERVICE_PRICE(serviceId, newPrice));
        }
    }, [ready, execAsync]);

    const onEnabledUpdate = useCallback((serviceId: number, enabled: number) => {
        if (ready) {
            execAsync(SQL_UPDATE_SERVICE_ENABLED(serviceId, enabled));
        }
    }, [ready, execAsync]);

    return (
        <View style={styles.container}>
            <FlatList
                data={services}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ServiceListItemView
                        key={item.id.toString()}
                        service={item}
                        onPriceUpdate={onPriceUpdate}
                        onEnabledUpdate={onEnabledUpdate}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 16,
        paddingRight: 16,
    },
});
