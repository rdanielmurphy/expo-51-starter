import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Headline, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../../redux/actions';
import GenericSectionTab from '../../../../tabs/GenericSectionTab';
import DetailsTab from '../../../../tabs/DetailsTab';
import InvoiceTab from '../../../../tabs/InvoiceTab';
import { PhotosTab } from '../../../../tabs/PhotosTab';
import { SummaryTab } from '../../../../tabs/SummaryTab';
import OverviewTab from '../../../../tabs/OverviewTab';
import { InspectionState } from '../../../../../redux/reducers/inspection';
import { EditableGenericSectionTab } from '../../../../tabs/EditableGenericSectionTab';
import EditTemplateHelpTab from '../../../EditTemplateScreen/components/EditTemplateHelpTab';
import EditInspectionHelpTab from '../../../EditTemplateScreen/components/EditInspectionHelpTab';

export interface IInspectionNavigationDrawerItems {
    dynamicItems: IListItem[]
    hash: string
}

export interface IListItem {
    id: number
    label: string
    order: number
}

export interface IInspectionNavigationDrawerProps {
    editMode: boolean
    templateMode?: boolean
    drawerItems: IInspectionNavigationDrawerItems
    initialRoute?: string
    inFlight?: boolean
    onDotsVerticalPress: (event: any) => void
    onShapeCirclePlusPress: (event: any) => void
    onRefreshData?: (routeName: string, routeId: number) => void
}

export const GENERIC_SECTION_ROUTE_KEY = 'GenericSectionRoute';
export const GENERIC_EDIT_ROUTE_KEY = 'Inspection template';

export const HeaderTitle = memo((props: any) => {
    return (
        <View onTouchStart={props.onClick} style={{ minWidth: 100 }}>
            <Headline>
                {props.title}
            </Headline>
        </View>
    );
}, (prevProps, nextProps) => {
    return prevProps.title === nextProps.title;
})

