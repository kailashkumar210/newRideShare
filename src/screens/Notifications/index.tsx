import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Avatar, Icon } from "react-native-elements";
import { Text, View, StyleSheet, FlatList, Dimensions, Image, ActivityIndicator } from 'react-native';
import constants from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useGlobalize } from 'react-native-globalize';
import {connect,} from 'react-redux';
import { get_notifications } from '../../redux/actions/notifications'
import moment from 'moment';
import SubscriberTrip from '../../models/SubscriberTrip';
import Trip from '../../models/Trip';
var _ = require('lodash');


// FlatList Item Layout
function Item(props: any) {
    
  let data = props.item;
  //console.log('notifications ios ',data);

    const _isTripAlertNotification=(notification: any) => {
        return notification.notificationType === 'TRIP_AVAILABLE';
    }
    
    const  _isReadOnlyTripDetails =(notification: any) => {
      console.log("Read Only Check data ",notification);
        return notification.notificationType === 'SUBSCRIPTION_REQUEST_REJECTED';
    }

    const _navigateToTripDetails = (item: Trip, readOnlyTripDetails: boolean) => {
        console.log("NavigateToTrip Details ",item);
        let buttonText = '';
        let startLocationObject = item.routePoints[0];
        let destinationLocationObject = item.routePoints[item.routePoints.length - 1];
        let time = constants.Utils._humanReadableTime(item.startTime, item.weekly);
    
        let routePoints = _.reject(item.routePoints, { position: 1 });
        routePoints = _.reject(routePoints, { position: item.routePoints.length });
        let passProps;
        if (item.weekly) {
          passProps = {
            tripId: item.id,
            startLocationObject: startLocationObject,
            destinationLocationObject: destinationLocationObject,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            user: item.user,
            time: time,
            days: item.days,
            vehicle: item.vehicle,
            tripDetails: item,
            readOnlyTripDetails: readOnlyTripDetails,
          };
        } else {
          passProps = {
            tripId: item.id,
            startLocationObject: startLocationObject,
            destinationLocationObject: destinationLocationObject,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            user: item.user,
            time: time,
            date: constants.Utils._humanReadableDate(item.startTime),
            vehicle: item.vehicle,
            tripDetails: item,
            readOnlyTripDetails: readOnlyTripDetails,
          };
        }

        if (props.item.trip.active) 
        {
          buttonText = 'Deactivate';
        } 
        else
        {
          buttonText = "Activate";
        }

        if(readOnlyTripDetails)
        { console.log("Read Only ", readOnlyTripDetails);
          buttonText = '';
        }
        // else if (!props.item.trip && active) 
        // {
        //   buttonText = 'Deactivate';
        // } 
        // else if (!props.item.trip && !active)
        // {
        //   buttonText = 'Activate';
        // }
    
        props.navigation.navigate('TripDetails',{
          subscribed2Trip:props.item.trip,  
          bottomButtonText: buttonText,       
          passProps

        });
      };
    
      const _navigateToSubscriberTripDetails = (subscriberTrip: SubscriberTrip) => {


        let item = subscriberTrip.trip;
        let bottomButtonText = '';
        console.log("Clicked navigateToSubscriberTripDetails Item ", subscriberTrip);

        let startLocationObject = item.routePoints[0];
        let destinationLocationObject = item.routePoints[item.routePoints.length - 1];
        let time = constants.Utils._humanReadableTime(item.startTime, item.weekly);
    
        let routePoints = _.reject(item.routePoints, { position: 1 });
        routePoints = _.reject(routePoints, { position: item.routePoints.length });
        let passProps = {
          tripId: item.id,
          startLocationObject: startLocationObject,
          passengerStartLocationObject: subscriberTrip.startLocation,
          passengerdestinationLocationObject: subscriberTrip.destinationLocation,
          destinationLocationObject: destinationLocationObject,
          routePoints: routePoints,
          weekly: item.weekly,
          active: item.active,
          ongoing: item.ongoing,
          user: item.user,
          time: time,
          subscriberTrip: subscriberTrip,
          days: undefined,
          date: undefined,
          vehicle: item.vehicle,
          tripDetails: item,
        };
    
        if (item.weekly) {
          passProps.days = constants.Utils._DaysFromCron(subscriberTrip.days, subscriberTrip.passengerCount);
        } else {
          passProps.date = constants.Utils._humanReadableDate(item.startTime);
        }

        if(subscriberTrip && subscriberTrip.active)
        {
          bottomButtonText = 'Unsubscribe';
        }

        // if (this.props.subscriberTrip && this.props.subscriberTrip.active) {
        //   buttonText = 'Unsubscribe';
        // } else if (!this.props.subscriberTrip && this.props.active) {
        //   buttonText = 'Deactivate';
        // } else if (!this.props.subscriberTrip && !this.props.active) {
        //   buttonText = 'Activate';
        // }

    

        props.navigation.navigate('TripDetails',{
          subscribed2Trip : item,
          passProps,
          bottomButtonText
        });
      };
    
      const _navigateToTripAlertTripDetails = (notification: any) => {
        console.log("navigate to TRip Alert Detail ",notification);
        const tripAlertTripDetails = _constructTripAlertDetails(notification);
    
        let item = tripAlertTripDetails.trip;
        let startLocationObject = item.routePoints[0];
        let destinationLocationObject = item.routePoints[item.routePoints.length - 1];
        let time = constants.Utils._humanReadableTime(item.startTime, item.weekly);
    
        let routePoints = _.reject(item.routePoints, { position: 1 });
        routePoints = _.reject(routePoints, { position: item.routePoints.length });
        const daysCrons = tripAlertTripDetails.days;
        let days = {
          sun: daysCrons.includes('0') ? 1 : 0,
          mon: daysCrons.includes('1') ? 1 : 0,
          tue: daysCrons.includes('2') ? 1 : 0,
          wed: daysCrons.includes('3') ? 1 : 0,
          thu: daysCrons.includes('4') ? 1 : 0,
          fri: daysCrons.includes('5') ? 1 : 0,
          sat: daysCrons.includes('6') ? 1 : 0,
        };
    
        let passProps;
        if (item.weekly) {
          passProps = {
            tripId: item.id,
            startLocationObject,
            destinationLocationObject,
            passengerStartLocationObject: tripAlertTripDetails.startLocation,
            passengerdestinationLocationObject: tripAlertTripDetails.destinationLocation,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            capacity: tripAlertTripDetails.capacity,
            user: item.user,
            time: time,
            days: item.days,
            tripConfirmationMode: true,
            vehicle: item.vehicle,
            tripDetails: item,
          };
        } else {
          passProps = {
            tripId: item.id,
            startLocationObject,
            destinationLocationObject,
            passengerStartLocationObject: tripAlertTripDetails.startLocation,
            passengerdestinationLocationObject: tripAlertTripDetails.destinationLocation,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            capacity: tripAlertTripDetails.capacity,
            user: item.user,
            time: time,
            date: constants.Utils._humanReadableDate(item.startTime),
            tripConfirmationMode: true,
            vehicle: item.vehicle,
            tripDetails: item,
          };
        }
        
        // if (subscriberTrip && subscriberTrip.active) 
        // {
        //   buttonText = 'Unsubscribe';
        // } else if (!subscriberTrip && active) {
        //   buttonText = 'Deactivate';
        // } else if (!subscriberTrip && !active) {
        //   buttonText = 'Activate';
        // }

        console.log('review navigation here')
        props.navigation.navigate('TripDetails',{
          subscribed2Trip: props.item.trip,
          passProps,
        });
      };
    
      const _constructTripAlertDetails=(notification: any) => {
        let tripAlertTripDetails = new SubscriberTrip();
        tripAlertTripDetails.trip = notification.trip;
        let searchedTrip = notification.intendedTrip;
        let startLocationObject = {
          title: searchedTrip.startAddressTitle,
          latitude: searchedTrip.startLatitude,
          longitude: searchedTrip.startLongitude,
        };
    
        let destLocationObject = {
          title: searchedTrip.destAddressTitle,
          latitude: searchedTrip.destLatitude,
          longitude: searchedTrip.destLongitude,
        };
    
        tripAlertTripDetails.startLocation = startLocationObject;
        tripAlertTripDetails.destinationLocation = destLocationObject;
        tripAlertTripDetails.capacity = searchedTrip.capacity;
        tripAlertTripDetails.days = searchedTrip.days;
        return tripAlertTripDetails;
      }

    return (
        <TouchableOpacity
            onPress={() => {
              if (_isTripAlertNotification(data)) {
                _navigateToTripAlertTripDetails(data);
              } else if (data.trip) {
                console.log(data);
                _navigateToTripDetails(data.trip, _isReadOnlyTripDetails(data));
              } else if (data.subscriberTrip) {
                _navigateToSubscriberTripDetails(data.subscriberTrip);
              }
            }}
          >
        <View key={data.id.toString()} style={[styles.itemView]}>            
            {data.sender?.photo && data.sender?.photo !== null ? <Avatar 
              size={50}
              rounded
              title={constants.Utils._getInitials(data.sender.name)}
              titleStyle={{ color: constants.Colors.whiteColor }}
              containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }}
              onPress={() => console.log("Works!")}
              activeOpacity={0.7}
              // source={constants.Images.AVATAR}
              source={{ uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + data.sender.photo }}
          />: data.sender ? <Avatar 
              size={50}
              rounded
              titleStyle={{ color: constants.Colors.whiteColor }}
              containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }}
              onPress={() => console.log("Works!")}
              activeOpacity={0.7}
              source={constants.Images.AVATAR}
          /> : null}
            
            {!data.sender && (
                <View style={{ width: 50, alignItems: 'center' }}>
                  <Image source={constants.Images.NOTIFICATION_ICON} />
                </View>
            )}
           
            <View style={[styles.rightView, { borderTopColor: (props.index != 0) ? constants.Colors.strokeGrayColor : 'transparent' }]}>
                <View style={styles.desView}>
                    <Text allowFontScaling={false} style={styles.dateTxt}>{moment(data.time).format(constants.DateTime.datetimeShortFormat)}</Text>
                    <Text allowFontScaling={false} style={styles.nameTxt}>{data.sender ? data.sender.name : 'Ride Alert!'}</Text>
                    <Text allowFontScaling={false} style={styles.dateTxt}>{data.message}</Text>                    
                </View>

                <TouchableOpacity style={styles.rightBtn}>
                    <Icon
                        name={'keyboard-arrow-right'}
                        size={25}
                        color={constants.Colors.blackColor}
                        style={{ alignSelf: 'center' }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
   );
}

