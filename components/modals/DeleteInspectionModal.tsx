import React, { useState } from 'react'
import { Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { SQL_DELETE_OVERVIEW_SECTION, SQL_DELETE_SUMMARY_SECTIONS, SQL_DELETE_SUMMARY_SUBSECTIONS, SQL_GET_INSPECTION, SQL_GET_SUMMARY_SECTION_IDS, SQL_DELETE_SECTION, SQL_DELETE_SUBSECTION, SQL_DELETE_OPTION, SQL_DELETE_VALUE, SQL_DELETE_VALUE_OPTION, SQL_DELETE_OVERVIEW, SQL_DELETE_SUMMARY, SQL_DELETE_INSPECTION, SQL_DELETE_SCRIPT, SQL_DELETE_INVOICE, SQL_DELETE_INVOICE_PAYMENTS } from '../../lib/sqlCommands';
import { Dialog } from 'react-native-simple-dialogs';
import { ModalButtons } from '../shared/ModalButtons';
import { useDbContext } from '../../contexts/DbContext';

interface IProps {
    inspectionId: number
    onClose: () => void
    onSubmit: () => void
}

export const DeleteInspectionModal = (props: IProps) => {
    const { execAsync, getFirstAsync, getAllAsync } = useDbContext();
    const [deleting, setDeleting] = useState<boolean>(false);

    const deleteInspection = async (inspectionId: number) => {
        try {
            setDeleting(true);
            const theInspectionObject = await getFirstAsync(SQL_GET_INSPECTION(inspectionId));
            const summarySections = await getAllAsync(SQL_GET_SUMMARY_SECTION_IDS(theInspectionObject.summaryId));
            const summarySectionIdsArray = summarySections.map((s) => s.id);

            await execAsync(SQL_DELETE_OVERVIEW_SECTION(theInspectionObject.overviewId));
            await execAsync(SQL_DELETE_SUMMARY_SUBSECTIONS(summarySectionIdsArray));
            await execAsync(SQL_DELETE_SUMMARY_SECTIONS(summarySectionIdsArray));
            await execAsync(SQL_DELETE_SECTION(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_SUBSECTION(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_OPTION(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_VALUE(theInspectionObject.scriptId));
            execAsync(SQL_DELETE_VALUE_OPTION(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_OVERVIEW(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_SUMMARY(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_INVOICE(theInspectionObject.invoiceId));
            execAsync(SQL_DELETE_INVOICE_PAYMENTS(theInspectionObject.invoiceId));
            await execAsync(SQL_DELETE_INSPECTION(theInspectionObject.scriptId));
            await execAsync(SQL_DELETE_SCRIPT(theInspectionObject.scriptId));
        } catch (e) {
            console.error('error deleting inspection', e);
        }
        finally {
            setDeleting(false);
            props.onSubmit();
        }
    }

    return (
        <Dialog
            visible={true}
            title="Delete Inspection"
            buttons={(
                <ModalButtons
                    cancelAction={props.onClose}
                    confirmAction={() => deleteInspection(props.inspectionId)}
                    confirmText='Delete' />
            )}>
            <View>
                {deleting && <ProgressBar indeterminate={true} />}
                {!deleting && (
                    <>
                        <Text>Are you sure you want to delete this inspection?</Text>
                    </>
                )}
            </View>
        </Dialog >
    )
}
