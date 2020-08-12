import React, { Component, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import constants from '../../constants';
import { useNavigation, useFocusEffect} from '@react-navigation/native';
import Header from '../../components/Header';
import { useGlobalize } from 'react-native-globalize';
import { Icon, Avatar, Button, ListItem } from "react-native-elements";
import {connect} from 'react-redux';
import { set_removeSubscription_Trip, set_reactivate_Trip,get_pastRide,set_deactivate_Trip, get_rideDetails,
    set_acceptSubscription_Trip,set_rejectSubscription_Trip, set_noteFor_Trip, cancelPendingTripRequest,set_ConfirmTrip, set_PendingTripList} from '../../redux/actions/trip';
import { set_subscribe } from '../../redux/actions/subscriber';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import Constants from '../../constants';
import Modal from 'react-native-modal';
import Communications from 'react-native-communications';
import SubscriberTrip from '../../models/SubscriberTrip';
import Toast from 'react-native-simple-toast';
import PendingRequestAvatar, {IPropsPendingRequest} from '../../components/PendingRequestAvatar'
import Subscriber from '../../models/Subscriber';
import { Location } from '../../models/types';
import {getCenter} from 'geolib';
// import useBackButton from '../../components/BackButtonHandler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const TripDetails = (props: any) => {

    let navigation = useNavigation();
    const {formatMessage} = useGlobalize();

    // console.log("Props on this ", props.route.params.subscribed2Trip);
    
    let subscribed2Trip = props.route?.params?.subscribed2Trip ? props.route.params.subscribed2Trip: new SubscriberTrip();
    const [subscribers, setSubscribers] = useState<Array<Subscriber>>([]);
    const [subscribed2TripId, setSubscribed2TripId] = useState();
    const [isModalVisible, setisModalVisible] = useState(false);
    const [addNote, setAddNote] = useState('');
    const [btnText, setBtnText] = useState('');
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [showButton, setButton] = useState(true);
    const [selectedSubscriber, setselectedSubscriber] = useState<Subscriber | undefined>(undefined);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isTimePickerVisible, setisTimePickerVisible] = useState(false);
    const [time, setTime] = useState('08:00');
    const [centeredRegion, setCenteredRegion] = useState({
        latitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[0] ? 
            subscribed2Trip.routePoints[0].latitude : subscribed2Trip.startLocation.latitude,
        longitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[0] ? 
            subscribed2Trip.routePoints[0].longitude : subscribed2Trip.startLocation.longitude,
        latitudeDelta: 0.122,
        longitudeDelta: 0.1421,
    });

    useEffect(()=>{
        const unsubscribe = navigation.addListener('focus', () => {
          subscribed2Trip = props.route.params.subscribed2Trip;
          const _centeredRegion = getCenter([{latitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[0] ? 
                                                               subscribed2Trip.routePoints[0].latitude : subscribed2Trip.startLocation.latitude,
                                                    longitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[0] ? 
                                                               subscribed2Trip.routePoints[0].longitude : subscribed2Trip.startLocation.longitude},
                                                    {latitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1] ? 
                                                                subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1].latitude : subscribed2Trip.destinationLocation.latitude,
                                                    longitude: subscribed2Trip.routePoints && subscribed2Trip.routePoints.length>0 && subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1] ? 
                                                               subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1].longitude : subscribed2Trip.destinationLocation.longitude}])
            if (_centeredRegion){                                            
                setCenteredRegion({...centeredRegion,
                                    latitude: _centeredRegion.latitude,
                                    longitude: _centeredRegion.longitude
                });
            }
          console.log("Entering on subcribed2trip ",subscribed2Trip);// subscribed2Trip.id);
          
          subscribed2Trip.note ? setNote(subscribed2Trip.note) : setNote('');

          setAddNote('');
          setBtnText(props.route.params.bottomButtonText);
          if(props.route.params.bottomButtonText == '')
          {
              setButton(false);
          }
          else 
          {
            //   console.log("isDriver ",props.preferences.isDriver);
            //   console.log("Past Ride ",props.route.params.screenTitle );
              if(!props.preferences.isDriver&&(props.route.params.screenTitle == "Past Rides" || props.route.params.bottomButtonText == "Deactivate" ))
                {
                    // console.log("Executed")
                    setButton(false);
                }
              else
              {
                  setButton(true);
              }
          }  
          _makeRemoteRequest();
        });

        return unsubscribe;
      }, [props]);
    
    const _makeRemoteRequest = () => {
            setSubscribed2TripId(subscribed2Trip.id);
            // console.log('Trip Id ',subscribed2Trip.id)
            let access_token = props.current.token;  
            actions.get_rideDetails(access_token, subscribed2Trip.id).then(response => {
                // console.log('got Ride Details: ', response.data)
              if (response.message==='success') {
                let responseJson:Subscriber[] = response.data;
                // If the user has cancelled the request, the request is still in the system and can bring duplicates...so to remove duplicates
                const _uniqueUsers = Array.from(new Set(responseJson.map(a => a.user.id)))
                .map(id => {
                  return responseJson.find(a => a.user.id === id)
                })
                //console.log('test 2', _test)
                setSubscribers(_uniqueUsers);
              }
            }).catch( error =>{ 
                console.log('error', error)
            });
    }

    const _acceptPendingSubsciption = () => {
        if (selectedSubscriber && subscribed2TripId){
        console.log('_acceptPendingSubsciption', subscribed2TripId, selectedSubscriber, addNote);
        actions.set_acceptSubscription_Trip(props.current.token, subscribed2Trip.id, selectedSubscriber.user.id, addNote).then(
          response => {
            console.log('Accept Subscribe ',response)
            setisModalVisible(false); 
            _makeRemoteRequest();
            Toast.showWithGravity(formatMessage('toast_msgs/trip_success'), Toast.LONG, Toast.BOTTOM);
        
          },    
          error => {
            console.log(error);
            Toast.showWithGravity(formatMessage('toast_msgs/request_error')+error, Toast.LONG, Toast.BOTTOM);
          }          
        );
        }
    }
    
    const _rejectPendingSubsciption = () => {
        console.log('Reject Subscription ',subscribed2TripId, subscribed2Trip.user.id, addNote);
        actions.set_rejectSubscription_Trip(props.current.token, subscribed2Trip.id, subscribed2Trip.user.id, addNote).then(
          response => {
            console.log('Reject Subscribe ',response)
            if (response.message === 'success'){
                setisModalVisible(false); 
                Toast.showWithGravity(formatMessage('toast_msgs/request_to_join_rejected'), Toast.LONG, Toast.BOTTOM);
            }
          },    
          error => {
            console.log(error);
          }
          
        );
    }

      const onDeactivate = () => {
        
        console.log('Deactive trip ',props.current.token, subscribed2Trip.id);
        actions.set_deactivate_Trip(props.current.token, subscribed2Trip.id).then(
          response => {
            console.log('Deactive trip respo ',response);
            if (response.message === 'success')
            {
                Toast.showWithGravity(formatMessage('toast_msgs/deactivate_subscription'), Toast.LONG, Toast.BOTTOM);
    
                navigation.navigate('Home',
                                    {NavigatingFrom:'TripDetails'}
                                   );
            }
          },    
          error => {
            console.log(error);
          }
          
        );
      } 

      const onActivate = () => {
        actions.set_reactivate_Trip(props.current.token,subscribed2Trip.id).then(response=>{
            console.log("Activate Response ", response);
            if (response.message === 'success')
            {
                Toast.showWithGravity(formatMessage('toast_msgs/activate_trip'), Toast.LONG, Toast.BOTTOM);
    
                navigation.navigate('Home',
                                    {NavigatingFrom:'TripDetails'});
              //  navigation.setParams({});
            }
        })
      }

      const onConfirm = () => {
        console.log("on Confirm ",props.route.params);
        const { passProps } = props.route.params;
        // token, tripId, passengerStartLocationObject, passengerdestinationLocationObject, passengerCount,daysInCronFormat
        actions.set_ConfirmTrip(props.current.token,subscribed2Trip.id,passProps.startLocationObject,passProps.destinationLocationObject, passProps.capacity, passProps.date)
        .then(response => {
            console.log("Confirm Trip ", response);
            if (response.message === 'success')
            {
                Toast.showWithGravity(formatMessage('toast_msgs/success_request'), Toast.LONG, Toast.BOTTOM);
    
                navigation.navigate('Home',
                                    {NavigatingFrom:'TripDetails'});
              //  navigation.setParams({});
            }
        });          
      }

      const onCancel = () => {
        actions.cancelPendingTripRequest(props.current.token,subscribed2Trip.id).then(response => {
            console.log("Cancel Response ",response);
            if (response.message === 'success')
            {
                Toast.showWithGravity(formatMessage('toast_msgs/cancel_trip'), Toast.LONG, Toast.BOTTOM);                
                actions.set_PendingTripList(props.current.token, false).then((p)=>
                    navigation.navigate('Home',{NavigatingFrom:'TripDetails'}));                
            }
        })
      }

      const onUnsubscribe = () => {
        actions.set_removeSubscription_Trip(props.current.token,subscribed2Trip.id, subscribed2Trip.user.id).then(response => {
            console.log("Unsubscribe Response ", response);
            if (response.message === 'success')
            {
                Toast.showWithGravity(formatMessage('toast_msgs/unsubscribe'), Toast.LONG, Toast.BOTTOM);
    
                navigation.navigate('Home',
                                    {NavigatingFrom:'TripDetails'});
              //  navigation.setParams({});
            }
        })
      }

      const onBottomBtn = () => {
        const { bottomButtonText } = props.route.params;
        console.log("Called")
        if(bottomButtonText == "Activate")
        {
            onActivate();
        }
        else if(bottomButtonText == "Deactivate")
        {
            onDeactivate();
        }
        else if(bottomButtonText == "Confirm")
        {
            onConfirm();
        }
        else if(bottomButtonText == "Cancel Request")
        {
            onCancel();
        }
        else if(bottomButtonText == "Unsubscribe")
        {
            onUnsubscribe();
        }
      }

      const _onlyIntermediatePoints= (routePoints:any) => {
          let _newArray: any[] = [];
          
          routePoints.map((item: any, index: number)=>{
              if (index >0 && index < routePoints.length -1)
              {
                  _newArray.push(item);
              }

          })
          return _newArray;

      } 
      
      const _handleTimePicked = (event:any, selectedDate:Date|any) => {
        console.log('Selected Date');
        console.log(selectedDate);
        setisTimePickerVisible(false);
        if (selectedDate) {
            const currentDate = selectedDate || date;
            //
            let _temp = new Date();
            //console.log(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
            setTime(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
        }                
     }

     const _deg2rad = deg => {
        return deg * (Math.PI / 180);
      };

     const _getDistanceToClosestPoint = (routePoints: Array<Location>, fromLocation: Location): number => {
        let minDistance: number = -1;
        //console.log('minDistance',props.route.params.passProps, fromLocation, minDistance);
        if (fromLocation === undefined) return 0
        // console.log('fromLocation',fromLocation);
    
        for (let i = 0; i < routePoints.length; i++) {
          let toLocation: Location = routePoints[i];
    
          let R = 6371; // Radius of the earth in km
          let dLat = _deg2rad(fromLocation.latitude - toLocation.latitude); // deg2rad below
          let dLon = _deg2rad(fromLocation.longitude - toLocation.longitude);
          let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(_deg2rad(toLocation.latitude)) * Math.cos(_deg2rad(fromLocation.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          let d = R * c; // Distance in km
    
          let distanceInMeter = Math.floor(d * 1000);
    
          if (distanceInMeter < minDistance || minDistance == -1) {
            minDistance = distanceInMeter;
            console.log('distanceInMeter minDistance',minDistance);
        }
        //   console.log('distanceInMeter',distanceInMeter);
        }
        
    
        return minDistance;
      };


        return (
            <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/TripDetailsScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => { setButton(false); navigation.goBack()}}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            <ScrollView> 
            <View style={[styles.rightView]}>
                <View style={styles.desView}>
                    <Icon 
                        name={'directions-car'}
                        type={'MaterialIcons'}
                        size={25}
                        color={constants.Colors.primaryDarkColor}
                        style={{ alignSelf: 'center' }}
                    />
                    <Text allowFontScaling={false} style={styles.dateTxt}>
                        { subscribed2Trip && subscribed2Trip.routePoints && subscribed2Trip.routePoints.length > 0 ? subscribed2Trip.routePoints[0].title : subscribed2Trip.startLocation ? subscribed2Trip.startLocation.title : '' }
                    </Text>
                </View>
                <View style={[styles.desView]}>
                    <Icon 
                        name={'location-on'}
                        type={'material'}
                        size={25}
                        color={'orange'}
                        style={{ alignSelf: 'center' }}
                    />
                    <Text allowFontScaling={false} style={[styles.dateTxt]}>
                        {subscribed2Trip && subscribed2Trip.routePoints && subscribed2Trip.routePoints.length > 0 ? subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1].title : subscribed2Trip.destinationLocation ? subscribed2Trip.destinationLocation.title : ''}
                    </Text>
                </View>
            </View>
            
            { 
               !props.preferences.isDriver && 
               subscribed2Trip.routePoints?.length > 0 &&
               props.route?.params?.passProps !== undefined &&
               props.route?.params?.passProps?.passengerStartLocationObject !== undefined &&
               props.route?.params?.passProps?.passengerStartLocationObject?.latitude != 0 && props.route?.params?.passProps?.passengerdestinationLocationObject?.latitude != 0 ?
              (<View style={{flexDirection:'row', alignSelf:'center',marginVertical:10,justifyContent:'space-around',width:'80%'}}>
                <Text allowFontScaling={false} style={[styles.dirTxt]}>
                    {_getDistanceToClosestPoint(
                    [subscribed2Trip.routePoints[0],
                     ...subscribed2Trip.routePoints,
                     subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1]],
                     props.route.params.passProps.passengerStartLocationObject
                    )}m
                </Text>
                <Icon 
                    name={'directions-walk'}
                    type={'MaterialIcons'}
                    size={30}
                    color={constants.Colors.primaryColor}
                    style={{ alignSelf: 'center' }}
                />
                <Text allowFontScaling={false} style={[styles.dirTxt]}>
                    {'>'}
                </Text>
                <Icon 
                    name={'directions-car'}
                    type={'MaterialIcons'}
                    size={32}
                    color={constants.Colors.primaryDarkColor}
                    style={{ alignSelf: 'center' }}
                />
                <Text allowFontScaling={false} style={[styles.dirTxt]}>
                    {'>'}
                </Text>
                <Text allowFontScaling={false} style={[styles.dirTxt]}>
                    {_getDistanceToClosestPoint(
                    [subscribed2Trip.routePoints[0],
                     ...subscribed2Trip.routePoints,
                     subscribed2Trip.routePoints[subscribed2Trip.routePoints.length -1]],
                     props.route.params.passProps.passengerdestinationLocationObject
                    )}m

                </Text>
                <Icon 
                    name={'directions-walk'}
                    type={'MaterialIcons'}
                    size={30}
                    color={constants.Colors.primaryColor}
                    style={{ alignSelf: 'center' }}
                />
            </View>)
            :null
            }

            <View style={[styles.rightView]}>
                <View style={styles.desView}>
                    <Text allowFontScaling={false} style={styles.noteText}>{formatMessage('newride/notesHeader')}</Text>
                </View>
                <View style={[styles.noteView,{paddingVertical:props.preferences.isDriver?0:15}]}>
                <Text style={[styles.notesText,{paddingLeft:20}]}>
                    {note === '' ? formatMessage('notes_for_pass'): note}
                </Text>
              {props.preferences.isDriver ? (
                <Icon 
                    name={'mode-edit'}
                    type={'material'}
                    size={20}
                    raised
                    
                    color={constants.Colors.primaryDarkColor}
                    // containerStyle={{ alignSelf: 'center', borderWidth:1, borderColor:constants.Colors.strokeGrayColor, borderRadius: 50,padding:7 }}
                    onPress={() =>  setIsNoteModalVisible(true) }
                    />) : null}  
                </View>
            </View>
            
            
                { !props.preferences.isDriver && subscribed2Trip.user ?
                    (<View style={styles.avatarView}>
                                    <View style={styles.desView}>
                                        <Text allowFontScaling={false} style={[styles.noteText,{paddingLeft:15}]}>{formatMessage('driver')}</Text>
                                    </View>
                                    <View style={[styles.desView, {justifyContent:'center',width:'80%',alignSelf:'center'}]}>
                                        <Avatar
                                            size={60}
                                            rounded
                                            titleStyle={{ color: constants.Colors.whiteColor,marginTop:10 }}
                                            containerStyle={{ backgroundColor: constants.Colors.strokeGrayColor }}
                                            onPress={() => console.log("Works!")}
                                            activeOpacity={0.7}
                                            source={subscribed2Trip.user.photo !== undefined ? { uri: (__DEV__ ? Constants.Network.DEV_Network.API_URL : Constants.Network.PRD_Network.API_URL) + '/photo?filename=' + subscribed2Trip.user.photo }: constants.Images.AVATAR}
                                        />
                                        <View>
                                            <View style={{flexDirection:'column'}}>
                                                <Text allowFontScaling={false} style={styles.nameTxt}>{subscribed2Trip.user.name}</Text>
                                                <Text allowFontScaling={false} style={[styles.dateTxt,{color:constants.Colors.darkGrayColor,fontSize:16}]}>{subscribed2Trip.vehicle.model+' ( '+ subscribed2Trip.vehicle.color +' )'}</Text>
                                                <Text allowFontScaling={false} style={[styles.dateTxt,{color:constants.Colors.darkGrayColor,fontSize:16}]}>{formatMessage('plate')}: {subscribed2Trip.vehicle.plate}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>): null
                }
                            {/* //   ) */}
                    {/* // } */}
                    
            {/* // })): null} */}


             {props.preferences.isDriver && subscribers.length > 0  ? (<View>
                <View style={styles.desView}>
                    <Text allowFontScaling={false} style={styles.noteText}>{formatMessage('passenger')}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                 { subscribers.map((item:Subscriber, i) => {
                        {
                            console.log('another subscriber, ',item)
                            return(
                            <View key={i} style={{paddingVertical: 15}}>
                                <TouchableOpacity onPress={() => {
                                    setselectedSubscriber(item);
                                    setHasPendingRequest(item.pendingSubscription);
                                    setisModalVisible(true);
                                    }}>
                                <View style={[styles.desView,{justifyContent:'center'}]}>
                                <PendingRequestAvatar user={item.user} _showPicker={item.pendingSubscription ? true : false}  />
                                </View>
                                </TouchableOpacity>
                            </View>
                            )}
                        }) 
                 }
            </View>
           </View>
                ): null} 


            <View style={[styles.rightView]}>
                <View style={[styles.desView,{marginBottom:5}]}>
                    <Text allowFontScaling={false} style={styles.noteText}>{formatMessage('pickup_schedule')}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                <TouchableOpacity style={[styles.desView,{justifyContent:'center',width:'40%'}]} onPress={()=> setisTimePickerVisible(true)}>
                    <Icon 
                        name={'query-builder'}
                        type={'MaterialIcons'}
                        size={27}
                        color={constants.Colors.strokeGrayColor}
                        style={{ alignSelf: 'flex-end', marginTop:10,marginRight:7 }}
                    />
                    <Text allowFontScaling={false} style={[styles.timeText]}>
                        {/* {time} */}
                        {subscribed2Trip?constants.Utils._humanReadableTime(subscribed2Trip.startTime, subscribed2Trip.weekly):subscribed2Trip.time}
                    </Text>
                </TouchableOpacity>
                
                <View style={[styles.desView,{justifyContent:'flex-start',width:'60%', marginTop:10}]}>
                    <Icon 
                        name={'calendar-blank'}
                        type={'material-community'}
                        size={27}
                        color={constants.Colors.strokeGrayColor}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <Text allowFontScaling={false} style={[styles.dateTxt,{lineHeight:30,color:constants.Colors.blackColor,fontSize:20}]}>
                         {subscribed2Trip?constants.Utils._humanReadableDate(subscribed2Trip.startTime):subscribed2Trip.date}
                    </Text>
                </View>
                </View>
            </View>
           
            <View style={{flex:1}}>
                <MapView 
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    showsMyLocationButton={true}
                    customMapStyle={constants.Maps.MAP_STYLE_ULTRA_BLUE}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    showsCompass={true}
                    region={centeredRegion}
                >
                    {subscribed2Trip?.routePoints && subscribed2Trip?.routePoints?.length>0 && subscribed2Trip.routePoints[0] && subscribed2Trip.routePoints[1] ? (
                        <Polyline coordinates={subscribed2Trip.routePoints.map((point)=>{
                                return {latitude: point.latitude, longitude: point.longitude}
                                })                            
                            }
                            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeColors={[
                                '#7F0000',
                                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                                '#B24112',
                                '#E5845C',
                                '#238C23',
                                '#7F0000'
                            ]}
                            strokeWidth={4}
                        />):(subscribed2Trip.startLocation && subscribed2Trip.destinationLocation) ?
                        (<Polyline
                        coordinates={[
                            { latitude: subscribed2Trip.startLocation.latitude, longitude: subscribed2Trip.startLocation.longitude },
                            { latitude: subscribed2Trip.destinationLocation.latitude, longitude: subscribed2Trip.destinationLocation.longitude },                        
                        ]}
                        strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                        strokeColors={[
                            '#7F0000',
                            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                            '#B24112',
                            '#E5845C',
                            '#238C23',
                            '#7F0000'
                        ]}
                        strokeWidth={4}
                    />) : null }
                    {subscribed2Trip?.startLocation ? (
                        <Marker title={subscribed2Trip?.startLocation?.title ? subscribed2Trip.startLocation.title : ''}                        
                                coordinate={{ latitude: subscribed2Trip.startLocation.latitude, longitude: subscribed2Trip.startLocation.longitude }}
                        > 
                            <Icon color={Constants.Colors.primaryColor} name="directions-car" type={'MaterialIcons'} />
                        </Marker>               
                    ): (subscribed2Trip?.routePoints && subscribed2Trip?.routePoints?.length > 0 && subscribed2Trip?.routePoints[0] && subscribed2Trip?.routePoints[1]) ? (
                        <Marker title={subscribed2Trip?.routePoints[0]?.title && subscribed2Trip?.routePoints[0]?.title !== '' ? subscribed2Trip.routePoints[0].title : ''}
                            coordinate={{ latitude: subscribed2Trip.routePoints[0].latitude, longitude: subscribed2Trip.routePoints[0].longitude }}
                        >
                            <Icon color={Constants.Colors.primaryColor} name="directions-car" type={'MaterialIcons'} />
                        </Marker>
                    ): null 
                    }

                    {subscribed2Trip?.destinationLocation ? (
                        <Marker
                        title={subscribed2Trip.destinationLocation.title}
                        coordinate={{ latitude:subscribed2Trip.destinationLocation.latitude, longitude: subscribed2Trip.destinationLocation.longitude }}
                                        ><Icon color={Constants.Colors.pink400Color} name="location-on" type={'material'} /></Marker>                   
                    ): subscribed2Trip?.routePoints[subscribed2Trip.routePoints.length-1] ? (
                        <Marker
                        title={subscribed2Trip.routePoints[subscribed2Trip.routePoints.length-1].title}
                        coordinate={{ latitude: subscribed2Trip.routePoints[subscribed2Trip.routePoints.length-1].latitude, longitude: subscribed2Trip.routePoints[subscribed2Trip.routePoints.length-1].longitude }}
                        ><Icon color={Constants.Colors.pink400Color} name="location-on" type={'material'} /></Marker> 
                    ): null }

                    {subscribed2Trip?.routePoints && subscribed2Trip?.routePoints?.length > 2 ? _onlyIntermediatePoints(subscribed2Trip.routePoints).map((item:any) => 
                    (
                        <Marker title={item.title ? item.title: ''} key={item.title ? item.title: item.latitude} coordinate={{ ...item }}>
                            <Icon color={constants.Colors.primaryDarkColor} name="location-on" />
                        </Marker>
                    )): null
                    }         

                </MapView>
            </View>
            </ScrollView>

            { 
            showButton &&<Button
                containerStyle={{ borderRadius:0 }}
                buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor, borderRadius:0 }]}
                title={btnText}
                raised
                onPress={onBottomBtn}
            />}

            {console.log(showButton)}
            
            {selectedSubscriber && subscribers.length > 0 ?
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
                    <Text style={styles.requestTextView}>{hasPendingRequest?formatMessage('pending_request'):formatMessage('passenger_accepted')}</Text>
                </View>
                <View style={[styles.ImageViewStyles,{paddingVertical:10}]}>
                    {selectedSubscriber.user.photo?<Avatar 
                        size={75}
                        rounded
                        title={Constants.Utils._getInitials(selectedSubscriber.user.name)}
                        titleStyle={{ color: constants.Colors.whiteColor }}
                        containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }}
                        //onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                        // source={constants.Images.AVATAR}
                        source={{ uri: (__DEV__ ? Constants.Network.DEV_Network.API_URL : Constants.Network.PRD_Network.API_URL) + '/photo?filename=' + selectedSubscriber.user.photo }}
                    />:<Avatar 
                        size={75}
                        rounded
                        titleStyle={{ color: constants.Colors.whiteColor }}
                        containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }}
                        //onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                        source={constants.Images.AVATAR}
                    />}
                    <Text style={{fontSize:18,color: constants.Colors.greyTextColor,marginTop:10}}>{selectedSubscriber.user.name}</Text>
                </View>
                <View style={styles.ImageViewStyles}>
                    <ListItem
                        style={{width:'90%' }}
                        title={selectedSubscriber.user.email}
                        leftIcon={{ name: 'email', color: constants.Colors.greyTextColor }}
                        rightIcon={{ name: 'chevron-right', color: constants.Colors.greyTextColor }}
                        bottomDivider
                        onPress={() => Communications.email([selectedSubscriber.user.email], null, null, 'Rideshare', 'Hi!, I would like to know more about your trip.')}
                    />
                </View>

                <View style={styles.ImageViewStyles}>
                    <ListItem
                        style={{width:'90%'}}
                        title={selectedSubscriber.user.phone}
                        leftIcon={{ name: 'phone', color: constants.Colors.greyTextColor }}
                        rightIcon={{ name: 'chevron-right', color: constants.Colors.greyTextColor }}
                        bottomDivider
                        onPress={() => Communications.phonecall(selectedSubscriber.user.phone, true)}
                        /> 
                </View>

                <View style={styles.ImageViewStyles}>    
                    <ListItem
                        style={{width:'90%'}}
                        title={'SMS'}
                        // title={props.translate('cancel')}
                        leftIcon={{ name: 'message', color: constants.Colors.greyTextColor }}
                        rightIcon={{ name: 'chevron-right', color: constants.Colors.greyTextColor }}
                        onPress={() => Communications.text(selectedSubscriber.user.phone)} /> 
                </View>  
                {props.preferences.isDriver == true && hasPendingRequest &&<View style={styles.BottomTextView}>    
                    <View style={styles.btnView}>
                        <Text style={[styles.btnText,{color: constants.Colors.red900Color}]} 
                              onPress={_rejectPendingSubsciption}>
                                {formatMessage('reject')}
                        </Text>
                    </View>
                    <View style={styles.centerView} />
                    <View style={styles.btnView}>
                        <Text style={[styles.btnText,{color: constants.Colors.greyTextColor}]} 
                              onPress={_acceptPendingSubsciption}>
                                  {formatMessage('accept')}
                        </Text>
                    </View>
                </View>}  
            </Modal>:null}

            <Modal
                onBackButtonPress={() => {
                    setIsNoteModalVisible(false);
                }}
                onBackdropPress={() => {
                    setIsNoteModalVisible(false);
                }}
                isVisible={isNoteModalVisible}
                style={styles.noteModalStyle}
                >
                <View style={styles.noteModalViewStyle}>
                    <View style={styles.noteSubView}>
                      <Text style={styles.noteSubText}>{formatMessage('enter_note')}</Text>
                    </View>

                    <TextInput
                        style={styles.modalTextInputStyle}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={50}
                        autoFocus
                        autoCorrect={false}
                        value={note}
                        onChangeText={(text) => setNote(text)}
                    />
                    <TouchableOpacity
                    onPress={() => {
                        actions.set_noteFor_Trip(props.current.token,subscribed2Trip.id, note);
                        setIsNoteModalVisible(false);
                    }}
                    >
                    <Text style={{ width: '100%', fontSize: 18, textAlign: 'right', color: Constants.Colors.primaryColor, margin: 20 }}>{formatMessage('button/send')}</Text>
                    </TouchableOpacity>
                </View>
                </Modal>

        </View>
        );
}

