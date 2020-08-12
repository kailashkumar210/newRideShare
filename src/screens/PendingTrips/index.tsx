import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, FlatList, ActivityIndicator } from 'react-native';
import constants from '../../constants';
import Header from '../../components/Header';

import { Avatar, Icon, ButtonGroup, Button, CheckBox } from "react-native-elements";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGlobalize, selectTimeUnit } from 'react-native-globalize';
import { set_PendingTripList } from '../../redux/actions/trip';
import { get_subscribed_PendingRequests } from '../../redux/actions/subscriber'
import {connect,} from 'react-redux';
import { Location } from '../../models/types';
import {Days} from '../../models/types';
import SubscriberTrip from '../../models/SubscriberTrip';
import Trip from '../../models/Trip';
import useBackButton from '../../components/BackButtonHandler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
var _ = require('lodash');

interface NewRideProps {
    startLocationObject: Location,
    destinationLocationObject: Location,
 }

const PendingTripTrip: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    
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
    useBackButton('backScreen',props);

    useEffect(()=> {
        if (data.toString()==='' && loadFirstTime)
        {
            console.log("Use Effect ")
            _handleRefresh();
        }
    },[]);

    const _handleRefresh = () => {
            setPage(1);
            setSeed(seed+1);
            setRefreshing(true);
            _makeRemoteRequest();        
    };

    const _makeRemoteRequest = async () => {
        try {
            actions.get_subscribed_PendingRequests(props.auth.current.token).then(()=> setRefreshing(false))
            // setPendingCount(props.trips.PendingTrips.lenght);
            
        } catch (error) {
            console.log(error)
            setRefreshing(false);
        }
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
        navigation.navigate('TripDetails', {subscribed2Trip:subscriberTrip.trip, bottomButtonText : 'Cancel Request'});
      };

    const _renderSubscriberTripItem = ({ item }) => {
      //  console.log('item in pending trip screen',item)
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
                  <Avatar medium rounded source={{ uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + trip.user.photo }} />
                ) : (
                  <Avatar medium rounded source={constants.Images.AVATAR} containerStyle={{ backgroundColor: constants.Colors.positiveButtonColor }} />
                  // <Avatar size={60} rounded title={constants.Utils._getInitials(trip.user.name)} containerStyle={{backgroundColor:constants.Colors.greyTextColor}} />
                )}
                <View>
                  <Text style={{ fontSize: 18, marginLeft: 10,color:constants.Colors.darkGrayColor,flexShrink: 1, fontWeight:'bold' }}>{trip.user.name} </Text>
    
                  <Text style={{ fontSize: 16, marginLeft: 10, color: constants.Colors.darkGrayColor }}>
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
                <Text style={styles.IconTextStyle}>{formatMessage('past_trip/Dropoff_label')}: {trip.routePoints[trip.routePoints.length - 1].title}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      };

    return (
        <View style={{ marginTop:0, borderTopWidth: 0, borderBottomWidth: 0 }}>
        <Header
                headerText={formatMessage('screen/PendingTripRequestScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
        />
        <FlatList
          // data={subscriber.SubscriberTrips.filter((p:SubscriberTrip)=> p.active === active).reverse()
          //     //_.filter(this.mSubscriberTripStore.SubscriberTripsList().reverse(), ['active', this.props.active])
          // }
          data={props.subscriber.PendingTripsRequests}
          renderItem={_renderSubscriberTripItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={separator}
          ListFooterComponent={_renderFooter}
          onRefresh={()=> _handleRefresh()}
          refreshing={refreshing}
          // onEndReached={this._handleLoadMore}
          ListEmptyComponent={emptyList}
          // onEndReachedThreshold={50}
        />
      </View>
    );
}

function mapStateToProps(state: any) {
  console.log('state.PendingTrips', state.subscriber.PendingTripsRequests)
    return {
        auth: state.authReducer,    
        subscriber: state.subscriber        
    };
}

//same as dispatchmapto props in eS6
const actions = {set_PendingTripList,get_subscribed_PendingRequests};

export default connect(mapStateToProps, actions)(PendingTripTrip);


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
    IconStyle: {
      marginLeft: 10,
      marginRight:10
    },
    MainIconViewStyle: { 
      alignItems: 'center', 
      flexDirection: 'row'
    },
    IconTextStyle: { 
      fontSize: 16,
      color:constants.Colors.darkGrayColor,
      flexShrink: 1
    },
  });
  