import { Dimensions, View } from "react-native"
import { StandardPicker } from "../../../shared/StandardPicker"
import { Card, IconButton, Text, TextInput } from "react-native-paper"
import { useCallback, useState } from "react"
import CurrencyInput from "react-native-currency-input"

interface IProps {
    id: number
    method: string
    onPaymentMethodChange: (id: number, string: string) => void
    amount: string
    onAmountChange: (id: number, string: string) => void
    checkNumber: string
    onCheckNumberChange: (id: number, string: string) => void
    onDeleteClick: (id: number) => void
}

export const Payment = (
    { id, method, onPaymentMethodChange, amount, onAmountChange, checkNumber, onCheckNumberChange, onDeleteClick }: IProps) => {
    const screen = Dimensions.get("screen");
    const [theMethod, setTheMethod] = useState(method);
    const [theAmount, setTheAmount] = useState<number>(parseFloat(amount));
    const [theCheckNumber, setTheCheckNumber] = useState(checkNumber);

    const handlePaymentMethodChange = useCallback((value: string) => {
        setTheMethod(value)
        onPaymentMethodChange(id, value);
    }, [id]);

    const handleCheckNumberChange = useCallback((value: string) => {
        setTheCheckNumber(value)
        onCheckNumberChange(id, value);
    }, [id]);

    const handleAmountChange = useCallback((value: number | null) => {
        setTheAmount(value ?? 0)
        onAmountChange(id, value ? value.toString() : '0');
    }, [id, onAmountChange]);

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(id);
    }, [id, onDeleteClick]);

    return (
        <Card>
            <Card.Content>
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <View style={{ flexGrow: 1 }}>
                            <StandardPicker
                                items={[
                                    { label: 'Not Paid', value: 'Not Paid' },
                                    { label: 'Cash', value: 'Cash' },
                                    { label: 'Check', value: 'Check' },
                                    { label: 'Credit Card', value: 'Credit Card' },
                                    { label: 'Money Order', value: 'Money Order' },
                                    { label: 'Bank transfer', value: 'Bank transfer' },
                                ]}
                                onValueChange={handlePaymentMethodChange}
                                label={"Payment Method"}
                                value={theMethod}
                                useValueAsDisplay
                            />
                        </View>
                        <View style={{ width: 60 }}>
                            <IconButton
                                style={{ width: 50 }}
                                icon="delete"
                                onPress={handleDeleteClick}
                            />
                        </View>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <View style={{ paddingTop: 8, width: (screen.width / 2) - 25 }}>
                            <CurrencyInput
                                renderTextInput={textInputProps =>
                                    <TextInput
                                        label="Amount"
                                        {...textInputProps}
                                        selectionColor={undefined}
                                    />}
                                prefix="$"
                                delimiter=","
                                separator="."
                                precision={2}
                                minValue={0}
                                value={theAmount}
                                onChangeValue={handleAmountChange} />
                        </View>
                        {theMethod === 'Check' && (
                            <View style={{ paddingTop: 8, paddingLeft: 8, width: (screen.width / 2) - 25 }}>
                                <TextInput
                                    label="Check Number"
                                    value={theCheckNumber}
                                    keyboardType="numeric"
                                    onChangeText={handleCheckNumberChange}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    )
}