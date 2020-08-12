import React, { Component, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import Constants from '../../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { useGlobalize } from 'react-native-globalize';
import { Icon, Avatar, ListItem } from "react-native-elements";
import {connect} from 'react-redux';
import { get_PotentialTripList } from '../../redux/actions/trip'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Location } from '../../models/types';
import useBackButton from '../../components/BackButtonHandler';
import constants from '../../constants';

var _ = require('lodash');

const PotentialRide: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const [potentialTripData, setPotentialTripData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    let startLocationObject:Location = props.route.params && props.route.params.startLocationObject && props.route.params.startLocationObject!== undefined ? props.route.params.startLocationObject : {
      latitude: 13.762925,
      longitude: 100.5091538,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
  let destinationLocationObject:Location = props.route.params && props.route.params.destinationLocationObject && props.route.params.destinationLocationObject!== undefined? props.route.params.destinationLocationObject : {
      latitude: 13.762925,
      longitude: 100.5091538,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
    
    useBackButton('backScreen',props);

    useFocusEffect(
      React.useCallback(()=>{
                  if (navigation.isFocused()){
                  _makeRemoteRequest();}
    },[props.route.params])
  );

    
    const _handleRefresh = () => {
      setRefresh(true);
      _makeRemoteRequest()
    };   
          
    const  _makeRemoteRequest = () => {
          if (props.route?.params && startLocationObject && destinationLocationObject){
            const {capacity,datetime,days,destinationLocationObject,startLocationObject,notifyTripAvailable,weekly} = props.route.params;
            let data = {
                  startAddressTitle: startLocationObject.title,
                  startLat: startLocationObject.latitude,
                  startLon: startLocationObject.longitude,
                  startRange: 2000,
                  destAddressTitle: destinationLocationObject.title,
                  destLat: destinationLocationObject.latitude,
                  destLon: destinationLocationObject.longitude,
                  destRange: 2000,
                  capacity: capacity,
                  datetime: datetime,
                  days: days,
                  weekly: weekly,
                  timeRange:7200,
                  notifyTripAvailable: notifyTripAvailable,
            };

            actions.get_PotentialTripList(props.auth.current.token,data).then((res)=>{
              console.log("Potential Trip Response ", res.data.length);
              setPotentialTripData(res.data);
              setRefresh(false);
          }).catch(error => {
              console.log(error);
          });
        }
    };      


    const _navigateToTripDetails = (item) => {
        let startLocationObject = item.routePoints[0];
        let destinationLocationObject = item.routePoints[item.routePoints.length - 1];
        let time = Constants.Utils._humanReadableTime(item.startTime, item.weekly);
        // console.log("Props.capacity ", props.route.params.capacity);
        let routePoints = _.reject(item.routePoints, { position: 1 });
        routePoints = _.reject(routePoints, { position: item.routePoints.length });
        let status = props.PendingTrips.includes(item.id);

        let passProps;
        if (item.weekly) {
          passProps = {
            tripId: item.id,
            startLocationObject,
            destinationLocationObject,
            passengerStartLocationObject:       props.route.params.startLocationObject,
            passengerdestinationLocationObject: props.route.params.destinationLocationObject,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            capacity: props.route.params.capacity,
            user: item.user,
            time: time,
            daysString: Constants.Utils._humanReadableDays(item.days),
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
            passengerStartLocationObject:       props.route.params.startLocationObject,
            passengerdestinationLocationObject: props.route.params.destinationLocationObject,
            routePoints: routePoints,
            weekly: item.weekly,
            active: item.active,
            ongoing: item.ongoing,
            capacity: props.route.params.capacity,
            user: item.user,
            time: time,
            date: Constants.Utils._humanReadableDate(item.startTime),
            tripConfirmationMode: true,
            vehicle: item.vehicle,
            tripDetails: item,
          };
        }
        console.log('To TripDetails: ', passProps)
        props.navigation.navigate('TripDetails',{passProps,subscribed2Trip:item, bottomButtonText: status?"Cancel Request":"Confirm"});
        // props.navigator.push({
        //   screen: Constants.Screens.TRIP_DETAILS_SCREEN.screen,
        //   title: Constants.Screens.TRIP_DETAILS_SCREEN.title,
        //   passProps,
        // });
      };
    
    const  _deg2rad = deg => {
        return deg * (Math.PI / 180);
      };
    
    const  _getDistanceToClosestPoint = (routePoints, fromLocation) => {

      console.log("FromLoaction ",fromLocation);
        let minDistance: number = -1;
    
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
          }
        }
    
        return minDistance;
      };

    const   _emptyView = () => {
      return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: Constants.Colors.primaryColor,
              }}
            >
              {formatMessage('no_potential_ride')}
            </Text>
          </View>
      );
    };
  
    
    return(
      <View style={{ marginTop:0, borderTopWidth: 0, borderBottomWidth: 0 }}>
            <Header
                headerText={formatMessage('screen/PotentialRidesScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}/>
      <FlatList
        data={potentialTripData}
        renderItem={({ item, index }) => (
          <TouchableOpacity
          key={index}
            onPress={()=>_navigateToTripDetails(item)}
          >
            <View style={{ flexDirection: 'row', margin: 10, paddingLeft: 10, paddingRight: 10 }}>
              {item.user.photo ? (
                <Avatar medium rounded source={{ uri: (__DEV__ ? Constants.Network.DEV_Network.API_URL : Constants.Network.PRD_Network.API_URL) + '/photo?filename=' + item.user.photo }} />
              ) : (
                <Avatar medium rounded source={Constants.Images.AVATAR} containerStyle={{ backgroundColor: Constants.Colors.positiveButtonColor }} />
              )}

              <View style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', flexShrink:1,color:constants.Colors.darkGrayColor }}>{`${item.user.name}`}</Text>
                <Text style={{ fontSize: 16, flexShrink:1,color:constants.Colors.darkGrayColor }}>{formatMessage('leaves')} {Constants.Utils._humanReadableTime(item.startTime, item.weekly)}</Text>
                <Text style={{ fontSize: 16, flexShrink:1,color:constants.Colors.darkGrayColor }}>{formatMessage('type_vehicle')}: {item.vehicle.type}</Text>

                {item.weekly && (
                  <View style={{ flexDirection: 'row', margin: 5, flex: 1, alignItems: 'center' }}>
                    {Object.keys(item.days).map((value, key) => (
                      <Text key={key} style={item.days[value] > 0 ? styles.activeDayText : styles.deactiveDayText}>
                        {value.substring(0, 1).toUpperCase() + ' '}
                      </Text>
                    ))}
                  </View>
                )}

                {!item.weekly && (
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <Text style={styles.dateText}>{Constants.Utils._humanReadableDate(item.startTime)}</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon size={16} marginRight={10} color={Constants.Colors.primaryColor} name="directions-car" />
                  <Text style={{ fontSize: 14,color:constants.Colors.darkGrayColor }}> {_getDistanceToClosestPoint(item.routePoints,startLocationObject)} {formatMessage('m_from')} </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', flexShrink:1,color:constants.Colors.darkGrayColor }}>{formatMessage('pickup_point')}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Icon size={16} marginRight={10} color={Constants.Colors.pink400Color} name="location-on" />
                  <Text style={{ fontSize: 14,color:constants.Colors.darkGrayColor }}>{_getDistanceToClosestPoint(item.routePoints,destinationLocationObject)} {formatMessage('m_from')} </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', flexShrink:1,color:constants.Colors.darkGrayColor }}>{formatMessage('drop_off_point')}</Text>
                </View>
              </View>
              <Icon name="navigate-next" style={{flex:1,justifyContent:'center'}} />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id+''}
        onRefresh={_handleRefresh}
        refreshing={refresh}
        ListEmptyComponent={_emptyView}
      />
      </View>);
}

const actions = { get_PotentialTripList };

function mapStateToProps(state: any) {
    return {
        app : state.appReducer,
        current: state.authReducer.current,
        auth: state.authReducer,    
        //vehicles: state.vehicles, 
        //potentialTrips: state.trips.RemoteTrip.Trips,
        PendingTrips: state.trips.PendingTrips 
      
    };
}

export default connect(mapStateToProps, actions)(PotentialRide);


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: Constants.Colors.backgroundColor,
    },
    activeDayText: { fontSize: 18, color: Constants.Colors.positiveButtonColor },
    dateText: { fontSize: 17, color: Constants.Colors.positiveButtonColor },
    deactiveDayText: { fontSize: 18, color: Constants.Colors.strokeGrayColor },
  });
  