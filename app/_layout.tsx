import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React from 'react';
import "@expo/match-media";
import { Provider as PaperProvider } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import { MainScreen } from '../components/MainScreen';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../redux/reducers';
import thunk from 'redux-thunk';
import { EmojiProvider } from '@/contexts/EmojiContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { background, primary, secondary, tertiary } from '@/lib/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DbProvider } from '@/contexts/DbContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createStackNavigator();

const AppRouter = () => {
  return (
    <Provider store={store}>
      <DbProvider>
        <EmojiProvider>
          <SnackbarProvider>
            <Stack.Navigator initialRouteName="Main">
              <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
              {/* <Stack.Screen name="NewInspection" component={NewInspectionScreen} options={{ title: 'New Inspection' }} />
                                <Stack.Screen name="EditInspectionReport" component={InspectionReportEditorScreen} options={{ headerShown: false, title: 'Inspection Report' }} />
                                <Stack.Screen name="ExistingReports" component={ExistingReportsScreen} options={{ title: 'Existing Reports' }} />
                                <Stack.Screen name="Administration" component={AdministrationScreen} options={{ title: 'Administration' }} />
                                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
                                <Stack.Screen name="SqlTablesView" component={TablesScreen} options={{ title: 'SQL Tables View' }} />
                                <Stack.Screen name="SqlTableView" component={TableScreen} options={{ title: 'SQL Table View' }} />
                                <Stack.Screen name="EditPhoto" component={EditPhotoScreen} options={{ title: 'Edit Photo' }} />
                                <Stack.Screen name="SectionPhotosList" component={SectionPhotosListScreen} options={{ title: 'Photos' }} />
                                <Stack.Screen name="SubsectionPhotosList" component={SubsectionPhotosListScreen} options={{ title: 'Photos' }} />
                                <Stack.Screen name="CompanyInfo" component={CompanyInfoScreen} options={{ title: 'Company Info' }} />
                                <Stack.Screen name="InspectorInfo" component={InspectorInfoScreen} options={{ title: 'Inspector Info' }} />
                                <Stack.Screen name="InspectionTemplates" component={InpsectionTemplates} options={{ title: 'Inspection Templates' }} />
                                <Stack.Screen name="EditTemplate" component={EditTemplateScreen} options={{ headerShown: false, title: 'Edit Template' }} />
                                <Stack.Screen name="AdditionalServices" component={AdditionalServicesScreen} options={{ title: 'Additional Services' }} />
                                <Stack.Screen name="EditSummary" component={EditSummaryScreen} options={{ title: 'Summary', headerTitle: (props) => <EditSummaryScreenHeader {...props} /> }} />
                                <Stack.Screen name="EditOverview" component={EditOverviewScreen} options={{ title: 'Overview', headerTitle: (props) => <EditOverviewScreenHeader {...props} /> }} />
                                <Stack.Screen name="EditComments" component={EditCommentsScreen} options={{ title: 'Comments', headerTitle: (props) => <EditCommentsScreenHeader {...props} /> }} />
                                <Stack.Screen name="EditCommentGroups" component={EditCommentGroupsScreen} options={{ title: 'Comment Groups', headerTitle: (props) => <EditCommentGroupsScreenHeader {...props} /> }} />
                                <Stack.Screen name="FileImport" component={FileImportScreen} options={{ title: 'File Import' }} />
                                <Stack.Screen name="ExportDb" component={ExportDbScreen} options={{ title: 'Database Export' }} />
                                <Stack.Screen name="MarkupStickerScreen" component={MarkupStickerScreen} options={{ headerShown: false, title: 'Markup Photo' }} />
                                <Stack.Screen name="EditPreInspectionAgreement" component={EditPreInspectionAgreement} options={{ title: 'Pre-inspection Agreement' }} />
                                <Stack.Screen name="SendErrorLog" component={SendErrorLog} options={{ title: 'Send error log' }} />
                                <Stack.Screen name="MembershipScreen" component={MembershipScreen} options={{ title: 'Membership' }} />
                                <Stack.Group screenOptions={{ presentation: "modal" }}>
                                    <Stack.Screen
                                        name="StickerModal"
                                        component={StickerModal}
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="StickerInfoModal"
                                        component={StickerInfoModal}
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                </Stack.Group> */}
            </Stack.Navigator>
          </SnackbarProvider>
        </EmojiProvider>
      </DbProvider>
    </Provider>
  );
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: primary,
    secondary: secondary,
    tertiary: tertiary,
    background: background,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={theme}>
        <AppRouter />
      </PaperProvider>
    </ThemeProvider>
  );
}
