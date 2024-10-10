import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Headline, Modal, Portal } from 'react-native-paper';
import SignatureScreen from "react-native-signature-canvas";

interface IProps {
    onCancel: () => void
    onSubmit: (signature?: string) => void
}

export const AddSignatureModal = (props: IProps) => {
    const [signature, setSignature] = useState<string>();
    const ref = useRef();

    const onClear = useCallback(() => {
        if (ref?.current) {
            // @ts-ignore
            ref.current.clearSignature();
            setSignature("");
        }
    }, [ref]);
    const onClose = useCallback(() => props.onCancel(), [])
    const onSubmit = useCallback(() => {
        props.onSubmit(signature);
    }, [signature])

    // Called after ref.current.readSignature() reads a non-empty base64 string
    const handleOK = useCallback((signature: any) => {
        setSignature(signature);
    }, [signature])

    // Called after ref.current.clearSignature()
    const handleClear = useCallback(() => {
        setSignature("");
    }, [])

    // Called after end of stroke
    const handleEnd = useCallback(() => {
        if (ref?.current) {
            // @ts-ignore
            ref.current.readSignature();
        }
    }, [ref])

    return (
        <Portal>
            <Modal visible={true} onDismiss={onClose} contentContainerStyle={styles.containerStyle}>
                <Headline>Sign in the white area</Headline>

                <View style={styles.signatureContainer}>
                    <SignatureScreen
                        // @ts-ignore
                        ref={ref!}
                        onEnd={handleEnd}
                        onOK={handleOK}
                        onClear={handleClear}
                        descriptionText={"Sign here"}
                        style={styles.signatureView}
                    />
                </View>
                <View style={styles.buttons}>
                    <Button mode="text" onPress={onClear}>Clear</Button>
                    <Button mode="text" onPress={onClose}>Cancel</Button>
                    <Button mode="text" onPress={onSubmit}>Done</Button>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
    },
    signatureContainer: {
        height: 200,
        width: "100%",
        overflow: "hidden",
    },
    signatureView: {
        overflow: "hidden",
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
    },
})
