import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { store } from '../../redux/configureStore';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');


interface componentNameProps { }

const Splash: React.FC = () => {

    const navigation = useNavigation();

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
    console.log('Splash UseEffect ');
        const _store = store.getState();
        //console.log(_store.vehicles);
        // console.log('authorized?');
        // console.log(_store.authReducer);
        // check user already logged-In (if user have persisted data then navigate to home otherwise auth screen)
        setTimeout(() => {
            _store.appReducer.authorized ? navigation.navigate('Home') : navigation.navigate('LoginOptions');
        }, 1000);
    },[]);

    //console.log('Splash shown');
    return (

        <ImageBackground
            source={require('../../assets/SplashScreen.png')}
            style={{ height: '100%', width: '100%' }}
            resizeMode={'stretch'}
        />

    )
}

export default Splash;

const styles = StyleSheet.create({

});