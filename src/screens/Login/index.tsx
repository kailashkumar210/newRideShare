import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, ActivityIndicator, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import constants from '../../constants';
import Header from '../../components/Header';
import { Button, Input } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {useGlobalize} from 'react-native-globalize';
import Toast from 'react-native-simple-toast';
import { useBackHandler } from '@react-native-community/hooks'

import {connect,} from 'react-redux';
import { login_Action, reset_Password_Action } from '../../redux/actions/user'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface componentNameProps 
{ 
  Children?: React.ReactNode,
  current? : object,
}


const Login: React.FC = (props:any) => {
    // get globalize provider
    const {formatMessage} = useGlobalize();
    useBackHandler(() => navigation.isFocused());

    // Form setup
    const [username, setUsername] = useState(props.current ? props.current.username : '');
    const [password, setPassword] = useState(props.current ? props.current.password : '');
    const [isdriver, setIsDriver] = useState(props.current ? props.current.isDriver : false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    // UI block
    const [loading, setLoading]= useState(false);
    // Navigation to redirect
    let navigation = useNavigation()
    
    useEffect(()=> {
        //console.log('login loading');
        //console.log(props.app);   
    })

    // Validating username/mail to reuse between login and reset
    const validateEmail = (): boolean => {
        if (username === null || username === '') {
            setUsernameError(formatMessage('login/emptyFields'))
            return false;            
        } else {
            console.log(username)
            var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(username)){
                setUsernameError(formatMessage('login/invalidFormat'))
                return false;                
            }
        }
        return true
    }

    // When Login button is clicked
    const loginLogic = () => { 
        let _makeTheCall = true;
        
        _makeTheCall = validateEmail();

        if (password === null || password === '') {
            setPasswordError(formatMessage('login/emptyFields'))
            _makeTheCall = false;
        }        

        if (_makeTheCall) {
            setLoading(true);
            setUsernameError('');
            setPasswordError(''); 
            actions.login_Action(username, password, isdriver).then((m)=> {
                setLoading(false);
                setUsername('');
                setPassword('');
                m.message === 'success' ? 
                    navigation.navigate('Home') : 
                    null

            }).catch((m: { message: string})=>{ 
                m.message.toString() === '401' ? setPasswordError(formatMessage('login/userPassInvalid')) : setPasswordError(m.message);
                setLoading(false);
            })
        }                                
    }
    // end loginLogic

    const resetPasswordLogic = () => { 
        let _makeTheCall = validateEmail();
        
        if (_makeTheCall) {
            console.log("Called")
            setLoading(true);
            setUsernameError('');
            setPasswordError(''); 
            actions.reset_Password_Action(username).then((m)=> {
                setLoading(true);
                setUsernameError('');
                setPasswordError(''); 
                console.log(m);
                if (m.message === 'success')
                {
                    Toast.showWithGravity(formatMessage('toast_msgs/logged_in'),
                    Toast.LONG, Toast.CENTER);
                }
                else if (m.message == 500){
                    console.log(m);
                    Toast.showWithGravity(formatMessage('toast_msgs/invalid_message'),
                    Toast.LONG, Toast.CENTER);
                }
                else {
                    console.log(m);
                    Toast.showWithGravity(formatMessage('toast_msgs/problem_message'),
                    Toast.LONG, Toast.CENTER);
                }
                setLoading(false);

            }).catch((m: { message: string})=>{ 
                m.message.toString() === '500' ? setUsernameError(formatMessage('toast_msgs/invalid_message')) : setUsernameError(m.message);
                setLoading(false);
            })
        }

    }

    return (
        <View style={styles.container}>

            <Header
                headerText={ formatMessage('screen/LoginScreen')}
                leftIcon={'close'}
                onBackPress={() => navigation.navigate('LoginOptions')}
            />

            <KeyboardAwareScrollView contentContainerStyle={styles.containerKeyboard}>

                <View style={styles.mainView}>
                    <Input
                        label={formatMessage('login/email')}
                        placeholder={formatMessage('login/emailPlaceH')}
                        style={styles.textInput}
                        keyboardType="email-address"
                        selectionColor={constants.Colors.textSelectionColor}
                        autoFocus
                        value={username}
                        autoCorrect={false}
                        onChangeText={(value)=> setUsername(value)}
                        errorMessage={usernameError}
                    />
                    <Input
                        label={formatMessage('login/password')}
                        placeholder={formatMessage('login/passwordPlaceH')}                        
                        secureTextEntry
                        style={styles.textInput}
                        value={password}
                        autoCorrect={false}
                        onChangeText={(value)=> setPassword(value)}
                        errorMessage={passwordError}
                    />
                    <View style={styles.switchView}>
                        <Text>{formatMessage('login/enableDriverMode')}</Text>
                        <Switch
                            style={styles.switch}
                            trackColor={{false: '', true: constants.Colors.positiveButtonColor}}
                            onValueChange={value=> setIsDriver(value)}
                            value={isdriver}
                        />
                    </View>

                    <Button
                        containerStyle={styles.btnContainer}
                        buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
                        title={formatMessage('button/login')}
                        onPress={loginLogic}
                        disabled={loading}
                    />

                    <Button
                        containerStyle={styles.btnContainer}
                        buttonStyle={[styles.btn, { backgroundColor: constants.Colors.pink400Color }]}
                        title={formatMessage('button/resetPassword')}
                        onPress={resetPasswordLogic}
                        disabled={loading}
                    />
                </View>
            </KeyboardAwareScrollView >
            {
                loading ?(
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
                </View>
                ) : null
            }
        </View >
    );
};

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
    };
}
//same as dispatchmapto props in eS6
const actions = {login_Action, reset_Password_Action};

export default connect(mapStateToProps, actions)(Login);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        backgroundColor: constants.Colors.backgroundColor,
    },
    mainView: {
        flex: 1,
        padding: 15,
        justifyContent: 'center'
    },
    containerKeyboard: {
        flex: 1,
    },
    form: {
        flex: 1,
        width: '100%',
    },
    textInput: {
        height: 40,
        width: '100%',
        borderColor: constants.Colors.strokeGrayColor,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    switchView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        right: 0,
        marginBottom: 20
    },
    switch: {
        width: 50,
        marginLeft: 5,
        marginRight: 5
    },
    btnContainer: {
        margin: 5,
        width: '96%',
        alignSelf: 'center'
    },
    btn: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
