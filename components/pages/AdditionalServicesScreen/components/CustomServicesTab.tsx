import * as React from 'react';
import { View, StyleSheet, FlatList, SwitchChangeEvent, Alert } from 'react-native';
import { SQL_UPDATE_SERVICE_PRICE, SQL_UPDATE_SERVICE_ENABLED, SQL_DELETE_SERVICE } from '../../../../lib/sqlCommands';
import { useCallback } from 'react';
import { Switch, TextInput, IconButton, Subheading } from 'react-native-paper';
import { IService } from '../../../../lib/types';
import { IServiceTabProps } from '..';
import CurrencyInput from 'react-native-currency-input';
import { useDbContext } from '../../../../contexts/DbContext';

interface IServiceListItemViewProps {
    service: IService
    onDelete: (id: number, name: string) => void
    onEnabledUpdate: (id: number, enabled: number) => void
    onPriceUpdate: (id: number, price: number) => void
}

const ServiceListItemView = ({ service, onDelete, onEnabledUpdate, onPriceUpdate }: IServiceListItemViewProps) => {
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

    const onDeleteClick = useCallback(() => {
        onDelete(service.id, service.description);
    }, [service.id, service.description, onDelete]);

    return (
        <View key={service.id} style={{ paddingBottom: 8 }}>
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
                <IconButton
                    style={{ width: 50 }}
                    icon="delete"
                    onPress={onDeleteClick}
                />
            </View>
        </View>
    )
}

export const CustomServicesTab = ({ services }: IServiceTabProps) => {
    const [customServices, setCustomServices] = React.useState<IService[] | undefined>(services);
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

    const onDelete = useCallback((serviceId: number) => {
        if (ready) {
            execAsync(SQL_DELETE_SERVICE(serviceId));
            setCustomServices(customServices?.filter(s => s.id !== serviceId));
        }
    }, [customServices, ready, execAsync]);

    const onServiceDelete = useCallback((serviceId: number, serviceName: string) => {
        Alert.alert(
            'Delete Service',
            'Are you sure you want to delete service ' + serviceName,
            [
                { text: 'OK', onPress: () => onDelete(serviceId) },
            ],
            { cancelable: true },
        );
    }, [onDelete]);

    return (
        <View style={styles.container}>
            <FlatList
                data={customServices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ServiceListItemView
                        key={item.id.toString()}
                        service={item}
                        onDelete={onServiceDelete}
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