const actions = {  set_removeSubscription_Trip, set_reactivate_Trip,get_pastRide,set_deactivate_Trip, set_subscribe, get_rideDetails,
    set_acceptSubscription_Trip,set_rejectSubscription_Trip, set_noteFor_Trip, cancelPendingTripRequest,set_ConfirmTrip, set_PendingTripList};

function mapStateToProps(state: any) {
    // console.log('app - current', state.authReducer.current)
    return {
        app : state.appReducer,           
        current: state.authReducer.current,
        preferences: state.preferences,
    };
}

export default connect(mapStateToProps, actions)(TripDetails);

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:constants.Colors.whiteColor
    },
    headerTxt: {
        color: constants.Colors.whiteColor,
        fontSize: 18,
        fontWeight: '400',           
    },
    desView: {
        flexDirection:'row',
        padding: 7
    },
    dateTxt: {
        color: constants.Colors.darkGrayColor,
        fontSize: 18,
        paddingLeft: 20,
        flexShrink: 1
    },
    rightView: {
        paddingVertical: 7,
        paddingHorizontal: 7,
        borderTopWidth:1,
        borderTopColor:constants.Colors.lightGrayColor
    },
    noteText: {
        color: constants.Colors.strokeGrayColor,
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft:5
    },
    map: {
        //width:'100%',
        height: Platform.OS ==='ios' ? 400 : 280
    },
    btn: {
        padding: 15,
        // borderWidth:1,
        alignItems: 'center',
        justifyContent: 'center',
        // borderColor: constants.Colors.primaryColor,
        // borderRadius:10
    },
    timeText: {
        lineHeight:30,
        backgroundColor:constants.Colors.lightGrayColor,
        paddingVertical:7,
        paddingHorizontal:15,
        color: constants.Colors.blackColor,
        fontSize: 18,
    },
    nameTxt: {
        fontWeight: 'bold',
        fontSize: 20,
        color: constants.Colors.primaryColor,
        paddingLeft: 20,
        lineHeight: 20,
        flexShrink: 1
    },
    weekName: {
        justifyContent:'flex-start',
        width:'60%', 
        marginTop:10,
    },
    avatarView: {
        paddingVertical: 7,
        borderTopWidth:1,
        borderTopColor:constants.Colors.lightGrayColor
    },
    dirTxt: {
        fontSize: 18,
        color:constants.Colors.primaryColor,
        marginTop:3
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
        justifyContent:'center',
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
    noteModalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    noteModalViewStyle: {
        backgroundColor: 'white',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    noteSubView: { 
        width: '100%',
        height: 60,
        marginBottom: 25, 
        backgroundColor: Constants.Colors.primaryColor, 
        justifyContent: 'center' 
    },
    noteSubText: { 
        fontSize: 19, 
        textAlign: 'center', 
        textAlignVertical: 'center', 
        color: Constants.Colors.lightFontColor 
    },
    modalTextInputStyle: {
        backgroundColor: Constants.Colors.whiteColor,
        borderBottomColor: '#000000',
        borderBottomWidth: 1,
        width: 200,
        fontSize: 15,
    },
    notesText: {
        width:'80%',
        fontSize:14,
        color: constants.Colors.darkGrayColor,
        paddingLeft: 5
    },
    noteView: {
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'row',
    },
    noteViewDuplicated: {
        paddingVertical: 5,
        borderTopWidth:1,
        borderTopColor:constants.Colors.lightGrayColor
    },
})