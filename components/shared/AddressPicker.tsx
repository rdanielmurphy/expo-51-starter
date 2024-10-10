import React from 'react'
import { Text, StyleSheet, View } from 'react-native';
import { Button, Subheading, useTheme } from 'react-native-paper';
import { AddressModal } from '../modals/AddressModal';
import { IAddress } from '../../lib/types';

interface IAddressPickerProps {
    editMode?: boolean
    value?: IAddress
    onChange: (value: IAddress) => void
}

export const AddressPicker = (props: IAddressPickerProps) => {
    const { colors } = useTheme();
    const [showModal, setShowModal] = React.useState(false);
    const addr = props.value ? props.value : undefined;

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Subheading>Address:</Subheading>
            <Button mode="contained" icon="pencil" style={styles.container} onPress={() => setShowModal(true)}>
                {addr === undefined && <Text>Add New Address</Text>}
                {addr !== undefined && <Text>{`${addr.addr1}`}</Text>}
                {addr !== undefined && addr.addr2 !== undefined && <Text>{`${addr.addr2}`}</Text>}
                {addr !== undefined &&
                    <Text>{`${addr.city}, ${addr.state} ${addr.zip}`}</Text>
                }
            </Button>
            {showModal &&
                <AddressModal
                    editMode={props.editMode}
                    onClose={() => setShowModal(false)}
                    onSubmit={(value: IAddress) => {
                        props.onChange(value);
                        setShowModal(false);
                    }}
                    value={addr}
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },
});