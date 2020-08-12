import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Button, Avatar, Input } from "react-native-elements";
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import User from '../../models/User';
import { connect } from 'react-redux';
import {updateProfile, changePassword, get_Profile_remote} from '../../redux/actions/user'
import Toast from 'react-native-simple-toast';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface componentNameProps { }

const UserProfile: React.FC = (props:any) => {

    const navigation = useNavigation();
    const {formatMessage} = useGlobalize();

    const [user, setUser] = useState<User>(props.current);
    const [email, setEmail] = useState('');
    const [cellPhone, setCellPhone] = useState('');

    const [cellPhoneError, setCellPhoneError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [reNewPasswordError, setReNewPasswordError] = useState('');

    const [isModalVisible, setisModalVisible] = useState(false);
    const [isModalPhotoVisible, setisModalPhotoVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // const [newPasswordError, setNewPasswordError] = useState('');
    const [avatarSource, setAvatarSource] =useState<{ uri: string, type: string, name: string } | undefined>(props.current.photo ? { uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + props.current.photo, type:'image/jpeg', name:props.current.name } : undefined);

    const [loading, setLoading]= useState(false);
    const [updatedFromServer, setUpdatedFromServer] = useState(false);

    useFocusEffect(()=>{
        //console.log(props.current.photo ? (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + props.current.photo:'mierda seca');

        if (!updatedFromServer && !loading){
                setLoading(true);
                actions.get_Profile_remote(props.current.token).then((m)=>{
                    console.log(m);
                    setUpdatedFromServer(true);
                    setLoading(false);
                })
        }
    })



    function openCamera(): any {
        setisModalPhotoVisible(false);

        //Open device camera
        ImagePicker.openCamera({
            cropping: true, //if want to disable cropping then just comment this line
            mediaType: 'photo',
        }).then((image: any) => {
            console.log('camera image url', image.path);
            if (image.didCancel) {
                console.log('User cancelled image picker');
              } else if (image.error) {
                console.log('ImagePicker Error: ', image.error);
              } else if (image.customButton) {
                console.log('User tapped custom button: ', image.customButton);
              } else {
                let extension = 'jpg';
                let regexAll = /[^\\]*\.(\w+)$/;
                let total = image.path.match(regexAll);
                if (total) {
                  extension = total[1];
                }
      
                setAvatarSource({ uri: image.path, type: image.mime, name: image.path.substring(image.path.lastIndexOf('/')+1) });
                console.log(avatarSource);
            }
        });
    }

    function openGallery(): any {
        setisModalPhotoVisible(false);
        //Open the recent Images and sidebar option to get images from drive or sd card
        ImagePicker.openPicker({
            cropping: true, //if want to disable cropping then just comment this line
            height: 250,
            width: 250,
            mediaType: 'photo',
        }).then((image: any) => {
            console.log('camera image url', image.path);
            if (image.didCancel) {
                console.log('User cancelled image picker');
              } else if (image.error) {
                console.log('ImagePicker Error: ', image.error);
              } else if (image.customButton) {
                console.log('User tapped custom button: ', image.customButton);
              } else {
                let extension = 'jpg';
                let regexAll = /[^\\]*\.(\w+)$/;
                let total = image.path.match(regexAll);
                if (total) {
                  extension = total[1];
                }
      
                setAvatarSource({ uri: image.path, type: image.mime, name: image.path.substring(image.path.lastIndexOf('/')+1) });
                console.log(avatarSource);
            }
        });      
        
    }

    const validateBeforeUpdatingProfile = () : boolean => {
        let _isValid = true;
        setCellPhoneError('');
        setPasswordError(''); 
        setNewPasswordError(''); 
                    if (user.phone === ''){ 
                        setCellPhoneError(formatMessage('login/emptyFields'))
                        _isValid=false;
                    }
                    else if (user.phone !=='' && user.phone.length < 4){
                        setCellPhoneError(formatMessage('registration/cellphonInvalid'))
                        _isValid=false;
                    }                    
        return _isValid;
    }

    const validateBeforeUpdatingPassword = () : boolean => {
        let _isValid = true;
        setCellPhoneError('');
        setPasswordError(''); 
        setNewPasswordError(''); 
                    
                    if (user.password === ''){ 
                        setPasswordError(formatMessage('login/emptyFields'))
                        _isValid=false;
                    }
                    else if (user.password !=='' && user.password.length < 8){
                        setPasswordError(formatMessage('registration/passwordPlaceH'))
                        _isValid=false;
                    }
                    if(user.password !== newPassword){
                        setNewPasswordError(formatMessage('registration/confirmPasswordError'))
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
                    console.log('phone', phone)
                    setUser({...user, phone: value }); 
                    break;
                case 'password':
                    setUser({...user, password: value }); 
                break;                    
                case 'confirm':
                    setNewPassword( value ); 
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

    // the api only allows updating the photo and phone and password
    const updateProfile = () => {
        //console.log('pre updated')
            
        if (validateBeforeUpdatingProfile()){
            setLoading(true);
            setCellPhoneError('');
            setPasswordError(''); 
            setNewPasswordError(''); 
            
            actions.updateProfile(props.current.token, avatarSource, user).then((m)=> {
                let toast = Toast.showWithGravity(formatMessage('toast_msgs/update_profile'), Toast.LONG, Toast.CENTER);
                setLoading(false);
            }).catch((m: { message: string})=>{ 
                console.log('error from updating profile');
                m.message.toString() === '500' ? setPasswordError(formatMessage('login/userPassInvalid')) : setPasswordError(m.message);
                setLoading(false);
                Toast.showWithGravity(formatMessage('toast_msgs/error_update_profile'), Toast.LONG, Toast.CENTER);
                setCellPhoneError(formatMessage('toast_msgs/contact_for_profile'));
            })
        }
    }

    const updatePassword = () => {
        if (validateBeforeUpdatingPassword()){
            setLoading(true);
            setCellPhoneError('');
            setPasswordError(''); 
            setNewPasswordError(''); 
            
            actions.changePassword(props.current.token, newPassword).then((m)=> {
                let toast = Toast.showWithGravity(formatMessage('toast_msgs/update_password'), Toast.LONG, Toast.CENTER);
                setLoading(false);
                setisModalVisible(false);
                setNewPassword('');
            }).catch((m: { message: string})=>{ 
                console.log('error from updating password');
                m.message.toString() === '500' ? setPasswordError(formatMessage('login/userPassInvalid')) : setPasswordError(m.message);
                setLoading(false);
                Toast.showWithGravity(formatMessage('toast_msgs/error_update_password'), Toast.LONG, Toast.CENTER);
                setCellPhoneError(formatMessage('toast_msgs/problem_update_password'));
            })
        }
    }

    return (
        <>
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/ProfileScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />

            <ScrollView>
                <TouchableOpacity style={{alignSelf:'center',marginTop: 20}} onPress={()=>{
                            // console.log(`uri: ${user.photo}`);
                            setisModalPhotoVisible(true)}}>
                    {avatarSource?.uri ? 
                    <Avatar
                        rounded
                        size={120}
                        source={{ uri: avatarSource ? avatarSource.uri: '' }}
                        showAccessory                        
                    />:
                    <Avatar
                        rounded
                        size={120}
                        activeOpacity={0.7}
                        source={constants.Images.AVATAR}
                        showAccessory                        
                    />
                    }
                </TouchableOpacity>    
                
                <Input
                    label={formatMessage('profile/name_label')}
                    placeholder={formatMessage('profile/name')}
                    style={styles.textInput}
                    labelStyle={{ fontSize:14 }}
                    inputStyle={{ fontSize:14 }}
                    selectionColor={constants.Colors.textSelectionColor}
                    autoFocus
                    value={user.name}
                    autoCorrect={false}
                    editable={false}
                    onChangeText={(value)=> //setUser({...user, name: value})
                        console.log('should never happen')
                    }
                    // errorMessage={usernameError}
                />
                <Input
                    label={formatMessage('profile/email_label')}
                    placeholder={formatMessage('profile/email_text')}
                    style={styles.textInput}
                    labelStyle={{ fontSize:14 }}
                    inputStyle={{ fontSize:14 }}
                    keyboardType="email-address"
                    selectionColor={constants.Colors.textSelectionColor}
                    autoFocus
                    value={user.email}
                    autoCorrect={false}
                    editable={false}
                    onChangeText={(value)=> console.log('should never happen')}
                    // errorMessage={emailError}
                />
                <Input
                    label={formatMessage('profile/phone_label')}
                    placeholder={formatMessage('profile/cellphonePlaceH')}
                    style={styles.textInput}
                    labelStyle={{ fontSize:14 }}
                    inputStyle={{ fontSize:14 }}
                    keyboardType="phone-pad"
                    selectionColor={constants.Colors.textSelectionColor}
                    autoFocus
                    value={user.phone}
                    autoCorrect={false}
                    onChangeText={(value)=> 
                        onInputChange(value, 'cellphone')
                    }
                    errorMessage={cellPhoneError}
                />
                <Input
                    label={formatMessage('profile/Community_name_label')}
                    placeholder={formatMessage('profile/Community_name_text')}
                    style={styles.textInput}
                    labelStyle={{ fontSize:14 }}
                    inputStyle={{ fontSize:14 }}
                    keyboardType="phone-pad"
                    editable={false}
                    selectionColor={constants.Colors.textSelectionColor}
                    autoFocus
                    value={user.organization.name}
                    autoCorrect={false}
                    onChangeText={(value)=> console.log('should never happen')}                    
                />
                <Button
                    containerStyle={styles.btnContainer}
                    buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
                    title={formatMessage('button/update')}
                    onPress={()=>{
                        console.log('botoncicoClicked')
                        updateProfile();
                    }}
                    // disabled={loading}
                />
                <Button
                    containerStyle={[styles.btnContainer,{marginBottom:20}]}
                    buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
                    title={formatMessage('button/change_password')}
                    onPress={() => {
                        setisModalVisible(true);
                    }}
                    // disabled={loading}
                />

                <Modal onBackButtonPress={() => {
                    setisModalVisible(false);
                    }}
                    onBackdropPress={() => {
                    setisModalVisible(false);
                    }}
                    backdropOpacity={0.4}
                    isVisible={isModalVisible}
                    style={{
                        width: '90%',
                        alignSelf:'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 0,
                        borderRadius: 2,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                    }}
                    >
                <View style={styles.MainViewStyles}>
                    <Text style={styles.requestTextView}>{formatMessage('button/change_password')}</Text>
                </View>
                <View style={[styles.ImageViewStyles,{paddingTop:10,paddingBottom:5}]}>
                    <Input
                        label={formatMessage('profile/new_password')}
                        // placeholder={formatMessage('profile/new_password')}
                        style={styles.textInput}
                        labelStyle={{ fontSize:12 }}
                        inputStyle={{ fontSize:12 }}
                        selectionColor={constants.Colors.textSelectionColor}
                        autoFocus
                        value={user.password}
                        autoCorrect={false}
                        secureTextEntry
                        onChangeText={(value)=> onInputChange(value, 'password')}
                        errorMessage={passwordError}
                    />
                </View>
                <View style={[styles.ImageViewStyles]}>
                    <Input
                        label={formatMessage('profile/re_new_password')}
                        // placeholder={formatMessage('profile/re_new_password')}
                        style={styles.textInput}
                        labelStyle={{ fontSize:12 }}
                        inputStyle={{ fontSize:12 }}
                        keyboardType="default"
                        selectionColor={constants.Colors.textSelectionColor}
                        autoFocus
                        value={newPassword}
                        autoCorrect={false}
                        secureTextEntry
                        onChangeText={(value)=> onInputChange(value, 'confirm')}
                        errorMessage={newPasswordError}
                    />
                </View>
                <View style={{backgroundColor:'#fff',width:'100%',paddingBottom:10}}>
                    <Text 
                        style={{ fontSize: 20,textAlign:'center',color:constants.Colors.primaryColor }}
                        onPress={() => {
                            updatePassword();
                        }}>
                            {formatMessage('profile/confirm')}
                    </Text>
                </View>
            </Modal>
            {/* MODAL FOR ASK PROFILE IMAGE OPTION */}
            <Modal
                    onBackButtonPress={() => {
                        setisModalPhotoVisible(false);
                        }}
                        onBackdropPress={() => {
                            setisModalPhotoVisible(false);
                        }}
                        backdropOpacity={0.4}
                        isVisible={isModalPhotoVisible}
                        >
                    <View style={styles.modalMainView}>
                        <View style={styles.cardView}>
                            <Text style={styles.headTxt}>{formatMessage('registration/selectAvatar')}</Text>
                            <Text style={styles.optionTxt} onPress={() => openCamera()}>{formatMessage('registration/takePhoto')}</Text>
                            <Text style={styles.optionTxt} onPress={() => openGallery()}>{formatMessage('registration/imageFromLibrary')}</Text>
                            <Text style={styles.cancelBtn} onPress={() => setisModalPhotoVisible(false)}>{formatMessage('registration/cancel')}</Text>
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
       </>
    )
}

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
    };
}
//same as dispatchmapto props in eS6
const actions = {updateProfile, changePassword,get_Profile_remote};

export default connect(mapStateToProps, actions)(UserProfile);

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: constants.Colors.whiteColor
    },
    textInput: {
        height: 40,
        width: '100%',
        borderColor: constants.Colors.strokeGrayColor,
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
        fontWeight:'100'
    },
    MainViewStyles: {
        backgroundColor: constants.Colors.positiveButtonColor,
        width:'100%',
        height:60,
        justifyContent:'center',
        alignItems:'center'
    },
    requestTextView: {
        fontSize:18,
        color: constants.Colors.whiteColor
    },
    ImageViewStyles: {
        backgroundColor: constants.Colors.whiteColor,
        width:'100%',
        alignItems:'center',
    },
    BottomTextView: {
        backgroundColor: constants.Colors.whiteColor,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        height:60,
        borderTopWidth:1,
        borderTopColor:constants.Colors.greyTextColor
    },
    btnView: {
        width:'50%',
        justifyContent:'center',
        alignItems:'center'
    },
    btnText: {
        fontSize:18,
        fontWeight:'600'
    },
    centerView: {
        height:60,
        borderRightWidth:1,
        borderRightColor:constants.Colors.greyTextColor
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
    }
    ,loading: {
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