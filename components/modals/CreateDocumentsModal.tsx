import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native';
import { Button, Caption, ProgressBar, RadioButton } from 'react-native-paper';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { saveAndSharePdf } from '../../lib/pdfCreator';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useMembership } from '../../hooks/useMembership';
import RevenueCatUI from 'react-native-purchases-ui';
import { useErrorHandler } from '../../hooks/useErrorHandler';

enum DocumentType {
    InspectionReport = "1",
    Invoice = "2",
    PreInspectionAgreement = "3",
    Payment = "4",
}

export const CreateDocumentsModal = ({ inspectionId, onClose }: { inspectionId: number, onClose: (openPreInspectionModal?: boolean) => void }) => {
    const [value, setValue] = React.useState<string>(DocumentType.InspectionReport);
    const [building, setBuilding] = React.useState<boolean>(false);
    const { generateInspectionReport, generateInvoiceReport } = usePdfGenerator();
    const { ready, currentPlan } = useMembership();
    const { handleError } = useErrorHandler();
    const [showPaywall, setShowPaywall] = React.useState<boolean>(false);

    useEffect(() => {
        if (ready) {
            if (currentPlan === null) {
                setShowPaywall(true);
            } else {
                setShowPaywall(false);
            }
        }
    }, [currentPlan, ready]);

    const onDone = useCallback(async () => {
        setBuilding(true)

        try {
            if (value === DocumentType.InspectionReport) {
                const pdfDoc = await generateInspectionReport(inspectionId, currentPlan !== null);
                const pdfBytes = await pdfDoc.save();
                saveAndSharePdf(`report-${inspectionId}.pdf`, pdfBytes);
                onClose();
            } else if (value === DocumentType.PreInspectionAgreement) {
                onClose(true);
            } else {
                const pdfDoc = await generateInvoiceReport(inspectionId, currentPlan !== null);
                const pdfBytes = await pdfDoc.save();
                saveAndSharePdf(`invoice-${inspectionId}.pdf`, pdfBytes);
                onClose();
            }
        } catch (e) {
            console.error('error creating documents', e);
        } finally {
            setBuilding(false);
        }
    }, [currentPlan, generateInspectionReport, generateInvoiceReport, value]);

    const onCancel = useCallback(() => onClose(), [])

    const handlePaywallOpenClick = useCallback(async () => {
        try {
            const result = await RevenueCatUI.presentPaywall();
            if (result === 'PURCHASED') {
                setShowPaywall(false);
            }
        } catch (e: Error | any) {
            handleError("useMembership", "configure", e?.message, e?.stack);
        }
    }, []);

    return (
        <Dialog
            visible={true}
            title={"Generate Report"}
            buttons={(
                <ModalButtons
                    confirmDisabled={building || !ready}
                    confirmText={"Create"}
                    cancelDisabled={building || !ready}
                    cancelAction={onCancel}
                    confirmAction={onDone} />
            )}
            onTouchOutside={onCancel}>
            <View>
                {(building || !ready) && <ProgressBar indeterminate={true} />}
                <View style={styles.formComponent}>
                    {/* {showPaywall && (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Caption>Members don't have a watermark on their documents</Caption>
                            <Button disabled={building || !ready} mode="text" onPress={handlePaywallOpenClick}>
                                Upgrade now
                            </Button>
                        </View>
                    )} */}
                    <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
                        <RadioButton.Item disabled={building || !ready} label="Inspection Report" value={DocumentType.InspectionReport} />
                        <RadioButton.Item disabled={building || !ready} label="Invoice" value={DocumentType.Invoice} />
                        <RadioButton.Item disabled={building || !ready} label="Pre-Inspection Agreement" value={DocumentType.PreInspectionAgreement} />
                    </RadioButton.Group>
                </View>
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    formComponent: {
        paddingRight: 10,
        paddingLeft: 10,
    }
});