const Notifications: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [remoteLoading, setremoteLoading]= useState(false);

    useFocusEffect(      
      useCallback(()=>{
        console.log('UsefocusEffect ', remoteLoading);
          //if (notifications.toString()==='' && !remoteLoading)
         // {
              _get_RemoteNotifications();
         // }
        },[remoteLoading])
    )

  

    const _get_RemoteNotifications = () =>{
        setLoading(true);
        actions.get_notifications(props.current.token, props.preferences.isDriver).then((response) =>
        {
            console.log('notifications api responded')
            //console.log(response);
            if (response.message === 'success'){
                setNotifications(response.data); 
            }
            //setremoteLoading(true);
            setLoading(false);
        }).catch((e)=> {
            console.log(e);
            //setremoteLoading(true);
            setLoading(false);
        });      
    }

    const _renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: '80%',
              alignSelf: 'flex-end',
              backgroundColor: '#CED0CE',
            }}
          />
        );
      };
      
    // const _renderFooter = () => {
    //     if (!loading) return null;
    
    //     return (
    //       <View
    //         style={{
    //           paddingVertical: 20,
    //           borderTopWidth: 1,
    //           borderColor: '#CED0CE',
    //         }}
    //       >
    //         <ActivityIndicator animating size="large" />
    //       </View>
    //     );
    //   };
    
     const _emptyView = ():any => {
        return (
          !loading && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  padding: 20,
                }}
              >
                {formatMessage('notifications/no_Notifications')}
              </Text>
            </View>
          )
        );
      };

      const _handleRefresh = () => {
        setremoteLoading(false);
       // _get_RemoteNotifications();
      }

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/NotificationScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
            />
            <FlatList
                style={{ flex: 1 }}
                data={notifications}
                keyExtractor={item => item['id']+''}
                renderItem={({ item, index }) => <Item item={item} index={index+''} {...props}/>}
                ItemSeparatorComponent={_renderSeparator}
                onRefresh={_handleRefresh}
                refreshing={loading}
                ListEmptyComponent={_emptyView}
                // ListFooterComponent={_renderFooter}
            />
        </View>
    );
};

function mapStateToProps(state: any) {
  console.log("Preferences in Notification ", state.preferences);
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
        preferences: state.preferences,
    };
}
//same as dispatchmapto props in eS6
const actions = {get_notifications};

export default connect(mapStateToProps, actions)(Notifications);

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
