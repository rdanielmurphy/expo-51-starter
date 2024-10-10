import React, { memo, useCallback, useEffect } from 'react'
import { View } from 'react-native';
import CurrencyInput from 'react-native-currency-input';
import { Text, Subheading, TextInput, ProgressBar, Button } from 'react-native-paper';
import { formatCurrency } from "react-native-format-currency";
import { InspectionState } from '../../../redux/reducers/inspection';
import { useSelector } from 'react-redux';
import { SQL_GET_INVOICE_BY_INSPECTION_ID, SQL_GET_INSPECTION_SERVICES, SQL_UPDATE_INSPECTION_DISCOUNT, SQL_UPDATE_INSPECTION_FEE, SQL_UPDATE_INVOICE_CHECK_NUMBER, SQL_UPDATE_INVOICE_PAYMENT_METHOD, SQL_UPDATE_INVOICE_TOTAL, SQL_INSERT_NEW_INSPECTION_SERVICE, SQL_UPDATE_SERVICE_DISCOUNT, SQL_DELETE_SERVICE, SQL_GET_INVOICE_PAYMENTS, SQL_INSERT_INVOICE_PAYMENT, SQL_UPDATE_INVOICE_AMOUNT, SQL_DELETE_INVOICE_PAYMENT } from '../../../lib/sqlCommands';
import { IInvoicePayment, IService } from '../../../lib/types';
import { AddServiceToInvoiceModal } from '../../modals/AddServiceToInvoiceModal';
import { ScrollView } from 'react-native-gesture-handler';
import { Payment } from './components/Payment';
import { ServiceListItemView } from './components/ServiceListItemView';
import { useDbContext } from '../../../contexts/DbContext';

