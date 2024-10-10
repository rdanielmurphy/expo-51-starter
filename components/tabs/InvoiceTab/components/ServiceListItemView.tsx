import React, { useCallback } from 'react'
import { View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import { Subheading, TextInput, IconButton, Card } from 'react-native-paper';
import { formatCurrency } from "react-native-format-currency";
import { IService } from '../../../../lib/types';

interface IServiceListItemViewProps {
    service: IService
    onDelete: (id: number, name: string) => void
    onDiscountUpdate: (id: number, discount: number) => void
}

export const ServiceListItemView = ({ service, onDelete, onDiscountUpdate }: IServiceListItemViewProps) => {
    const [discount, setDiscount] = React.useState<number>(
        service.discount === undefined || service.discount === null ? 0 : service.discount);

    const onDeleteClick = useCallback(() => {
        onDelete(service.id, service.description);
    }, [service.id, service.description, onDelete]);

    const onDiscountChange = useCallback((newDiscount: number) => {
        onDiscountUpdate(service.id, newDiscount);
        setDiscount(newDiscount);
    }, [service.id, onDiscountUpdate]);

    return (
        <Card>
            <Card.Content>
                <Subheading>{service.description}</Subheading>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 150 }}>
                        <Subheading>Price:</Subheading>
                        <Subheading>{(formatCurrency({ amount: service.price, code: "USD" })[0])}</Subheading>
                    </View>
                    <CurrencyInput
                        renderTextInput={textInputProps =>
                            <TextInput
                                {...textInputProps}
                                placeholder="Enter discount"
                                selectionColor={undefined}
                                label={"Discount"}
                            />}
                        style={{ flex: 1, maxWidth: 150 }}
                        prefix="$"
                        delimiter=","
                        separator="."
                        precision={2}
                        minValue={0}
                        value={discount}
                        onChangeValue={onDiscountChange} />
                    <IconButton
                        style={{ width: 50 }}
                        icon="delete"
                        onPress={onDeleteClick}
                    />
                </View>
            </Card.Content>
        </Card>
    )
}