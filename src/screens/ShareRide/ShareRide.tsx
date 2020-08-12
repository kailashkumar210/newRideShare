import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { store } from '../../redux/configureStore';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
import Header from '../../components/Header';
import { Icon, Avatar, Button } from "react-native-elements";
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import { get_TripSearchHistory } from '../../redux/actions/trip';
import { connect } from 'react-redux';

interface componentNameProps { }
// potential Ride Screen
const ShareRide: React.FC = (props: any) => {

    const navigation = useNavigation();
    const {formatMessage} = useGlobalize();

    useEffect(()=>{
        _setTopTwoSearch()
    },[]);

    const _setTopTwoSearch=() =>{
        console.log(' share ride screen', props.app.authorized, props.preferences.isDriver);
        if (props.app.authorized && !props.preferences.isDriver) {
           actions.get_TripSearchHistory(props.auth.current.token).then(success => {
            // setTopTwo(props.trips.SearchedTrips.reverse().filter((_i: any, index: number) => index < 2));
          });
        }
    }

    return (

        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/ShareRideScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            <ScrollView>
            <View style={[styles.desView]}>
                <Avatar
                    size={60}
                    rounded
                    title={'P'}
                    titleStyle={{ color: constants.Colors.whiteColor }}
                    containerStyle={{ backgroundColor: constants.Colors.primaryColor}}
                    onPress={() => console.log("Works!")}
                    activeOpacity={0.7}
                />
              <View style={{flexDirection:'row',width:'75%'}}>
                <View style={{flexDirection:'column'}}>
                    <Text allowFontScaling={false} style={styles.nameTxt}>Pablo</Text>
                    <Text allowFontScaling={false} style={[styles.dateTxt,{color:'#808080'}]}>Leaves at 7:30 AM</Text>
                    <Text allowFontScaling={false} style={[styles.dateTxt,{color:'#808080'}]}>Vehicle type: car</Text>
                    <Text allowFontScaling={false} style={[styles.dateTxt,styles.weekNames]}>
                        S <Text style={{color:constants.Colors.primaryColor}}>M T W T F</Text> S
                    </Text> 
                </View>
              </View>
              <View style={{alignItems:'flex-end',justifyContent:'flex-end',marginBottom:10}}>
                <Icon 
                    name={'chevron-right'}
                    type={'Entypo'}
                    size={30}
                    color={constants.Colors.blackColor}
                />
              </View>  
            </View>
              
            <View style={[styles.rightView]}>
                <View style={[styles.desView,{marginTop:0,paddingTop:0}]}>
                    <Icon 
                        name={'directions-car'}
                        type={'MaterialIcons'}
                        size={20}
                        color={constants.Colors.primaryDarkColor}
                        style={{ alignSelf: 'center' }}
                    />
                    <Text allowFontScaling={false} style={styles.bottomTxt}>
                        412 m {formatMessage('from')} <Text style={{color:constants.Colors.darkGrayColor}}>{formatMessage('pickup_point')}</Text>
                    </Text>
                </View>
                <View style={[styles.desView,{marginTop:0,paddingTop:0}]}>
                    <Icon 
                        name={'location-on'}
                        type={'material'}
                        size={20}
                        color={'orange'}
                        style={{ alignSelf: 'center' }}
                    />
                    <Text allowFontScaling={false} style={[styles.bottomTxt]}>
                        116 m {formatMessage('from')} <Text style={{color:constants.Colors.darkGrayColor}}>{formatMessage('drop_off_point')}</Text>
                    </Text>
                </View>
            </View>
        </ScrollView>
       </View> 
    )
}

function mapStateToProps(state: any) {
    return {
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences,   
        //subscriber: state.subscriber,     
        vehicles: state.vehicles,
        trips: state.trips,     
    };
}

//same as dispatchmapto props in eS6
const actions = {get_TripSearchHistory};

export default connect(mapStateToProps, actions)(ShareRide);

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    headerTxt: {
        color: constants.Colors.whiteColor,
        fontSize: 18,
        fontWeight: '400',           
    },
    desView: {
        flexDirection:'row',
        padding: 10,
        marginTop: 10
    },
    dateTxt: {
        fontSize: 18,
        paddingLeft: 20,
        lineHeight: 30
    },
    rightView: {
        width:'80%',
        alignSelf:'center',
        alignItems:'center',
    },
    noteText: {
        color: constants.Colors.strokeGrayColor,
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft:5
    },
    nameTxt: {
        fontWeight: '700',
        fontSize: 20,
        color: constants.Colors.darkGrayColor,
        paddingLeft: 20,
        lineHeight: 20
    },
    weekNames: {
        lineHeight:30,
        color:constants.Colors.strokeGrayColor,
        marginTop:10,
        fontSize:20,
    },
    bottomTxt: {
        color: constants.Colors.blackColor,
        fontSize: 16,
        paddingLeft: 15,
        lineHeight: 20
    },
});