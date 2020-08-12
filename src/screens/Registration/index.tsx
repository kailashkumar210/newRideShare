import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Switch, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { Avatar, Input, Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import Header from '../../components/Header';
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import User from '../../models/User';
import {connect,} from 'react-redux';
import { register, login_Action } from '../../redux/actions/user'
import { MAP_TYPES } from 'react-native-maps';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface RegistrationProps { }


const Registration: React.FC = (props: any) => {

    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const _newUser = new User();
    _newUser.organization.code = props.route?.params?.selectedCode ? props.route?.params?.selectedCode : '';
    // Set Moda visible false as default 
    const [modalVisible, setModalVisible] = useState(false);
    //set Dummy profile Image as default
    const [profileUrl, setProfileUrl] = useState('https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg');
    const [loading, setLoading] = useState(false);
    const [user, setUser]= useState(_newUser);
    const [emailError, setemailError]= useState('');
    const [nameError, setnameError]= useState('');
    const [cellPhoneError, setcellPhoneError]= useState('');
    const [passwordError, setpasswordError]= useState('');
    const [confirmpasswordError, setconfirmpasswordError]= useState('');
    const [confirm, setConfirm]= useState('');

    function openCamera(): any {
        setModalVisible(false);

        //Open device camera
        ImagePicker.openCamera({
            cropping: true, //if want to disable cropping then just comment this line
            mediaType: 'photo',
        }).then((image: any) => {
            console.log('camera image url', image.path);
            setProfileUrl(image.path)
        });
    }

    function openGallery(): any {
        setModalVisible(false)
        //Open the recent Images and sidebar option to get images from drive or sd card
        ImagePicker.openPicker({
            cropping: true, //if want to disable cropping then just comment this line
            height: 250,
            width: 250,
            mediaType: 'photo',
        }).then((image: any) => {
            console.log('camera image url', image.path);
            setProfileUrl(image.path)
        });
    }

    const validateBeforeRegistering = () : boolean => {
        let _isValid = true;
            setcellPhoneError('');
            setpasswordError(''); 
            setconfirmpasswordError(''); 
            setnameError(''); 
            setemailError('');

                if (user.email !== '' && user.email.length > 3){           
                    var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;                
                    _isValid= re.test(user.email)                
                    !_isValid ? setemailError(formatMessage('login/invalidFormat')) : '';
                }
                else{
                    _isValid=false;
                    setemailError(formatMessage('login/emptyFields'))
                }
                if (user.username === ''){
                    setnameError(formatMessage('login/emptyFields'))
                    _isValid=false;
                }
                if (user.phone === ''){ 
                        setcellPhoneError(formatMessage('login/emptyFields'))
                        _isValid=false;
                    }
                    else if (user.phone !=='' && user.phone.length < 9){
                        setcellPhoneError(formatMessage('registration/cellphonInvalid'))
                        _isValid=false;
                    }
                    if (user.password === ''){ 
                        setpasswordError(formatMessage('login/emptyFields'))
                        _isValid=false;
                    }
                    else if (user.password !=='' && user.password.length < 8){
                        setpasswordError(formatMessage('registration/passwordPlaceH'))
                        _isValid=false;
                    }
                    if(user.password !== confirm){
                        setconfirmpasswordError(formatMessage('registration/confirmPasswordError'))
                        _isValid=false;
                    }
                
        return _isValid;
    }
    const onInputChange = (value: string | any, type: string) => {
        let _isValid = true;
        type !== 'isDriver' ? type !== 'username' ? value = value.replace(' ','') : value.trim() : value;
        if (_isValid) {
            switch(type) {
                case 'username':
                    setUser({...user, name: value }); 
                    break;
                case 'email':
                    setUser({...user, email: value, username: value }); 
                    break;
                case 'cellphone':
                    setUser({...user, phone: value }); 
                    break;
                case 'password':
                    setUser({...user, password: value }); 
                break;                    
                case 'confirm':
                    setConfirm( value ); 
                    break;                    
                case 'isDriver':
                    setUser({...user, isDriver: value ? 1 : 0 }); 
                    break;                    
                default:
                break;
            }
        }
        else {
            // show a toast
        }
    }

    const registerUser = () => {
        if (validateBeforeRegistering()){
            setLoading(true);
            setcellPhoneError('');
            setpasswordError(''); 
            setconfirmpasswordError(''); 
            setnameError(''); 
            setemailError(''); 
            
            actions.register(user).then((m)=> {
                console.log(m);
                actions.login_Action(user.username, confirm, user.isDriver ? true : false).then((m) => {
                    m.message === 'success' ? navigation.navigate('Home') : null
                }).catch((m: { message: string})=>{ 
                    setconfirmpasswordError('Registered Ok, authentication failed');
                    setLoading(false);
                })

            }).catch((m: { message: string})=>{ 
                m.message.toString() === '500' ? setpasswordError(formatMessage('login/userPassInvalid')) : setpasswordError(m.message);
                setLoading(false);
            })
        }
    }

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/RegistrationScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.navigate('SelectCommunity')}
            />
            <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.contentContainerStyle}>
                <KeyboardAvoidingView
                    style={styles.container}
                >
                    <View style={styles.ImgView}>
                        <Avatar
                            source={{ uri: profileUrl }}
                            onPress={() => setModalVisible(true)}
                            rounded
                            showAccessory
                            size={100}
                        />
                    </View>
                    <Input
                        label={formatMessage('login/email')}
                        inputContainerStyle={styles.textInput}
                        inputStyle={styles.inputStyle}
                        keyboardType="email-address"
                        placeholder={formatMessage('login/emailPlaceH')}
                        errorMessage={emailError}
                        // selectionColor={constants.Colors.textSelectionColor}
                        value={user.email}
                        autoFocus
                        autoCorrect={false}
                        onChangeText={ value => onInputChange(value,'email')}
                    />
                    <Input
                        label={formatMessage('registration/name')}
                        inputContainerStyle={styles.textInput}
                        inputStyle={styles.inputStyle}
                        keyboardType='default'
                        placeholder={formatMessage('registration/namePlaceH')}
                        errorMessage={nameError}
                        // selectionColor={constants.Colors.textSelectionColor}
                        autoFocus
                        value={user.name}
                        autoCorrect={false}
                        onChangeText={ value => onInputChange(value,'username')} 
                    />
                    <Input
                        label={formatMessage('registration/selectCommunity')}
                        inputContainerStyle={styles.textInput}
                        inputStyle={styles.inputStyle}
                        value={ user.organization.code }
                        editable={false}                        
                    />
                    <Input
                        label={formatMessage('registration/cellphone')}
                        placeholder={formatMessage('registration/cellphonePlaceH')}
                        errorMessage={cellPhoneError}
                        inputStyle={styles.inputStyle}
                        keyboardType='number-pad'
                        inputContainerStyle={styles.textInput}
                        value={ user.phone}
                        onChangeText={ value => onInputChange(value,'cellphone')} 
                    />
                    <Input
                        label={formatMessage('login/password')}
                        placeholder={formatMessage('registration/passwordPlaceH')}
                        errorMessage={passwordError}
                        inputStyle={styles.inputStyle}
                        keyboardType='default'
                        inputContainerStyle={styles.textInput}
                        secureTextEntry
                        value={user.password}
                        onChangeText={ value => onInputChange(value,'password')} 
                    />
                    <Input
                        label={formatMessage('registration/confirmPassword')}
                        placeholder={formatMessage('registration/confirmPasswordPlaceH')}
                        errorMessage={confirmpasswordError}
                        inputStyle={styles.inputStyle}
                        keyboardType='default'
                        inputContainerStyle={styles.textInput}
                        secureTextEntry
                        value={confirm}
                        onChangeText={ value => onInputChange(value,'confirm')} 
                    />
                    <View style={styles.switchView}>
                        <Text>{formatMessage('login/enableDriverMode')}</Text>
                        <Switch
                            style={styles.switch}
                            trackColor={{true:constants.Colors.positiveButtonColor, false: ''}}
                            value={ user.isDriver ? true : false}
                            onValueChange={ value => onInputChange(value,'isDriver')} 
                        />
                    </View>
                    <Button
                        containerStyle={styles.btnContainer}
                        buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
                        title={formatMessage('registration/registerbutton')}
                        onPress={registerUser}
                        disabled={loading}
                    />
                </KeyboardAvoidingView>
                {/* MODAL FOR ASK PROFILE IMAGE OPTION */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}
                >
                    <View style={styles.modalMainView}>
                        <View style={styles.cardView}>
                            <Text style={styles.headTxt}>{formatMessage('registration/selectAvatar')}</Text>
                            <Text style={styles.optionTxt} onPress={() => openCamera()}>{formatMessage('registration/takePhoto')}</Text>
                            <Text style={styles.optionTxt} onPress={() => openGallery()}>{formatMessage('registration/imageFromLibrary')}</Text>
                            <Text style={styles.cancelBtn} onPress={() => setModalVisible(false)}>{formatMessage('registration/cancel')}</Text>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            {
                loading ?(
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
                </View>
                ) : null
            }
        </View>
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
const actions = {register, login_Action};

export default connect(mapStateToProps, actions)(Registration);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%'
    },
    scrollViewStyle: {
        flex: 1,
        height: '100%',
        width: '100%'
    },
    contentContainerStyle: {
        padding: 15,
    },
    ImgView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    textInput: {
        height: 40,
        width: '100%',
    },
    inputStyle: {
        color: constants.Colors.strokeGrayColor,
        // color: constants.Colors.textSelectionColor,
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
    },
    modalMainView: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(50,50,50,0.5)',
        justifyContent: 'center'
    },
    cardView: {
        padding: 10,
        backgroundColor: constants.Colors.whiteColor,
        alignSelf: 'center',
        width: '100%',
        elevation: 5,
        borderRadius: 5
    },
    headTxt: {
        fontSize: 20,
        color: 'gray',
        fontWeight: '400',
        padding: 10,
        // paddingLeft: 5,
    },
    optionTxt: {
        fontSize: 20,
        color: constants.Colors.blackColor,
        fontWeight: '100',
        padding: 10
    },
    cancelBtn: {
        padding: 10,
        width: '30%',
        alignSelf: 'flex-end',
        textAlign: 'right',
        color: constants.Colors.green400Color
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
});
