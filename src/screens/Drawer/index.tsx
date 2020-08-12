import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {connect, useDispatch,} from 'react-redux';
import { ACTIONS_PREFERENCES } from '../../redux/actions/types';
import { useGlobalize } from 'react-native-globalize';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import constants from '../../constants';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

function Drawer(props: any) {
    
    console.log("Drawer Called ");//,  (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + props.current.photo)
    const {formatMessage} = useGlobalize();
    const dispatch = useDispatch();
    const [avatarSource, setAvatarSource] = useState<{ uri: string, type: string, name: string } | undefined>(props.current?.photo ? { uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + props.current.photo, type:'image/jpeg', name:props.current.name } : undefined);

    const switchIsDriverMode = () => {
        dispatch({
            type: ACTIONS_PREFERENCES.PREF_SET_DRIVER, 
            payload: { isDriver: !props.preferences.isDriver }
        })        
    }

    useEffect(()=>{        
        console.log('Drawer from UseEffect', constants.Network.DEV_Network.API_URL+'/photo?filename='+props.current?.photo ,avatarSource, props.current?.photo)
        console.log('props.current', props.current);
        // if (avatarSource === undefined)
        // {
            setAvatarSource({ uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + props.current.photo, type:'image/jpeg', name:props.current.name });
        // }
    }, [props.current])
    
    const checkForAvailableTrips = (item) => {
        //console.log("Drawer Item ",props.PendingTrips.length>0, item.name)
        let status = (props.PendingTrips.length>0 && (item.name == "Scheduled Rides" || item.name == "Pending Requests")) ? true  : false;
        return status;
    }
                 
    return (
        <>
        <DrawerContentScrollView style={styles.container}>
            <TouchableOpacity style={styles.profileView} onPress={()=>props.navigation.navigate('UserProfile')}>
                {props.current?.photo !=='' ?( 
                <Avatar
                        rounded
                        size={80}
                        source={{ uri: avatarSource?.uri }}
                        showAccessory                        
                    />): 
                ( 
                <Avatar
                    rounded
                    size={'medium'}
                    activeOpacity={0.7}
                    source={constants.Images.AVATAR}
                />)}
               
               
                <View style={styles.column}>
                    <Text style={styles.name}>{props.current.name}</Text>
                    <Text>{props.current.email}</Text>
                </View>
            </TouchableOpacity>   
            <View style={{flex: 1,justifyContent:'space-between'}}>
            <View>      
            {
                props.options.map((item: any, index: number) => (
                    <View
                    key={index}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginVertical: 2,
                        alignItems: 'center',
                    }}>
                    <DrawerItem
                        label={item.name}
                        icon={({focused, color, size}) => (
                        <Icon name={item.icon} 
                            size={20} 
                            color={props.preferences.isDriver ? constants.Colors.green400Color : constants.Colors.primaryColor}                             
                        />
                        )}

                        rightIcon={({focused, color, size})=><Icon name='circle' color= {constants.Colors.pink400Color} type= 'font-awesome' size={15} /> }
                        
                        //activeTintColor={Colors.primaryColor}
                        //activeBackgroundColor={Colors.backgroundColor}
                        style={{flex: 1}}
                        labelStyle={{
                            fontSize: 14, 
                            // color: Colors.primaryColor
                        }}
                        onPress={() => props.navigation.navigate(item.destination)}
                    />
                    {checkForAvailableTrips(item)&&<View style={{ marginRight: 10}}>
                    <Icon name='circle' color= {constants.Colors.pink400Color} type= 'font-awesome' size={15} />
                    </View>}
                    </View>
                ))
            }
            </View>
            
            </View>
            
        </DrawerContentScrollView>
        <View onStartShouldSetResponder={() => { 
            switchIsDriverMode();               
        }}
            style={[styles.switchBtn, {
                // flex:1,
                // alignItems: 'flex-end',
                // alignContent: 'flex-end',
                // alignSelf:'flex-end',
                backgroundColor: (!props.preferences.isDriver) ? constants.Colors.green400Color : constants.Colors.primaryDarkColor }]}
        >
            <Icon
                name={(props.preferences.isDriver) ? 'users' : 'steering'}
                size={20}
                type={(props.preferences.isDriver) ? 'font-awesome' : 'material-community'}
                color={constants.Colors.whiteColor}
            />
            <Text style={styles.btnTxt}>{(props.preferences.isDriver) ? formatMessage('button/switch_to_passenger') : formatMessage('button/switch_to_driver')}</Text>

        </View>
        </>
    );
};



function mapStateToProps(state: any) {
    return {
        current: state.authReducer.current,
        preferences: state.preferences,
        PendingTrips: state.trips.PendingTrips   
    };
}

//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, null)( Drawer);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileView: {
        padding: 15,
        paddingTop: 20,
        alignItems: 'center',
        flexDirection: 'row'
    },
    column: {
        marginLeft: 10,
    },
    menuitems: {
        justifyContent: 'flex-start',
        flex: 1,
        margin: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
    },
    switchBtn: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: constants.Colors.green400Color,
        padding: 15,
        bottom: 0,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemView: {
        padding: 10,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: constants.Colors.primaryColor
    },
    itemTxt: {
        marginLeft: 10,
        fontSize: 15,
        color: constants.Colors.primaryColor
    },
    btnTxt: {
        marginLeft: 10,
        fontSize: 15,
        color: constants.Colors.whiteColor
    },
    innerView: {
        flexDirection: 'row'
    }
});