const InvoiceTab = () => {
    const { execAsync, getFirstAsync, getAllAsync, ready } = useDbContext();
    const [invoiceId, setInvoiceId] = React.useState<number | null>(null);
    const [fee, setFee] = React.useState<number | null>(null);
    const [discount, setDiscount] = React.useState<number | null>(null);
    const [feeTotal, setFeeTotal] = React.useState<number | null>(null);
    const [total, setTotal] = React.useState<number | null>(null);
    const [payments, setPayments] = React.useState<IInvoicePayment[]>([]);
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
    const [uiReady, setUiReady] = React.useState<boolean>(false);
    const [openAddModal, setOpenAddModal] = React.useState<boolean>(false);
    const [services, setServices] = React.useState<IService[]>([]);
    const [servicesCost, setServicesCost] = React.useState<number>(0);
    const [servicesCostRefreshCounter, setServicesCostRefreshCounter] = React.useState<number>(0);

    useEffect(() => {
        const getInvoice = async () => {
            try {
                const invoice = await getFirstAsync(SQL_GET_INVOICE_BY_INSPECTION_ID(inspectionState.id!));
                let total = 0;
                if (invoice !== undefined && invoice !== null) {
                    setFee(invoice.fee);
                    setDiscount(invoice.discountAmount);
                    total = invoice.fee - (invoice.discountAmount ?? 0);
                    setFeeTotal(total);
                    setInvoiceId(invoice.invoice_id);

                    const invoicePaymentsResults = await getAllAsync(SQL_GET_INVOICE_PAYMENTS(invoice.invoice_id!));
                    setPayments(invoicePaymentsResults as IInvoicePayment[]);
                }
                const servicesArray = await getAllAsync(SQL_GET_INSPECTION_SERVICES(inspectionState.id!));
                const servicesTotal = servicesArray.reduce((acc: number, s: IService) => acc + s.price - (s.discount ?? 0), 0);
                setServicesCost(servicesTotal);
                setServices(servicesArray.map((s: any) => s as IService));
                setTotal(total + servicesTotal);
                setUiReady(true);
            } catch (e) { console.error(e) }
        }

        if (ready) {
            getInvoice()
        }
    }, [inspectionState.id, ready]);

    useEffect(() => {
        const getServices = async () => {
            try {
                const servicesArray = await getAllAsync(SQL_GET_INSPECTION_SERVICES(inspectionState.id!));
                const servicesTotal = servicesArray.reduce((acc: number, s: IService) => acc + s.price - (s.discount ?? 0), 0);
                setServicesCost(servicesTotal);
                setServices(servicesArray.map((s: any) => s as IService));
                setTotal((feeTotal ?? 0) + servicesTotal);
                execAsync(SQL_UPDATE_INVOICE_TOTAL((feeTotal ?? 0) + servicesTotal, invoiceId!));
            } catch (e) { console.error(e) }
        }

        if (ready && servicesCostRefreshCounter > 0) {
            getServices();
        }
    }, [ready, servicesCostRefreshCounter, inspectionState.id, feeTotal, getAllAsync]);

    const onFeeChange = useCallback(
        (number: number) => {
            setFee(number);
            execAsync(SQL_UPDATE_INSPECTION_FEE(number, inspectionState.id!));
            const total = number ? Math.round((number - (discount || 0)) * 100) / 100 : 0;
            execAsync(SQL_UPDATE_INVOICE_TOTAL(total + servicesCost, invoiceId!));
            setFeeTotal(total);
            setTotal(total + servicesCost);
        }, [invoiceId, inspectionState.id, discount, servicesCost, execAsync]
    );

    const onDiscountChange = useCallback(
        (number: number) => {
            setDiscount(number);
            execAsync(SQL_UPDATE_INSPECTION_DISCOUNT(number, inspectionState.id!));
            const total = fee ? Math.round((fee - (number || 0)) * 100) / 100 : 0;
            execAsync(SQL_UPDATE_INVOICE_TOTAL(total + servicesCost, invoiceId!));
            setFeeTotal(total);
            setTotal(total + servicesCost);
        }, [invoiceId, inspectionState.id, fee, servicesCost, execAsync]
    );

    const getPayments = useCallback(async () => {
        const invoicePaymentsResults = await getAllAsync(SQL_GET_INVOICE_PAYMENTS(invoiceId!));
        setPayments(invoicePaymentsResults as IInvoicePayment[]);
    }, [invoiceId, getAllAsync]);

    const onPaymentMethodChange = useCallback(
        async (id: number, text: string) => {
            await execAsync(SQL_UPDATE_INVOICE_PAYMENT_METHOD(text, id));
            getPayments();
        }, [invoiceId, getPayments, execAsync]
    );

    const onAmountChange = useCallback(
        async (id: number, text: string) => {
            const amount = text.length > 0 ? parseFloat(text) : 0;
            await execAsync(SQL_UPDATE_INVOICE_AMOUNT(amount, id));
            getPayments();
        }, [invoiceId, getPayments, execAsync]
    );

    const onCheckNumberChange = useCallback(
        async (id: number, text: string) => {
            await execAsync(SQL_UPDATE_INVOICE_CHECK_NUMBER(text, id));
            getPayments();
        }, [invoiceId, getPayments, execAsync]
    );

    const onDeletePayment = useCallback(async (id: number) => {
        await execAsync(SQL_DELETE_INVOICE_PAYMENT(id));
        getPayments();
    }, [getPayments, execAsync]);

    const onOpenAddModal = useCallback(() => {
        setOpenAddModal(true);
    }, []);

    const onCloseAddModal = useCallback(() => {
        setOpenAddModal(false);
    }, []);

    const onDeleteService = useCallback((id: number) => {
        if (ready) {
            execAsync(SQL_DELETE_SERVICE(id));
            setServicesCostRefreshCounter(servicesCostRefreshCounter + 1);
        }
    }, [ready, execAsync, servicesCostRefreshCounter]);

    const onDiscountUpdate = useCallback((id: number, discount: number) => {
        if (ready) {
            execAsync(SQL_UPDATE_SERVICE_DISCOUNT(id, discount));
            setServicesCostRefreshCounter(servicesCostRefreshCounter + 1);
        }
    }, [ready, execAsync, servicesCostRefreshCounter]);

    const onAddServices = useCallback(async (servicesToAdd: IService[]) => {
        for (const service of servicesToAdd) {
            try {
                await execAsync(SQL_INSERT_NEW_INSPECTION_SERVICE(inspectionState.id!, service.description, service.price));
            } catch (e) {
                console.error(e);
            }
        }
        setServicesCostRefreshCounter(servicesCostRefreshCounter + 1);
        setOpenAddModal(false);
    }, [ready, services, inspectionState.id, execAsync, servicesCostRefreshCounter]);

    const onAddPayment = useCallback(async () => {
        await execAsync(SQL_INSERT_INVOICE_PAYMENT(invoiceId!));
        const invoicePaymentsResults = await getAllAsync(SQL_GET_INVOICE_PAYMENTS(invoiceId!));
        setPayments(invoicePaymentsResults as IInvoicePayment[]);
    }, [invoiceId, execAsync, getAllAsync]);

    return (
        uiReady ? (
            <ScrollView>
                <View style={{ flex: 1, padding: 8 }}>
                    <View style={{ paddingTop: 24 }}>
                        <Text>
                            <Subheading>{"Fee"}</Subheading>
                        </Text>
                        <View>
                            <CurrencyInput
                                renderTextInput={textInputProps =>
                                    <TextInput
                                        {...textInputProps}
                                        selectionColor={undefined}
                                    />}
                                prefix="$"
                                delimiter=","
                                separator="."
                                precision={2}
                                minValue={0}
                                value={fee}
                                onChangeValue={onFeeChange} />
                        </View>
                    </View>
                    <View style={{ paddingTop: 24 }}>
                        <Text>
                            <Subheading>{"Discount"}</Subheading>
                        </Text>
                        <View>
                            <CurrencyInput
                                renderTextInput={textInputProps =>
                                    <TextInput
                                        {...textInputProps}
                                        selectionColor={undefined}
                                    />}
                                prefix="$"
                                delimiter=","
                                separator="."
                                precision={2}
                                minValue={0}
                                value={discount}
                                onChangeValue={onDiscountChange} />
                        </View>
                    </View>
                    <View style={{ paddingTop: 24 }}>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Subheading>Payment methods:</Subheading>
                            <Button onPress={onAddPayment}>Add payment method</Button>
                        </View>
                        {payments.map((p) => (
                            <View key={p.id} style={{ paddingTop: 8 }}>
                                <Payment
                                    id={p.id}
                                    method={p.paymentMethod}
                                    onPaymentMethodChange={onPaymentMethodChange}
                                    amount={p.amount.toString()}
                                    onAmountChange={onAmountChange}
                                    checkNumber={p.checkNumber}
                                    onCheckNumberChange={onCheckNumberChange}
                                    onDeleteClick={onDeletePayment}
                                />
                            </View>
                        ))}
                    </View>
                    <View style={{ paddingTop: 24 }}>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Subheading>Additional Services:</Subheading>
                            <Button onPress={onOpenAddModal}>Add service</Button>
                        </View>
                        {services.map((s) => (
                            <View key={s.id} style={{ paddingTop: 8 }}>
                                <ServiceListItemView service={s} onDelete={onDeleteService} onDiscountUpdate={onDiscountUpdate} />
                            </View>
                        ))}
                    </View>
                    <View style={{ paddingTop: 24 }}>
                        <Subheading>{`Total: ${(formatCurrency({ amount: (total !== null && total > 0) ? total : 0, code: "USD" })[0])}`}</Subheading>
                    </View>
                </View>
                {openAddModal && <AddServiceToInvoiceModal onCancel={onCloseAddModal} onDone={onAddServices} />}
            </ScrollView>
        ) : (
            <View style={{ flex: 1, padding: 8 }}><ProgressBar indeterminate={true} /></View>
        )
    )
}

export default memo(InvoiceTab, () => true);