const GenericSectionTabWrapper = memo(({ navigation, route }: any) => {
    return (
        <GenericSectionTab
            navigate={navigation.navigate}
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.navigation === nextProps.navigation;
});

const GenericTemplateSectionTabWrapper = memo(({ navigation, route }: any) => {
    return (
        <GenericSectionTab
            navigate={navigation.navigate}
            templateMode
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.navigation === nextProps.navigation;
});

const EditableGenericSectionTabWrapper = memo(({ navigation, route }: any) => {
    return route.params ? (
        <EditableGenericSectionTab
            sectionId={route.params.sectionId}
            sectionName={route.params.sectionName}
            navigate={navigation.navigate}
            refreshParent={route.params.refreshParent}
        />
    ) : <View></View>;
}, (prevProps, nextProps) => {
    return prevProps.route.params && nextProps.route.params &&
        prevProps.route.params.sectionId === nextProps.route.params.sectionId;
});

const DrawerContent = (props: any) => {
    const dispatch = useDispatch();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);

    return (
        <DrawerContentScrollView {...props}>
            {!props.editMode && !props.templateMode && (
                <>
                    <DrawerItem
                        focused={props.state.index === 0 && inspectionState.section_id === undefined}
                        label="Details"
                        onPress={() => {
                            updateSection({ section_id: undefined })(dispatch);
                            props.navigation.navigate('Details');
                            props.navigation.closeDrawer();
                        }}
                    />
                    <DrawerItem
                        focused={props.state.index === 1 && inspectionState.section_id === undefined}
                        label="Invoice"
                        onPress={() => {
                            updateSection({ section_id: undefined })(dispatch);
                            props.navigation.navigate('Invoice');
                            props.navigation.closeDrawer();
                        }}
                    />
                    <DrawerItem
                        focused={props.state.index === 2 && inspectionState.section_id === undefined}
                        label="Photos"
                        onPress={() => {
                            updateSection({ section_id: undefined })(dispatch);
                            props.navigation.navigate('Photos');
                            props.navigation.closeDrawer();
                        }}
                    />
                    <DrawerItem
                        focused={props.state.index === 3 && inspectionState.section_id === undefined}
                        label="Summary"
                        onPress={() => {
                            updateSection({ section_id: undefined })(dispatch);
                            props.navigation.navigate('Summary');
                            props.navigation.closeDrawer();
                        }}
                    />
                    <DrawerItem
                        focused={props.state.index === 4 && inspectionState.section_id === undefined}
                        label="Overview"
                        onPress={() => {
                            updateSection({ section_id: undefined })(dispatch);
                            props.navigation.navigate('Overview');
                            props.navigation.closeDrawer();
                        }}
                    />
                </>
            )}
            {props.dynamicItems.map((item: any) => (
                <DrawerItem
                    focused={inspectionState.section_id === item.id}
                    key={item.id}
                    label={item.label}
                    onPress={() => {
                        props.navigation.navigate(GENERIC_SECTION_ROUTE_KEY, {
                            sectionId: item.id,
                            sectionName: item.label,
                            refreshParent: props.refreshParent,
                        });
                        updateSection({ section_id: item.id })(dispatch);
                        props.navigation.closeDrawer();
                    }}
                />
            ))}
        </DrawerContentScrollView>
    );
};

const InspectionNavigationDrawer = ({
    editMode,
    templateMode,
    drawerItems,
    initialRoute,
    onDotsVerticalPress,
    onShapeCirclePlusPress,
    onRefreshData,
}: IInspectionNavigationDrawerProps) => {
    const Drawer = createDrawerNavigator();
    const inspectionState: InspectionState = useSelector((state: any) => state.inspectionState);
      
    const options = useCallback(({ navigation }: any) => ({
        headerShown: true,
        headerTitle: (props: any) => {
            let title = props.children;

            if (props.children === GENERIC_SECTION_ROUTE_KEY) {
                const item = drawerItems.dynamicItems.find(i =>
                    i.id === inspectionState.section_id
                );
                if (item) {
                    title = item.label;
                } else {
                    title = "";
                }
            }

            return (
                <HeaderTitle title={title} onClick={() => navigation.openDrawer()} />
            )
        }
    }), [drawerItems, inspectionState.section_id]);

    const headerRight = useMemo(() => (
        <View style={{ flexDirection: 'row', width: 100 }}>
            <IconButton
                icon="shape-circle-plus"
                size={20}
                onPress={onShapeCirclePlusPress}
            />
            <IconButton
                icon="dots-vertical"
                size={20}
                onPress={onDotsVerticalPress}
            />
        </View>
    ), [onShapeCirclePlusPress, onDotsVerticalPress]);

    return (
        <Drawer.Navigator
            initialRouteName={initialRoute}
            drawerContent={(props: DrawerContentComponentProps) => {
                if (editMode && props.state.routes[0].params === undefined && 
                    inspectionState.section_id !== undefined &&
                    inspectionState.section_id >= 0) {
                    props.navigation.navigate(GENERIC_SECTION_ROUTE_KEY, {
                        sectionId: inspectionState.section_id,
                        sectionName: initialRoute,
                        refreshParent: onRefreshData,
                    });
                }

                return (
                    <DrawerContent
                        dynamicItems={drawerItems.dynamicItems}
                        editMode={editMode}
                        templateMode={templateMode}
                        refreshParent={onRefreshData}
                        {...props}
                    />
                )
            }}
            screenOptions={{
                drawerType: 'slide',
                headerRight: () => headerRight,
            }}>
            {(editMode || templateMode) && (inspectionState.section_id === undefined || inspectionState.section_id <= -1) && (
                <Drawer.Screen
                    navigationKey={GENERIC_EDIT_ROUTE_KEY}
                    key={GENERIC_EDIT_ROUTE_KEY}
                    name={GENERIC_EDIT_ROUTE_KEY}
                    component={templateMode ? EditTemplateHelpTab : EditInspectionHelpTab}
                    options={options} />
            )}
            {!editMode && !templateMode && (
                <Drawer.Screen
                    key={"Details"}
                    name={"Details"}
                    component={DetailsTab}
                    options={options} />
            )}
            {!editMode && !templateMode && (
                <Drawer.Screen
                    key={"Invoice"}
                    name={"Invoice"}
                    component={InvoiceTab}
                    options={options} />
            )}
            {!editMode && !templateMode && (
                <Drawer.Screen
                    key={"Photos"}
                    name={"Photos"}
                    component={PhotosTab}
                    options={options} />
            )}
            {!editMode && !templateMode && (
                <Drawer.Screen
                    key={"Summary"}
                    name={"Summary"}
                    component={SummaryTab}
                    options={options} />
            )}
            {!editMode && !templateMode && (
                <Drawer.Screen
                    key={"Overview"}
                    name={"Overview"}
                    component={OverviewTab}
                    options={options} />
            )}
            <Drawer.Screen
                navigationKey={GENERIC_SECTION_ROUTE_KEY}
                key={GENERIC_SECTION_ROUTE_KEY}
                name={GENERIC_SECTION_ROUTE_KEY}
                component={editMode ? EditableGenericSectionTabWrapper : (
                    templateMode ? GenericTemplateSectionTabWrapper : GenericSectionTabWrapper)}
                options={options} />
        </Drawer.Navigator>
    );
}

export default memo(InspectionNavigationDrawer, (prevProps, nextProps) =>
    prevProps.drawerItems.hash === nextProps.drawerItems.hash &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.inFlight === nextProps.inFlight &&
    prevProps.initialRoute === nextProps.initialRoute
);