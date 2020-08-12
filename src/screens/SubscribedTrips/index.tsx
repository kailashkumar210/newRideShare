import React, { useState, useEffect } from 'react';
import { Text,RefreshControl, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, FlatList, ActivityIndicator } from 'react-native';
import constants from '../../constants';
import Header from '../../components/Header';

import { Avatar, Icon, ButtonGroup, Button, CheckBox } from "react-native-elements";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGlobalize, selectTimeUnit } from 'react-native-globalize';
import { get_RemoteSubscribed } from '../../redux/actions/subscriber';
import {connect,} from 'react-redux';
import { Location } from '../../models/types';
import {Days} from '../../models/types';
import SubscriberTrip from '../../models/SubscriberTrip';
import Trip from '../../models/Trip';
// import useBackButton from '../../components/BackButtonHandler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
var _ = require('lodash');

interface NewRideProps {
    startLocationObject: Location,
    destinationLocationObject: Location,
 }

const SubscribedTrips: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    
    let navigation = useNavigation();
    const {formatMessage} = useGlobalize();
    const [loading, setLoading]= useState(false);
    // get the connected states from the store
    const { trips, subscriber, preferences, auth } = props;
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [seed, setSeed] = useState(1);
    const [active, setActive]= useState(true);
    const [error, setError]= useState('');
    const [refreshing, setRefreshing]= useState(false);
    const [loadFirstTime, setLoadFirsttime] = useState(true);
    // useBackButton('backScreen',props);

    console.log("Props on Navigation ",props.route);
    
    useFocusEffect(()=> {
        if (data.toString()==='' && loadFirstTime)
        {
            _handleRefresh();
        }
    });

    const _handleRefresh = () => {
            setPage(1);
            setSeed(seed+1);
            setRefreshing(true);
            _makeRemoteRequest();        
    };

    const _makeRemoteRequest = () => {
        setLoading(true);
        console.log(props.auth)
        actions.get_RemoteSubscribed(auth.current.token).then(()=>{
            console.log('subscriber data', subscriber);
            setData(subscriber.SubscriberTrips);
            setError('');
            setRefreshing(false);
            setLoading(false);            
            setLoadFirsttime(false);            
        }).catch(error => {
            console.log(error);
            setError(error);
            setRefreshing(false);
            setLoading(false);
        });
        setLoadFirsttime(false);
        
    }

    const _handleLoadMore = () => {
        setPage(page+1);
        _makeRemoteRequest();
    }

    const emptyList =()=> {
        if (loading){ return null}else { return (<View
        style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        }}>
        <Text
            style={{
                fontSize: 15,
                padding: 20,
            }}
        >
            {formatMessage('no_trips')}
        </Text>
    </View>)}
    };

    const separator =()=>{ return (<View
    style={{
        height: 1,
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#CED0CE',
    }} />)}
    
    const _renderFooter = () => {
        if (!loading) return null;
    
        return (
          <View
            style={{
              paddingVertical: 20,
              borderTopWidth: 1,
              borderColor: '#CED0CE',
            }}
          >
            <ActivityIndicator animating size="large" />
          </View>
        );
    };

    const _navigateToTripDetails = (subscriberTrip: SubscriberTrip) => {
        // let item = subscriberTrip.trip;
        // let startLocationObject = item.routePoints[0];
        // let destinationLocationObject = item.routePoints[item.routePoints.length - 1];
        // let time = constants.Utils._humanReadableTime(item.startTime, item.weekly);
    
        // let routePoints = _.reject(item.routePoints, { position: 1 });
        // routePoints = _.reject(routePoints, { position: item.routePoints.length });
        // let passProps = {
        //   tripId: item.id,
        //   startLocationObject: startLocationObject,
        //   passengerStartLocationObject: subscriberTrip.startLocation,
        //   passengerdestinationLocationObject: subscriberTrip.destinationLocation,
        //   destinationLocationObject: destinationLocationObject,
        //   routePoints: routePoints,
        //   weekly: item.weekly,
        //   active: item.active,
        //   ongoing: item.ongoing,
        //   user: item.user,
        //   time: time,
        //   subscriberTrip: subscriberTrip,
        //   days: undefined,
        //   date: '',
        //   vehicle: item.vehicle,
        //   tripDetails: item,
        // };
    
        // if (item.weekly) {
        //   passProps.days = constants.Utils._DaysFromCron(subscriberTrip.days, subscriberTrip.passengerCount);
        // } else {
        //   passProps.date = constants.Utils._humanReadableDate(item.startTime);
        // }
        
        // console.log('passProps',passProps)
        navigation.navigate('TripDetails', {subscribed2Trip: subscriberTrip.trip, driverDetail: subscriberTrip.trip.user,vehicleDetail: subscriberTrip.trip.vehicle, screenTitle:  props.route.name, bottomButtonText : "Unsubscribe"});
      };

    const _renderSubscriberTripItem = ({ item }) => {
        let trip: Trip = item.trip;
    
        return (
          <TouchableOpacity
            onPress={() => {
              _navigateToTripDetails(item);
            }}
          >
            <View style={{ margin: 10 }}>
              <View style={styles.driverRow}>
                {trip.user.photo ? (
                  <Avatar medium rounded source={{ uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + trip.user.photo }} containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }}
                  />
                ) : (
                  <Avatar medium rounded source={constants.Images.AVATAR} containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }} />
                  // <Avatar size={60} rounded title={constants.Utils._getInitials(trip.user.name)} containerStyle={{ backgroundColor: constants.Colors.greyTextColor }} />
                )}
                <View>
                  <Text style={{fontSize: 18, marginLeft: 10,color:constants.Colors.darkGrayColor, flexShrink: 1,fontWeight: 'bold'}}>{trip.user.name} </Text>
    
                  <Text style={{ fontSize: 16, marginLeft: 10,color: constants.Colors.darkGrayColor, flexShrink: 1 }}>
                    {formatMessage('past_trip/At_label') + constants.Utils._humanReadableTime(trip.startTime, trip.weekly)}
                  </Text>
                </View>
              </View>
    
              <View style={styles.MainIconViewStyle}>
                <Icon style={styles.IconStyle} color={constants.Colors.primaryColor} name="calendar" type="material-community" />
                <Text style={styles.IconTextStyle}>{formatMessage('past_trip/On_label')} {trip.weekly ? constants.Utils._humanReadableDaysFromCron(item.days) : constants.Utils._humanReadableDate(trip.startTime)} </Text>
              </View>
              <View style={styles.MainIconViewStyle}>
                <Icon style={styles.IconStyle} color={constants.Colors.primaryColor} name="directions-car" />
                <Text style={styles.IconTextStyle}>{formatMessage('past_trip/Pickup_label')} : {trip.routePoints[0].title}</Text>
              </View>
    
              <View style={[styles.MainIconViewStyle, { marginBottom: 10 }]}>
                <Icon style={styles.IconStyle} color={constants.Colors.pink400Color} name="location-on" />
                <Text style={styles.IconTextStyle}>{formatMessage('past_trip/Dropoff_label')} : {trip.routePoints[trip.routePoints.length - 1].title}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      };

    return (
        <View style={{ marginTop:0, borderTopWidth: 0, borderBottomWidth: 0 }}>
        <Header
                headerText={ props.route.name == "Past Rides" ? formatMessage('screen/PastTripsScreen') : formatMessage('screen/SubscribedTripsScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
        />
        <FlatList
          data={
            props.route.name !== "Past Rides" ?
            subscriber.SubscriberTrips.filter((p:SubscriberTrip)=> p.active).reverse():
            subscriber.SubscriberTrips.filter((p:SubscriberTrip)=> !p.active).reverse()
          }
            
          renderItem={_renderSubscriberTripItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={separator}
          ListFooterComponent={_renderFooter}
          onRefresh={()=> _handleRefresh()}
          refreshing={refreshing}
          //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>_handleRefresh()} />}
          // onEndReached={this._handleLoadMore}
          ListEmptyComponent={emptyList}
          // onEndReachedThreshold={50}
        />
      </View>
    );
}

function mapStateToProps(state: any) {
  //console.log('SubscriberTrips data', state.subscriber.SubscriberTrips)
    return {
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences,   
        subscriber: state.subscriber,     
        trips: state.trips,     
    };
}

//same as dispatchmapto props in eS6
const actions = {get_RemoteSubscribed};

export default connect(mapStateToProps, actions)(SubscribedTrips);


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: constants.Colors.backgroundColor,
    },
    driverRow: {
      margin: 10,
  
      flexDirection: 'row',
      justifyContent: 'flex-start',
  
      alignItems: 'center',
    },
    IconTextStyle: { 
      fontSize: 16,
      color:constants.Colors.darkGrayColor,
      flexShrink: 1
    },
    IconStyle: {
      marginLeft: 10,
      marginRight:10
    },
    MainIconViewStyle: { 
      alignItems: 'center', 
      flexDirection: 'row'
    }
  });
  