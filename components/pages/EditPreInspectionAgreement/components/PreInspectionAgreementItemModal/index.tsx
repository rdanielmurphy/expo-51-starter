import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, TouchableHighlight, StyleSheet, View } from 'react-native';
import { RadioButton, Subheading, Surface } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../../../../shared/ModalButtons';

interface IProps {
    onClose: () => void
    onSubmit: (value: string) => void
}

interface IItem {
    id: string
    name: string
}

export const PreInspectionAgreementItemModal = (props: IProps) => {
    const [itemList, setItemList] = useState<IItem[]>();
    const [selectedItem, setSelectedItem] = useState<IItem | undefined>();

    const onClose = () => props.onClose();
    const onSubmit = useCallback(() => {
        if (selectedItem) {
            props.onSubmit(selectedItem.id);
        } else {
            props.onClose();
        }
    }, [selectedItem]);

    useEffect(() => {
        setItemList([
            { id: `<AGENTNAME>`, name: 'Agent Name' },
            { id: `<CLIENTADDRESS>`, name: 'Client Address' },
            { id: `<CLIENTNAME>`, name: 'Client Name' },
            { id: `<CLIENTSIGNATURES>`, name: 'Client Signatures' },
            { id: `<CLIENTS>`, name: 'Clients' },
            { id: `<COMPANYNAME>`, name: 'Company Name' },
            { id: `<COMPANYCSZ>`, name: 'Company City, State, Zip' },
            { id: `<COMPANYSTREETADDRESS>`, name: 'Company Street Address' },
            { id: `<CURRENTDATE>`, name: 'Current Date' },
            { id: `<INSPECTIONADDRESS>`, name: 'Inspection Address' },
            { id: `<INSPECTIONDATE>`, name: 'Inspection Date' },
            { id: `<FEES>`, name: 'Inspection Fees Total' },
            { id: `<INSPSTATE>`, name: 'Inspection State' },
            { id: `<SIGNATURE>`, name: 'Inspector Signature' },
            { id: `<NOTVALIDIN>`, name: 'Not Valid In' },
            { id: `<EXCLUSIONS>`, name: 'Exclusions' },
            { id: `<LICENSE>`, name: 'License' },
            { id: `<PAGEBREAK>`, name: 'Page Break' },
            { id: `<REPORTNUMBER>`, name: 'Report Number' },
            { id: `Buyer's Agent Present: Yes <BPY>  No <BPN>`, name: 'Buyer\'s Agent Present' },
            { id: `Seller's Agent present: Yes <APY>  No <APN>`, name: 'Seller\'s Agent Present' },
        ].sort((a, b) => a.name.localeCompare(b.name)));
    }, []);

    return (
        <Dialog
            visible={true}
            title={"Pre-Inspection Agreement Item"}
            buttons={(
                <ModalButtons
                    confirmDisabled={selectedItem === undefined}
                    confirmText={"Add"}
                    cancelAction={onClose}
                    confirmAction={onSubmit} />
            )}
            onTouchOutside={onClose}>
            <View>
                <FlatList
                    data={itemList}
                    keyExtractor={(_item, index) => index.toString()}
                    renderItem={({ item, index, separators }) => (
                        <Surface key={item.id} style={styles.surface}>
                            <TouchableHighlight
                                key={index}
                                onPress={() => { }}
                                activeOpacity={0.6}
                                underlayColor="#DDDDDD"
                                onShowUnderlay={separators.highlight}
                                onHideUnderlay={separators.unhighlight}>
                                <View key={item.id} style={styles.view}>
                                    <View style={{ flex: 1, flexBasis: '85%' }}>
                                        <Subheading onPress={() => setSelectedItem(item)}>{item.name}</Subheading>
                                    </View>
                                    <View style={{ flex: 1, flexBasis: '15%' }}>
                                        <RadioButton
                                            value="first"
                                            status={selectedItem !== undefined && selectedItem.id === item.id ? 'checked' : 'unchecked'}
                                            onPress={() => setSelectedItem(item)}
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </Surface>
                    )}
                />
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    surface: {
        margin: 5,
    },
    containerStyle: {
        backgroundColor: 'white',
        margin: 20,
    },
    formComponent: {
        padding: 10
    },
    view: {
        flexDirection: "row",
        marginLeft: 20,
        alignItems: "center",
    }
});

