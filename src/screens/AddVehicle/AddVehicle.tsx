import React, { useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Icon, CheckBox, Input, Button} from "react-native-elements";
import { Text, View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider'
import {Picker} from '@react-native-community/picker'
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import Vehicle from '../../models/Vehicle';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { add_vehicle } from '../../redux/actions/vehicles';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    
interface AddVehicleProps {
    
}

const AddVehicle: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const _initialStatus:Vehicle = props.route.params && props.route.params.Vehicle ? props.route.params.Vehicle : new Vehicle(); 
    //console.log(props.route.params);
    //console.log(_initialStatus);
    const [vehicle, setVehicle] = useState(_initialStatus);
    const [loading, setLoading] = useState(false);
    const [errorModel, setErrorModel] = useState('');
    const [errorPlate, setErrorPlate] = useState('');
    
    useFocusEffect(()=>{
        // console.log('focused')
        vehicle.id != _initialStatus.id ? setVehicle(_initialStatus) : null;
        console.log(vehicle);
    })

    const validateForm= (): boolean => {
        let _isValid= true;
        if (vehicle.model === '' ) { 
            setErrorModel('Please enter your car maker and model');
            _isValid = false;
        } 
        else if (vehicle.model.length <3) {
            setErrorModel('Please enter valid car maker and model');
            _isValid = false;
        }
        else setErrorModel('');

        if (vehicle.plate === '' ) { 
            setErrorModel('Enter a partial license plate');
            _isValid = false;
        } 
        else if (vehicle.plate.length <3) {
            setErrorModel('Minimum 3 digits are required');
            _isValid = false;
        }
        else setErrorModel('');
        return _isValid;
    }

    const saveCarInfo = ():void => {
        let _validSave: boolean = validateForm();
        if (_validSave)
        {
            setLoading(true);
            actions.add_vehicle(props.current.token, props.vehicles.defaultVehicleId, vehicle).then((m)=> {
                setErrorModel('');
                setErrorPlate(''); 

                console.log(m);
                if (m.message === 'success')
                {
                    let message = vehicle.id == 0 ? 'Added ' + vehicle.model + ' to your vehicles.' : 'Saved ' + vehicle.model;
                    Toast.showWithGravity(message, Toast.LONG, Toast.TOP);
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
                m.message.toString() === '500' ? setErrorModel(formatMessage('toast_msgs/invalid_message')) : setErrorModel(m.message);
                setLoading(false);
            })            
        }
    }

    return (
        <KeyboardAwareScrollView style={styles.container} keyboardShouldPersistTaps="always">
          <Header
                headerText={vehicle.id == 0 ? formatMessage('vehicles/new') : formatMessage('vehicles/edit')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
            />
        {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
            </View>
          )
        : null}
        <View style={styles.form}>
          <Text>{formatMessage('vehicles/vehicle_type')}</Text>

          <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', margin: 5 }}>
            <CheckBox
              containerStyle={{ flex: 1 }}
              onPress={() => setVehicle({...vehicle, type: 'car'})}
              center
              title={formatMessage('vehicles/type_car')}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={constants.Colors.primaryColor}
              checked={vehicle.type == 'car'}
            />
            <CheckBox
              containerStyle={{ flex: 1 }}
              onPress={() => setVehicle({...vehicle, type: 'motorbike' })}
              center
              title={formatMessage('vehicles/type_motorbike')}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={constants.Colors.primaryColor}
              checked={vehicle.type == 'motorbike'}
            />
          </View>
          <Text>{formatMessage('vehicles/vehicle_make')}</Text>
          <Input value={vehicle.model} autoCapitalize="words" placeholder="e.g. Toyota RAV4" 
          onChangeText={text => setVehicle({...vehicle, model: text})} 
          />
          <Text>{formatMessage('vehicles/vehicle_color')}</Text>
          <Picker style={{ marginLeft: 10, marginRight: 10 }} selectedValue={vehicle.color} 
          onValueChange={(itemValue, itemIndex) => setVehicle({...vehicle, color: itemValue.toString()})}>
            <Picker.Item label="White" value="white" />
            <Picker.Item label="Black" value="black" />
            <Picker.Item label="Silver" value="silver" />
            <Picker.Item label="Gold" value="gold" />
            <Picker.Item label="Orange" value="orange" />
            <Picker.Item label="Blue" value="blue" />
            <Picker.Item label="Green" value="green" />
            <Picker.Item label="Gray" value="gray" />
            <Picker.Item label="Yellow" value="yellow" />
            <Picker.Item label="Red" value="red" />
            <Picker.Item label="Brown" value="brown" />
          </Picker>
          <Text>{formatMessage('vehicles/partial_plate')}</Text>
          <Input value={vehicle.plate} 
                autoCapitalize="characters" 
                placeholder="e.g. **DHS" 
                onChangeText={text => setVehicle({...vehicle, plate: text}) } />

          <Text>{formatMessage('vehicles/passenger_capa')}</Text>

          <View style={styles.passengerCountView}>
            <Slider
              style={{ height: 40, marginLeft: 10, marginRight: 0, flex:1, }}
              thumbTintColor={constants.Colors.positiveButtonColor}
              value={vehicle.capacity}
              step={1}
              maximumValue={vehicle.type === 'car' ? 7 : 3 }
              minimumValue={1}
              onValueChange={value => setVehicle({...vehicle, capacity:value})}
            />
            <Text style={{ flex: 0.1, textAlign: 'center', textAlignVertical: 'center', fontSize: 20 }}>
                {vehicle.capacity + ''}</Text>
            <Icon color={constants.Colors.strokeGrayColor} style={{flex:1, marginTop: 0, height:40 }} name="users" 
                type="font-awesome" />
          </View>
          <Button
            buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
            title={vehicle.id == 0 ? formatMessage('vehicles/button_add') : formatMessage('vehicles/button_save')}
            onPress={()=> {
                    console.log('vehicle saved')
                    saveCarInfo();        
                    //setVehicle(new Vehicle());
                }    
            }
          />          
        </View>
        </KeyboardAwareScrollView>
    );
};

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
        vehicles: state.vehicles
    };
}
//same as dispatchmapto props in eS6
const actions = {add_vehicle};

export default connect(mapStateToProps, actions)(AddVehicle);

const styles = StyleSheet.create({
    container: {
        flex: 1,        
    },
    form: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        flex: 1,
      },      
    itemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15
    },
    secView: {
        flex: 1,
        flexDirection: 'row',
    },
    desView: {
        flex: 1,
        // paddingLeft: 15
    },
    rightBtn: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateTxt: {
        color: constants.Colors.greyTextColor,
        fontSize: 15
    },
    nameTxt: {
        fontWeight: '700',
        fontSize: 15,
        color: constants.Colors.greyTextColor
    },
    rightView: {
        flex: 1,
        flexDirection: 'row',
        borderTopWidth: 1,
        padding: 15
    },
    btn: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },    
    textInput: {
        width: 250,
        height: 40,
        padding: 10,
        margin: 5,
    
        borderWidth: 1,
        borderColor: constants.Colors.strokeGrayColor,
      },
      passengerCountView: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        marginTop: 20,
        justifyContent: 'center',
        height: 40,
        width: '90%',
        backgroundColor: constants.Colors.backgroundColor,
        flexDirection: 'row',
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
