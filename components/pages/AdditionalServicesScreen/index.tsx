import React, { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { DefaultServicesTab } from './components/DefaultServicesTab';
import { CustomServicesTab } from './components/CustomServicesTab';
import { primary, tertiary } from '../../../lib/colors';
import { Button, ProgressBar } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import { TextInput } from 'react-native-paper';
import { SQL_GET_SERVICES, SQL_INSERT_NEW_SERVICE } from '../../../lib/sqlCommands';
import { IService } from '../../../lib/types';
import * as SQLite from 'expo-sqlite/next';
import { ModalButtons } from '../../shared/ModalButtons';
import { useDbContext } from '../../../contexts/DbContext';

export interface IServiceTabProps {
    services?: IService[]
}

export const AdditionalServicesScreen = ({ navigation }: any) => {
    const layout = useWindowDimensions();
    const { ready, execAsync, getAllAsync } = useDbContext();
    const [openAddModal, setOpenAddModal] = React.useState<boolean>(false);
    const [newServiceName, setNewServiceName] = React.useState<string>("");
    const [uiReady, setUiReady] = React.useState<boolean>(false);
    const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
    const [routes, setRoutes] = React.useState<any[]>([]);
    const [scenes, setScenes] = React.useState<any>();
    const [index, setIndex] = React.useState(0);

    useEffect(() => {
        const getData = async () => {
            let customServices: IService[] = [];
            let defaultServices: IService[] = [];
            const theScenes = {};

            try {
                setUiReady(false);
                const servicesRes = await getAllAsync(SQL_GET_SERVICES);
                const theServices: IService[] = [];
                for (let i = 0; i < servicesRes.length; i++) {
                    const s = servicesRes[i];
                    theServices.push({
                        id: s.id,
                        description: s.description,
                        price: s.price,
                        discount: s.discount,
                        scriptId: s.scriptId,
                        account_id: s.account_id,
                        master: s.master,
                        isCustom: s.isCustom,
                        enabled: s.enabled,
                    });
                }

                customServices = theServices.filter(s => s.master !== 1 && s.isCustom === 1);
                defaultServices = theServices.filter(s => s.master === 1 && s.isCustom !== 1);
                setRoutes([
                    { key: 'defaultServices', title: 'Default Services' },
                    { key: 'customServices', title: 'Custom Services' },
                ]);
                // @ts-ignore
                theScenes['defaultServices'] = ({ route }: any) => (
                    <DefaultServicesTab
                        services={defaultServices}
                    />);
                // @ts-ignore
                theScenes['customServices'] = ({ route }: any) => (
                    <CustomServicesTab
                        services={customServices}
                    />);
                setScenes(theScenes);

                setUiReady(true);
            } catch (e) {
                console.error('fail', e)
            }
        }

        if (ready) {
            getData();
        }
    }, [refreshCounter, ready, execAsync]);

    const onCloseAddModal = useCallback(() => {
        setNewServiceName("");
        setOpenAddModal(false);
    }, []);

    const onOpenAddModal = useCallback(() => {
        setNewServiceName("");
        setOpenAddModal(true);
    }, []);

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => index === 1 ? (
                <Button onPress={onOpenAddModal}>Add service</Button>
            ) : undefined,
        });
    }, [index, navigation]);

    const onServiceNameChangeText = useCallback((text: string) => {
        setNewServiceName(text);
    }, []);

    const onAdd = useCallback(() => {
        if (ready) {
            execAsync(SQL_INSERT_NEW_SERVICE(newServiceName));
            setRefreshCounter(refreshCounter + 1);
            onCloseAddModal();
        }
    }, [ready, execAsync, newServiceName, refreshCounter, onCloseAddModal]);

    return !uiReady ? (
        <View style={{ flex: 1, padding: 8 }}><ProgressBar indeterminate={true} /></View>
    ) : (
        <>
            <TabView
                navigationState={{ index, routes }}
                renderScene={SceneMap(scenes)}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={props => (
                    <TabBar
                        {...props}
                        scrollEnabled={true}
                        tabStyle={{ width: layout.width / 2 }}
                        pressColor={tertiary}
                        indicatorStyle={{ backgroundColor: tertiary }}
                        indicatorContainerStyle={{ backgroundColor: primary }}
                    />
                )}
            />
            <Dialog
                visible={openAddModal}
                title="Add new service"
                buttons={(
                    <ModalButtons
                        confirmText='Add'
                        confirmDisabled={newServiceName.length === 0}
                        cancelAction={onCloseAddModal}
                        confirmAction={onAdd} />
                )}
                onTouchOutside={onCloseAddModal}>
                <View>
                    <TextInput
                        autoComplete='off'
                        label="Name"
                        value={newServiceName}
                        onChangeText={onServiceNameChangeText}
                    />
                </View>
            </Dialog>
        </>
    )
}