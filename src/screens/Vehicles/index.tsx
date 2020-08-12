import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Icon, ListItem } from "react-native-elements";
import { Text, View, StyleSheet, FlatList, Dimensions } from 'react-native';
import constants from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useGlobalize } from 'react-native-globalize';
import {connect,} from 'react-redux';
import Vehicle from '../../models/Vehicle';
import Modal from 'react-native-modal';
import {delete_vehicle, set_favorite, get_vehicles} from '../../redux/actions/vehicles'
import Toast from 'react-native-simple-toast';


const Vehicles: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const _newVehicle: Vehicle= new Vehicle();
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] : Array<Vehicle> | any= useState(props.vehicles.Vehicles.vehicles);
    const [remoteloading, setremoteLoading]= useState(true);
    useEffect(()=>{
        vehicles === '' || remoteloading ?
        _handleRefresh(): '';
    }, [])

    useFocusEffect(()=>{
        //console.log('printVehicles ' +props.vehicles.Vehicles);
        vehicles === undefined || props.vehicles.Vehicles !== [] ? setVehicles(props.vehicles.Vehicles): null;
        //console.log(props.vehicles.Vehicles);
        //console.log(vehicles);
    });

    const _handleRefresh = () => {
       setLoading(true);
       
       actions.get_vehicles(props.current.token, props.vehicles.defaultVehicleId).then(()=> {
            setremoteLoading(false);
            setLoading(false);
        });
       
      }

//FlatList Item Layout
function Item(props: any) {
    const [isModalVisible, setisModalVisible] = useState(false);
    
    let data:Vehicle = props.item;
    return (
        <View key={data.id.toString()} style={[styles.itemView]}>
            <Icon 
                onPressOut={() => {
                    props.navigation.navigate('AddVehicle', { Vehicle: data})
                    }
                } 
                name={data.type == 'motorbike' ? 'motorbike' : 'car'}
                type={'material-community'}
                size={25}
                color={constants.Colors.blackColor}
                style={{ alignSelf: 'center' }}
            />
            <View style={[styles.rightView, { borderTopColor: (props.index != 0) ? constants.Colors.strokeGrayColor : 'transparent' }]}                
            >
                <View style={styles.desView}>
                    <Text allowFontScaling={false} style={styles.nameTxt}>{data.model} {props.defaultId == data.id ? '(Default Vehicle)' : ''}</Text>
                    <Text allowFontScaling={false} style={styles.dateTxt}>{props.translate('vehicles/color')}: {data.color}</Text>
                    <Text allowFontScaling={false} style={styles.dateTxt}>{props.translate('vehicles/plate')}: {data.plate}</Text>
                    <Text allowFontScaling={false} style={styles.dateTxt}>{props.translate('vehicles/passengers')}: {data.capacity}</Text>
                </View>

                <TouchableOpacity style={styles.rightBtn} onPress={() => {
                            console.log('Open modal')
                            setisModalVisible(true);
                            }
                        }   >
                    <Icon
                        name={'dots-vertical-circle-outline'}
                        type={'material-community'}
                        iconStyle={{}}
                        size={35}
                        color={constants.Colors.fifthShadeColor}
                        style={{ alignSelf: 'center' }}
                        reverse={false}                                             
                    />
                </TouchableOpacity>
            </View>
            <Modal onBackButtonPress={() => {
                        setisModalVisible(false);
                    }}
                    onBackdropPress={() => {
                        setisModalVisible(false);
                    }}
                    backdropOpacity={0.4}
                    isVisible={isModalVisible}
                    style={{
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        margin: 0,
                        borderRadius: 2,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                    }}
                    >
            <ListItem
              style={{width:'100%'}}
              title={props.translate('set_as_default_vehicle') + ' set default'}
              leftIcon={{ name: 'favorite', color: constants.Colors.positiveButtonColor }}
              onPress={() => {
                setisModalVisible(!isModalVisible);
                props.setDefault(data.id);
              }}
            />
            <ListItem
              style={{width:'100%'}}
              title={props.translate('edit_vehicle')}
              leftIcon={{ name: 'edit', color: constants.Colors.positiveButtonColor }}
              onPress={() => {
                setisModalVisible(!isModalVisible);
                props.navigation.navigate('AddVehicle', {Vehicle:data})
              }}
            />
            <ListItem
             style={{width:'100%'}}
             title={props.translate('delete')}
              leftIcon={{ name: 'delete', color: constants.Colors.positiveButtonColor }}
              onPress={e => {
                if (props.defaultId == data.id){ Toast.showWithGravity(formatMessage('toast_msgs/vehicle_error'),Toast.LONG, Toast.BOTTOM);}
                else {
                    props.setLoading(true);
                    props.deleteItem(props.token, data.id).then((m)=> {
                        if (m.message === 'success')
                        {
                            let message = data.model +formatMessage('toast_msgs/remove_vehicle');
                            Toast.showWithGravity(message, Toast.LONG, Toast.TOP);
                            props.getVehiclesRemote(props.token, props.defaultId);
                            
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
                        props.setLoading(false);
                        setisModalVisible(false);
                        props.navigation.navigate('Vehicles');
                    }).catch((m: { message: string})=>{ 
                        if (m.message.toString() === '500'){ 
                            Toast.showWithGravity(formatMessage('toast_msgs/invalid_message'), Toast.LONG, Toast.CENTER);
                        } 
                        else {Toast.showWithGravity(m.message,Toast.LONG, Toast.CENTER);}
                    
                        props.setLoading(false);
                        setisModalVisible(false);
                    });            
             }
            }}
            />
            <ListItem
             style={{width:'100%'}}
             title={props.translate('cancel')}
              leftIcon={{ name: 'cancel', color: constants.Colors.positiveButtonColor }}
              onPress={e => {
                setisModalVisible(!isModalVisible);
              }}
            /> 
        </Modal>
     
        </View>
    );
}      

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/VehiclesScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightButtonAction={()=> navigation.navigate('AddVehicle', {Vehicle: _newVehicle})}
                rightIcon={'add'}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            {
                vehicles && vehicles.length > 0 ? (
                <FlatList
                    style={{ flex: 1 }}
                    data={vehicles}
                    keyExtractor={item=> item.id+''}
                    renderItem={({ item, index=item.id+'' }) => 
                    <Item 
                        deleteItem={actions.delete_vehicle} 
                        setDefault={actions.set_favorite} 
                        getVehiclesRemote={actions.get_vehicles}
                        token={props.current.token}
                        defaultId={props.vehicles.defaultVehicleId} 
                        navigation={navigation} translate={formatMessage} 
                        item={item} 
                        index={index.toString()} 
                        setLoading={setLoading}
                        />}
                    onRefresh={()=>_handleRefresh()}
                    refreshing={loading}
                />
                )
                :<View><Text>{formatMessage('vehicles/empty')}</Text></View>

            }
        </View>
    );
};

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
        vehicles: state.vehicles,        
    };
}
//same as dispatchmapto props in eS6
const actions = {set_favorite, delete_vehicle, get_vehicles};

export default connect(mapStateToProps, actions)(Vehicles);

const styles = StyleSheet.create({
    container: {
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
    }
});
