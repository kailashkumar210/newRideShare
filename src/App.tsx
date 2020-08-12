import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// localization
import { loadCldr, loadMessages, GlobalizeProvider } from 'react-native-globalize';
import * as RNLocalize from 'react-native-localize';

import { Provider } from 'react-redux';
import { persistor, store } from './redux/configureStore';
import { PersistGate } from 'redux-persist/integration/react';

import Colors from './constants/Colors';

//import all screens
import DrawerNavigator from './screens/Drawer/DrawerNavigator';



/// Globalize Init
// this loads the messages in the different localizations for the whole application, used in the GlobalProvider
// These are the custom messages for the application
loadMessages({
    fr: require('./localization/fr.json'),
    en: require('./localization/en.json'),
});

// to load default local currency, messages, etc from library itself
// from the library itself
loadCldr(
    require('react-native-globalize/locale-data/en'),
    require('react-native-globalize/locale-data/fr'),
);
/// End Globalize init

const App: React.FC = () => {
    __DEV__ ? console.log('Application running in DEV mode') : null;

    return (
        <Provider store={store} >
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaView style={styles.container}>
                    <GlobalizeProvider locale={
                        RNLocalize !== undefined
                            ? RNLocalize.getLocales()[0].languageCode.toLocaleLowerCase()
                            : 'en'
                    }
                        currency={
                            RNLocalize !== undefined
                                ? RNLocalize.getCurrencies()[0]
                                    .toString()
                                    .toLocaleUpperCase()
                                : 'USD'
                        }>
                        <StatusBar barStyle="light-content" hidden={false} backgroundColor={Colors.primaryColor} />
                        <NavigationContainer>
                            <DrawerNavigator />
                        </NavigationContainer>
                    </GlobalizeProvider>
                </SafeAreaView>
            </PersistGate>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

export default App;

