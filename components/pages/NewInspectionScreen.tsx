import React, { useCallback } from 'react'
import { NewInspectionForm } from '../shared/NewInspectionForm';
import { View } from 'react-native';

export const NewInspectionScreen = (navigation: any) => {
    const onSubmit = useCallback((inspectionId: number) => {
        navigation.navigation.navigate("EditInspectionReport", { id: inspectionId });
    }, []);

    const onCancel = useCallback(() => {
        navigation.navigation.goBack();
    }, []);

    return (
        <View style={{ paddingLeft: 8, paddingRight: 8 }}>
            <NewInspectionForm
                onClose={onCancel}
                onSubmit={onSubmit}
            />
        </View>
    )
};
