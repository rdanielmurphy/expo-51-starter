import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, Text, Subheading } from 'react-native-paper';
import { SQL_GET_SERVICES } from '../../lib/sqlCommands';
import { removeItemAll } from '../../lib/arrayHelpers';
import { IService } from '../../lib/types';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IAddServiceToInvoiceModalProps {
    onCancel: () => void
    onDone: (list: IService[]) => void
}

export const AddServiceToInvoiceModal = ({ onCancel, onDone }: IAddServiceToInvoiceModalProps) => {
    const { ready, getAllAsync } = useDbContext();
    const screen = Dimensions.get("screen");
    const [loading, setLoading] = useState<boolean>(true);
    const [services, setServices] = useState<IService[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [checkboxClickedNum, setCheckboxClickedNum] = useState<number>(0);

    const onClose = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const onSubmit = useCallback(() => {
        const list: IService[] = [];
        for (let i = 0; i < selectedServices.length; i++) {
            const service = services.find(s => s.id === selectedServices[i]);
            if (service) {
                list.push(service);
            }
        }
        onDone(list);
        setSelectedServices([]);
    }, [onDone, services, selectedServices]);

    const checkboxClicked = useCallback((id: number) => {
        const index = selectedServices.findIndex(i => i === id);
        if (index > -1) {
            setSelectedServices(removeItemAll(selectedServices, id));
        } else {
            setSelectedServices([id, ...selectedServices]);
        }
        setCheckboxClickedNum(checkboxClickedNum + 1);
    }, [selectedServices, checkboxClickedNum]);

    useEffect(() => {
        const getServices = async () => {
            setLoading(true);
            try {
                const rows = await getAllAsync(SQL_GET_SERVICES);
                setServices(rows.filter((r: IService) => r.enabled === 1 && (r.master === 1 || r.isCustom === 1)));
                setLoading(false);
            } catch (e) {
                console.error(e);
            }
        }

        if (ready) {
            getServices();
        }
    }, [ready, getAllAsync]);

    const renderTheRows = useMemo(() => {
        return services.map((s: IService) => {
            const checkStatus = selectedServices.indexOf(s.id) > -1 ? "checked" : "unchecked";
            return (
                <View key={s.id} style={styles.service}>
                    <Text style={{ flex: 4 }} onPress={() => checkboxClicked(s.id)}>
                        <Subheading>{s.description}</Subheading>
                    </Text>
                    <View style={{ flex: 1 }}>
                        <Subheading>${s.price}</Subheading>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Checkbox
                            status={checkStatus}
                            onPress={() => checkboxClicked(s.id)}
                        />
                    </View>
                </View>
            )
        })
    }, [loading, services.length, selectedServices.length, checkboxClickedNum]);

    return (
        <Dialog
            visible={true}
            title="Add Service to Invoice"
            buttons={(
                <ModalButtons
                    confirmDisabled={!ready || loading || services.length === 0 || selectedServices.length === 0}
                    confirmText={"Save"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            {!loading &&
                <View>
                    {services.length > 0 &&
                        <ScrollView style={{ maxHeight: screen.height - 250 }}>
                            {renderTheRows}
                        </ScrollView>
                    }
                    {services.length === 0 && (
                        <Text>No services found. Add and enable services in the Administration screen</Text>
                    )}
                </View>
            }
        </Dialog>
    )
}

const styles = StyleSheet.create({
    service: {
        flexDirection: 'row',
        alignItems: 'baseline',
        alignContent: 'space-between',
        width: "auto",
        height: "auto",
    },
    scrollView: {
        marginHorizontal: 0,
    },
    button: {
        margin: 10,
        width: 400,
    },
    buttons: {
        flexDirection: 'row',
        height: 50,
        alignContent: "space-between",
    },
    checkboxText: {
        marginTop: 10,
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    }
});
