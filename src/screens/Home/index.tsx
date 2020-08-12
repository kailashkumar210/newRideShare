import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import { Text, View, StyleSheet, Image, Platform, Alert, Linking, Dimensions, PermissionsAndroid, ActivityIndicator, Keyboard, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Location } from '../../models/types';
import analytics from '@react-native-firebase/analytics';
import Crashlytics from '@react-native-firebase/crashlytics';
import messaging from '@react-native-firebase/messaging';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import {updateFireBaseToken} from '../../redux/actions/user';
import {set_startDriving, set_stopDriving, get_UpcomingTrip, set_PendingTripList, get_TripSearchHistory} from '../../redux/actions/trip';
import {logout} from '../../redux/actions/user';
import {set_preferences} from '../../redux/actions/preferences';
import {api_trip_postDriverLocation, api_trip_getDriverLocation } from '../../api/tripApi';
import { api_google_lookupPlaceByLatLng} from '../../api/googleMapsApi';
import { activateKeepAwake, deactivateKeepAwake} from '@sayem314/react-native-keep-awake';
import { connect } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { store } from '../../redux/configureStore';
import { ACTIONS_USER, ACTIONS_NEWTRIP } from '../../redux/actions/types';
import Trip from '../../models/Trip';
import SubscriberTrip from '../../models/SubscriberTrip';
import RoundedButton from '../../components/RoundedButton';
import SearchedTrip from '../../models/SearchedTrip';
import { useBackHandler } from '@react-native-community/hooks'

const timer = require('react-native-timer');
const _ = require('lodash');

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
interface componentNameProps { }

const TIMER = 'homescreen_timer';
const TIME_OUT = 'homescreen_time_out';
const TIME_PENDINGUPCOMING='homescreen_pending_upcoming_trips';
let tripTimer: number;

const DEFAULT_REGION={
  latitude: 13.762925,
  longitude: 100.5091538,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
}

var today = new Date();
const todayTime = today.getSeconds();


const Home: React.FC = (props: any) => {
    let navigation = useNavigation();
    useBackHandler(() => navigation.isFocused());
    const { formatMessage } = useGlobalize();
    const [isDriver, setIsDriver] = useState(props.preferences.isDriver);
    const [topTwo, setTopTwo]= useState([]);
    const [currentLocationName, setCurrentLocationName]= useState(formatMessage('searchLocation/locating'));
    const [currentLocationAddress, setCurrentLocationAddress]= useState('');
    const [loading, setLoading] = useState(false);
    const [driverLocation, setDriverlocation]=useState<Location>();
    const [isDriverLocationAvailable, setisDriverLocationAvailable]=useState<boolean>(false);
    const [isFireBaseSetup, setIsFireBaseSetup]= useState(false);
    const [shouldBeAwake, setshouldBeAwake]= useState(false);
    const [region, setRegion]= useState<Location>(DEFAULT_REGION);
    const [connectivityValidation, setconnectivityValidation]= useState(false);
    const [pendingCount, setPendingCount]=useState(0);
    const [watchID, setwatchID] = useState<null|number> (null);
    const [messageListener, setmessageListener]= useState<any>(null);
    const [lastPosition, setLastPosition]= useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [intervalTime, setintervalTime] = useState(todayTime);

    useEffect(() => {
      const interval = setInterval(() => {
        setintervalTime(todayTime)
        // console.log('interval called inside useeffect',
        //     intervalTime,
        //     props.trips.UpcomingTrip.startTime, 
        //     (intervalTime>props.trips.UpcomingTrip.startTime),
        //     (props.trips.UpcomingTrip.startTime>intervalTime)
        // );
        if(props.trips?.UpcomingTrip?.startTime !== undefined && props.trips?.UpcomingTrip?.startTime > intervalTime){
          // console.log('become true')
          setAutoRefresh(true);
        }
      }, 5000);
      return () => {
        console.log('interval called clear useeffect')
        clearInterval(interval);
        setAutoRefresh(false);
      };
    }, []);

    useEffect(()=>{
      // First time we access the screen we check upcomingTrip and pendingTrips and later every minute we update them
      if (navigation.isFocused())
      {
        if (props.app.authorized) {
          console.log('Do I have to create a Car ', props.app.authorized && props.preferences.isDriver && props.vehicles.Vehicles.toString()==='')
          //console.log('Checking upcoming and pendingtrips --> ')
          _checkUpcomingTrip().then(()=> { _checkPendingTrip().then(() => {})});

          timer.setTimeout(
            TIME_PENDINGUPCOMING,
            () => {
              console.log('Executing the upcoming trip request...')
              _checkUpcomingTrip().then(()=>
              { 
                _checkPendingTrip().then(() => {
                    timer.clearTimeout(TIME_PENDINGUPCOMING);                  
                  },
                  error => setCurrentLocationName('Unable to locate. Is GPS on?')
                )
              })
            },
            60000
          );          
       }  
      }
    }, [props.app.authorized])

    useEffect(()=>{      
        if (props.preferences.isDriver !== isDriver)
        {
          setIsDriver(props.preferences.isDriver);
        }      
    }, [props.preferences.isDriver]);

    // useEffect(()=> {
    //   timer.setTimeout(
    //     TIME_PENDINGUPCOMING,
    //     () => {
    //       console.log('called with timer')
    //       setAutoRefresh(true);
    //     },
    //     10000
    //   ); 
    //   timer.clearInterval(TIMER);
    // },[timer]);

    React.useEffect(() => {
     if (!isFireBaseSetup)
      {
          _setupFirebase();
          setIsFireBaseSetup(true);        
      }       

      if (!connectivityValidation) {
        console.log("Home check connectivity Validation from Effect")

          setconnectivityValidation(true);
          //if (Platform.OS.toLowerCase() === 'android') {
              _checkLocationServicesIsEnabled();
          //}
          _setTopTwoSearch();
          
          if (props.app.authorized && props.auth.firebaseToken.length > 0){
               actions.updateFireBaseToken(props.auth.current.token, props.auth.firebaseToken).then((p)=> console.log(p)).catch((e)=> console.log(e));
          }
      }
    }, [navigation]);

    const _navigateToNotifications = () => {
      props.navigator.push({
        screen: 'TripDetailsScreen',
        title: 'Trip Details',
      });
    }
 
    useEffect(()=>{  
        console.log('Home UseEffect BackHandler, whats in messageListener ', messageListener);
        let currentScreen = props.route.name;
       
        if (messageListener === undefined || messageListener == null) {
            console.log('registering the Messaging listener')
            _getCurrentLocation();
            const _messageListener = messaging().onMessage(async (message) => {
              console.log('Receiving a message,', message)
            if (!message.opened_from_tray && message.type == 'trip_available') {
                    Alert.alert(
                    'Trip Available', message.fcm.body,
                    [
                      {
                        text: 'View',
                        onPress: () => {
                            console.log('PENDING: View Notifications TODO')
                            _navigateToNotifications()
                        }
                      },
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                      },                 
                    ],
                    { cancelable: true }
                  );
            }
        
            if (message.opened_from_tray) {
                if (message.type && message.type == 'update') {
                  // update
                  Alert.alert(
                    formatMessage('update_title'),
                    formatMessage('update_message'),
                    [
                      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                      {
                        text: 'OK',
                        onPress: () => {
                          _updateLink();
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                } else if (message.type == 'trip_available') {
                  console.log('PENDING: Navigate to Notifications');
                  _navigateToNotifications();
                }
              }
            });

        setmessageListener(_messageListener);

            return () => {
                // console.log('unregistering');
                // Anything in here is fired on component unmount.
                if (watchID !== null ){
                  Geolocation.clearWatch( watchID !== null ? watchID: 0);
                }
                if (timer.intervalExists(TIMER)) {
                    timer.clearInterval(TIMER);
                }
                _messageListener;                    
            }
        }
    }, []);

    function requestUserPermission() {
      console.log('Check messaging Registration')
      if (!messaging().hasPermission()){
        messaging().requestPermission().then((authStatus)=>{ 
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if (enabled) {
          // console.log('Authorization status:', authStatus);
          if (!messaging().isDeviceRegisteredForRemoteMessages) {
              messaging().registerDeviceForRemoteMessages().then(()=> console.log('registered'));
          }
          else{
              messaging().getToken().then((token)=> console.log("messaging token: "+token))
          }
          
        }
        }).catch((error)=> {
          console.log('!!!!!-> no messaging services permission');
        });
      }
      else{
        messaging().getToken().then((token)=> console.log("---> messaging token: "+token))
      }
    }

    const _setupFirebase = () => {
        //Crashlytics().log("Starting the app in :"+__DEV__);
        if (!Crashlytics().isCrashlyticsCollectionEnabled) {
          Crashlytics().setCrashlyticsCollectionEnabled(true);
          analytics().setAnalyticsCollectionEnabled(true);
        }
        // to force a crash to test the crashlytics
        //Crashlytics().crash();
        //console.log('Crashed to test');
        
        analytics().setCurrentScreen('Home', 'Home');
        // to ask permission for notifications and register device for remote Messages
        requestUserPermission();
        
        if (props.app.authorized) {
          analytics().setUserId(props.auth.current.email);
        }
       /* messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
          });
        */
       if (props.auth.firebaseToken===''){
          messaging()
            .getToken()
            .then(
                (firebaseToken: any) => {
                //console.log(firebaseToken);
                // PENDING: Here we should add the firebasetoken to the store!
                store.dispatch({type: ACTIONS_USER.SET_FIREBASETOKEN, payload: {firebaseToken: firebaseToken}})
              },
                (error: any) => {
                console.log(error);
              }
            );
       }
    };

    const _checkLocationServicesIsEnabled= async () => {
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: formatMessage('home/location'),
          ok: formatMessage('home/settings'),
          cancel: formatMessage('home/skip'),
          preventOutSideTouch: true,
          enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => ONLY GPS PROVIDER
          showDialog: true, // false => Opens the Location access page directly
          openLocationServices: true, // false => Directly catch method is called if location services are turned off
          preventBackClick: true,
        })
        .then((response: any)=> {
            console.log('is location services working: Yes');
            //console.log(response);
        })
        .catch((error: any)=> console.log(error));
      }

    const _changeKeepAwake = (shouldBeAwake: boolean) => {
        if (shouldBeAwake) {
            activateKeepAwake();
        } else {
            deactivateKeepAwake();
        }
        setshouldBeAwake(shouldBeAwake);
    };

    const  _getCurrentLocationName = async (latitude: number, longitude: number) => {
        setLoading(true);
        api_google_lookupPlaceByLatLng(latitude, longitude).then(
              resultJson => {
                let firstResult = resultJson.data.results[0];
                if (firstResult.types.includes('locality')) {
                  firstResult = resultJson.data.results[1];
                }    
                if (firstResult) {
                  let formattedAddress: string = firstResult.name ? firstResult.name : firstResult.formatted_address;
                  if (formattedAddress.length > 30) {
                    formattedAddress = formattedAddress.substr(0, 29) + '...';
                  }
                  // console.log('location found ' + formattedAddress);
                  setCurrentLocationName(formattedAddress);                  

                } else {
                  console.log('not usable')
                  // setCurrentLocationName('Unable to locate. Is GPS on?')
                }
                setLoading(false);
              },
              error => {
                  // console.log('Error reading current Location name ' +error);
                  setLoading(false);
                }
            );
    };

    const _getCurrentLocation = async ():Promise<object> => {
        Geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
    
            let _region = {
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            };
    
            //console.log(JSON.stringify(coords));
            setRegion(_region);    
            timer.setTimeout(
              TIME_OUT,
              () => {
                _getCurrentLocationName(latitude, longitude).then(
                  currentLocationName => {
                    timer.clearTimeout(TIME_OUT);                  
                  },
                  error => setCurrentLocationName('Unable to locate. Is GPS on?')
                );
              },
              1000
            );
          },
          error => {
            console.log('Error geting current location ')
            // console.log(error);
            if (Platform.OS === 'ios') {
              Geolocation.requestAuthorization("always");              
            }          
            if (Platform.OS === 'android') {
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, ).then((p)=> console.log('android permissions Accepted'));
            }
            setCurrentLocationName('Unable to locate. Is GPS on?');},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
        const _tempWatchId:number = Geolocation.watchPosition(position => {
          const _lastPosition: string = JSON.stringify(position);
          setLastPosition(_lastPosition);
        });
        setwatchID(_tempWatchId);
        return  {message:'got it'}          
    };

    const _updateDriverLocation = async () => {
        // Your code
        if (props.preferences.isDriver && region?.latitude) {
          //console.log('Home: posting Driver Location');
          //console.log(props.trips);
          //console.log('Home: saw anything');
          
            api_trip_postDriverLocation(props.auth.current.token, props.trips.UpcomingTrip.id, region.latitude, region.longitude)
            .then((r)=> {
              //console.log(r);
              //console.log('posted');
            })
            .catch((e)=> {
              console.log('error posting');
              console.log(e)});
        } else {
          try {
            // console.log('getting driver location');        
            let _driverLocation = await api_trip_getDriverLocation(props.auth.current.token, props.trips.UpcomingTrip.id);
            // console.log(driverLocation);
        
            if (_driverLocation.message === 'success' && _driverLocation.driverLocation) {
              setDriverlocation({...driverLocation, latitude: _driverLocation.driverLocation.latitude, longitude: _driverLocation.driverLocation.longitude});
              setisDriverLocationAvailable(true);
            } else {
              // could be that trip is over.
              timer.clearInterval(TIMER);
              _checkUpcomingTrip();
              setisDriverLocationAvailable(false);
            }
          } catch (error) {
            console.log('driver location not found');
          }
        }
    };
    
    const _checkUpcomingTrip = async () => {
      console.log("Upcoming trip props ",props.trips.UpcomingTrip);
        try {
          actions.get_UpcomingTrip(props.auth.current.token, props.preferences.isDriver).then((HasUpcomingtrip)=>{
            console.log('HasUpcomingtrip:',HasUpcomingtrip)
            
            // console.log(HasUpcomingtrip);

            let time = constants.Utils._humanReadableTime(props.trips.UpcomingTrip.startTime);
            tripTimer = setInterval(()=>{
              // console.log("Timere ", time);
              let currentTime = constants.Utils._humanReadableTime(new Date);
              // console.log("Current Time  ", currentTime);
              if(currentTime > time)
              {
                // console.log("If part")
                _intervalOver();
              }
            }, 5000);


            if (HasUpcomingtrip.message ==='success' && props.trips.UpcomingTrip && props.trips.UpcomingTrip.hasOwnProperty('ongoing') && props.trips.UpcomingTrip.ongoing) {
              _startPolling();
            } 
            else {
              // Remove the interval to query for the driver position
              if (timer.intervalExists(TIMER)) {
                timer.clearInterval(TIMER);
              }
              tripTimer(tripTimer);
            }
          });
        } catch (error) {
          console.log(error);
        }
    };

    const _startPolling = () => {

        if (timer.intervalExists(TIMER)) {
          return;
        }
        // console.log('Starting to poll');
        timer.setInterval(TIMER, _updateDriverLocation, 5000);
    }
    
    const _checkPendingTrip = async () => {
        try {
            console.log("Check Pending trips ");
            actions.set_PendingTripList(props.auth.current.token, props.preferences.isDriver).then(()=>{
                setPendingCount(props.trips.PendingTrips.length);
                //Updating the upcomingTrips
            });          
        } catch (error) {
          console.log(error)
        }
    }

    const _stopDriving = () => {
        actions.set_stopDriving(props.auth.current.token, props.trips.UpcomingTrip.id)
          .then(success => {
            timer.clearInterval(TIMER);
            _changeKeepAwake(false);
            analytics().logEvent('stop_driving');
            clearInterval(tripTimer);
          })
          .catch(error => {});
    };
    
    const _intervalOver = () => {
      timer.clearInterval(TIMER);
      _changeKeepAwake(false);
      clearInterval(tripTimer);
    }

     const _startDriving = () => {
        actions.set_startDriving(props.auth.current.token, props.trips.UpcomingTrip.id)
          .then(success => {
            _changeKeepAwake(true);
            _startPolling();
            analytics().logEvent('start_driving');
          })
          .catch(error => {
            // fail
          });
    };

    const _setTopTwoSearch=() =>{
        if (props.app.authorized && !props.preferences.isDriver) {
           actions.get_TripSearchHistory(props.auth.current.token).then(success => {
            setTopTwo(props.trips.SearchedTrips.reverse().filter((_i: any, index: number) => index < 2));
          });
        }
    }

    const _onSearchBarPressed = () => {
        Keyboard.dismiss();
        navigation.navigate('SearchLocation',{
            currentLocation: {
              title: currentLocationName,
              latitude: region.latitude,
              longitude: region.longitude            
          },
          NavigatingFrom:'Home'
        });
    };

    const _renderHomeScreenUserNotLoggedIn = () => {
      return (
        <View style={styles.containerNotLoggedInUser}>
          <Image style={styles.logo} source={constants.Images.LOGO} />
          <Image style={styles.promo} source={constants.Images.PROMO} />
          <Text style={styles.copyright}>{formatMessage('copyright_text')}</Text>
          <RoundedButton
            containerViewStyle={{
              marginTop: 30,
              width: '90%',
              borderColor: constants.Colors.green,
              backgroundColor: constants.Colors.green,
            }}
            textColor={constants.Colors.whiteColor}
            title={'Log in'}
            onPress={() => 
              navigation.navigate('Login',{
                NavigatingFrom: 'Home',
              })
            }
          />
  
          <RoundedButton
            containerViewStyle={{
              marginBottom: 10,
              marginTop: 20,
              width: '90%',
              borderColor: constants.Colors.green,
              backgroundColor: constants.Colors.whiteColor,
            }}
            textColor={constants.Colors.green}
            title={'Register'}
            onPress={() => {
              navigation.navigate('SelectCommunity',{
              NavigatingFrom:'Home'
            })}
          }
          />
  
          <View style={styles.sdgLogoContainer}>
            <Image style={styles.sdgLogo} source={constants.Images.LOGO_SDG} />
            <Image style={styles.sdg13Logo} source={constants.Images.LOGO_SDG13} />
          </View>
  
          <Text style={styles.sdg13Slogan}>{formatMessage('sdg_slogan_text')}</Text>
        </View>
      );
    }

    const _navigateToTripDetails = (item: Trip) => {
      // console.log('navigate to TripDetails ');
      // console.log(item);
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
        };
      }  
      navigation.navigate(
        'TripDetails', {
        subscribed2Trip : item,    
        bottomButtonText: 'Deactivate',      
        passProps }
      );
    };
  
    const _navigateToSubscriberTripDetails = (subscriberTrip: SubscriberTrip) => {
      // console.log('navigate to SubscriberTrip ');
      // console.log(subscriberTrip);

      let item = subscriberTrip.trip;
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
        date: '',
        vehicle: item.vehicle,
        tripDetails: item,
      };
  
      if (item.weekly) {
        passProps.days = constants.Utils._DaysFromCron(subscriberTrip.days, subscriberTrip.passengerCount);
      } else {
        passProps.date = constants.Utils._humanReadableDate(item.startTime);
      }
  
      navigation.navigate(
        'TripDetails',{
          subscribed2Trip : item,          
          passProps,
          bottomButtonText:'Deactivate' }        
      );
    };

    const _navigateToNewTrip = (item: SearchedTrip) => {
      
      let passProps = {
       // startLocationObject: startLocationObject,
       // destinationLocationObject: destinationLocationObject,
        weekly: item.weekly,
        days: item.days,
        datetime: item.datetime,
        passengerCount: item.capacity,
      };  
      store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP, payload:{}});
        store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_STARTLOCATION, payload:{startLocation: {
            title: item.startAddressTitle,
            latitude: item.startLatitude,
            longitude: item.startLongitude,
          } }});
        store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_DESTINATIONLOCATION, payload:{destinationLocation: {
            title: item.destAddressTitle,
            latitude: item.destLatitude,
            longitude: item.destLongitude,
          } }});
        navigation.navigate('NewRide');
    };

    const _renderTopTwoSearchHistory = (topTwo: Array<SearchedTrip>) => {
      if (!props.preferences.isDriver && topTwo.length > 0) {        
        return (
          <View style={styles.searchHistory}>
            {topTwo.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    _navigateToNewTrip(item);
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    width: '100%',
                    padding: 5,
                    borderTopWidth: index == 1 ? 1 : 0,
                    borderTopColor: constants.Colors.lightGrayColor,
                  }}
                >
                  <Icon name="av-timer" color={constants.Colors.strokeGrayColor} />
                  <View style={{ marginLeft: 5, marginTop: 5, }}>
                    <Text style={{ color: constants.Colors.blackColor, fontSize: 14 }}>{item.destAddressTitle}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 12, paddingRight: 30 }}>
                      {item.destAddress}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      } else {
        return <View />;
      }
    }

    const  _updateLink = () => {
        if (Platform.OS === 'ios') {
          Linking.openURL('https://dev-cleanair.azurewebsites.net/ios');
        } else {
          Linking.openURL('https://play.google.com/store/apps/details?id=org.un.oict.rideshare');
        }
    };


  const CreateVehicleIfNewDriver = () =>{ 
    return (
      <View style={styles.shroud}>
        <RoundedButton
          containerViewStyle={{ backgroundColor: constants.Colors.whiteColor, margin: 5, width: '90%' }}
          raised
          icon={{ name: 'car-sports', type: 'material-community' }}
          backgroundColor={constants.Colors.primaryDarkColor}
          title={'Add a Vehicle'}
          onPress={() => {
            navigation.navigate(
              'AddVehicle',{
              NavigatingFrom:'Home'}
            );
          } } />
        <RoundedButton
          containerViewStyle={{ backgroundColor: constants.Colors.whiteColor, margin: 5, width: '90%' }}
          raised
          title={'Switch to Passenger Mode'}
          icon={{
            name: 'users',
            type: 'font-awesome',
          }}
          backgroundColor={constants.Colors.green400Color}
          onPress={() => {
            actions.set_preferences({ ...props.preferences, isDriver: false });
          } } />

        <RoundedButton
          containerViewStyle={{ backgroundColor: constants.Colors.whiteColor, margin: 5, width: '90%' }}
          title={'Log out'}
          backgroundColor={constants.Colors.primaryColor}
          onPress={() => {
            actions.logout().then(() => 
            navigation.reset(
              { index:0,
              routes:[{name:'LoginOptions'}],
              }))
          }} />
      </View>
  )}

  const showBottomModal = () => {
    console.log('showBottomModal called without timer')
        if (props.trips.HasUpcomingtrip) {
          if (props.preferences.isDriver) {
            _navigateToTripDetails(props.trips.UpcomingTrip);
          } else {
            _navigateToSubscriberTripDetails(props.trips.UpcomingSubscriberTrip);
          }
        }
  }

    return (
        <View style={styles.container}>

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude: region ? region.latitude : DEFAULT_REGION.latitude,
                    longitude: region ? region.longitude : DEFAULT_REGION.longitude,
                    latitudeDelta: region && region.latitudeDelta !== undefined ? region.latitudeDelta : DEFAULT_REGION.latitudeDelta,
                    longitudeDelta: region && region.longitudeDelta !== undefined? region?.longitudeDelta : DEFAULT_REGION.longitudeDelta,
                }}               
                showsUserLocation={true}
                customMapStyle={constants.Maps.MAP_STYLE_ULTRA_BLUE}            
                showsCompass={false}
                onRegionChangeComplete={(_region: Region)=> 
                  {
                    console.log('moved the map');
                    setRegion({...region, latitude: _region.latitude, longitude: _region.longitude, latitudeDelta: _region.latitudeDelta, longitudeDelta: _region.longitudeDelta})
                }}
            >
               
                {!props.preferences.isDriver &&
                  props.trips.hasOwnProperty('UpcomingTrip') &&          
                  props.trips.UpcomingTrip &&                                   
                  props.trips.UpcomingTrip.toString() !== '' &&
                  props.trips.UpcomingTrip.hasOwnProperty('ongoing') &&                  
                  props.trips.UpcomingTrip.ongoing &&                  
                  isDriverLocationAvailable && 
                  driverLocation ? (
                    <Marker title={driverLocation && driverLocation.title ? driverLocation.title :''} 
                    coordinate={{ 
                      latitude: driverLocation ? driverLocation.latitude :0,
                      longitude: driverLocation ?  driverLocation.longitude:0 }}
                    >
                      <Icon color={constants.Colors.red900Color} name="car" type="material-community" />
                    </Marker>
                ): null}

              {
                props.app.authorized &&
                props.trips.HasUpcomingtrip &&
                props.trips.UpcomingTrip &&
                props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
                props.trips.UpcomingTrip.routePoints.length > 0 &&
                props.trips.UpcomingTrip.ongoing &&
                !props.preferences.isDriver ? (
                <Marker title={props.trips.UpcomingSubscriberTrip.startLocation.title} coordinate={{ ...props.trips.UpcomingSubscriberTrip.startLocation }}>
                  <Icon color={constants.Colors.primaryColor} name="location-searching" />
                </Marker>
              ): null}

              {props.app.authorized &&
               props.trips.HasUpcomingtrip &&
               props.trips.UpcomingTrip &&
               props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
               props.trips.UpcomingTrip.routePoints.length > 0 &&
               props.trips.UpcomingTrip.ongoing &&
               !props.preferences.isDriver ? (
                <Marker
                  title={props.trips.UpcomingSubscriberTrip.destinationLocation.title}
                  coordinate={{ ...props.trips.UpcomingSubscriberTrip.destinationLocation }}
                >
                  <Icon color={constants.Colors.pink400Color} name="location-on" />
                </Marker>
              ): null }

            {
              (props.app.authorized &&
              props.trips.HasUpcomingtrip &&
              props.trips.UpcomingTrip &&
              props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
              props.trips.UpcomingTrip.routePoints.length > 0 &&
              props.trips.UpcomingTrip.ongoing &&
              props.preferences.isDriver) ?
              props.trips.UpcomingTrip.routePoints.map((item: Location) => {
                if (item && item.latitude && item.longitude && item.latitude> 0){
                  <Marker title={item.title} key={item.position+''} coordinate={{ ...item }}>
                    <Icon color={constants.Colors.primaryDarkColor} name="location-on" />
                  </Marker>                               
                }
              }
             ): null
            }

            </MapView>

            <View style={{ height: '100%', width: '100%' }}>
                {/* Top buttons view start */}
                <View style={styles.topBtnView}>
                    <View onStartShouldSetResponder={() => navigation.openDrawer()} style={styles.BtnView}>
                        <Image
                            source={constants.Images.SIDE_MENU}
                            style={styles.iconStyle}
                        />
                    </View>
                    <View onStartShouldSetResponder={() => navigation.navigate(formatMessage('screen/NotificationScreen'))} style={styles.BtnView}>
                      {props.trips.PendingTrips.length > 0 ? 
                        <View style={{position: 'absolute', left: 40, top: 5}}>
                          <Icon name="circle" color={constants.Colors.pink400Color} type='font-awesome' size={15} />
                        </View> : null
                      }
                        <Image
                            source={constants.Images.NOTIFICATION_ICON}
                            style={styles.iconStyle}
                        />
                    </View>
                </View>
                {/* Top buttons view end */}

                {/* Top Ride view */}
                <View style={styles.cardViewTop}>
                    <Text numberOfLines={2} style={styles.rideTxt} onPress={() =>  _onSearchBarPressed()}>
                        {(isDriver) ?
                            formatMessage('placeholder/create_route')
                            :
                            formatMessage('placeholder/search_for_ride')
                        }
                    </Text>
                    <Icon
                        containerStyle={{ flex: 0.1 }}                        
                        underlayColor={constants.Colors.underlayColor}
                        size={20} color={constants.Colors.primaryColor}
                        name={(isDriver) ? formatMessage('home/timeline') : formatMessage('home/search')}
                    />
                </View>
                
                {props.app.authorized && props.trips?.SearchedTrips !== undefined &&  props.trips?.SearchedTrips.length >= 2 ? 
                  _renderTopTwoSearchHistory(props.trips.SearchedTrips.reverse().slice(0,2))//.filter((index: number)=> index < 2)) 
                : null}
                {props.app.authorized && props.preferences.isDriver == 1 && props.vehicles.Vehicles.toString()==='' ? CreateVehicleIfNewDriver() : null}
                {!props.app.authorized ? _renderHomeScreenUserNotLoggedIn() : null}
                
                {/*Top Ride view */}                
                {autoRefresh ? (
                  <>
                  {props.app.authorized &&
                  props.trips.HasUpcomingtrip &&
                  props.trips.UpcomingTrip &&
                  props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
                  props.trips.UpcomingTrip.routePoints.length > 0 &&
                  !props.trips.UpcomingTrip.ongoing &&
                  props.preferences.isDriver ? (
                    <View style={styles.cardViewStartDriving} >
                    <TouchableOpacity
                      onPress={() => {
                        _startDriving();
                      }}
                      style={styles.buttonsStartDriving}
                    >
                      <Text style={{ color: constants.Colors.lightFontColor, fontSize: 16 }}>{formatMessage('home/startDriving')}</Text>
                    </TouchableOpacity>
                    </View>
                  ): null}

                  {
                    props.app.authorized &&
                    props.trips.HasUpcomingtrip &&
                    props.trips.UpcomingTrip &&
                    props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
                    props.trips.UpcomingTrip.routePoints.length > 0 &&
                    props.trips.UpcomingTrip.ongoing &&
                    props.preferences.isDriver && (
                      <View style={styles.cardViewStartDriving} >
                    <TouchableOpacity
                        onPress={() => {
                          _stopDriving();
                        }}
                        style={styles.buttonsStopDriving}                        
                      >
                        <Text style={{ color: constants.Colors.lightFontColor, fontSize: 16 }}>{formatMessage('home/stopDriving')}</Text>
                      </TouchableOpacity>
                      </View>
                  )}

                  {     props.app.authorized &&
                        props.trips.HasUpcomingtrip &&
                        (
                          (props.preferences.isDriver &&
                            props.trips.UpcomingTrip &&
                            props.trips.UpcomingTrip.hasOwnProperty('routePoints') &&                  
                            props.trips.UpcomingTrip.routePoints.length > 0) ||
                          (!props.preferences.isDriver &&
                            props.trips.UpcomingSubscriberTrip &&
                            props.trips.UpcomingSubscriberTrip.hasOwnProperty('routePoints') &&                  
                            props.trips.UpcomingSubscriberTrip.routePoints.length > 0)) ? 
                            (
                      <View style={styles.cardViewUpcomingTrip}>
                      <TouchableOpacity
                        style={styles.buttonsUpcomingTrip}
                        onPress={e => {
                         showBottomModal()
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start',alignItems:'center', flex: 1 }}>
                          <Icon name="directions-car" color={constants.Colors.lightFontColor} />
                          <Text style={{ color: constants.Colors.lightFontColor, textAlignVertical: 'center', marginLeft: 10, marginTop: 10, marginBottom: 10 }}>
                            {props.trips.UpcomingTrip.ongoing ? formatMessage('home/ongoing_trip') : formatMessage('home/upcoming_trip')}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end', alignItems:'center' }}>
                          <Text style={{ color: constants.Colors.lightFontColor, textAlignVertical: 'center', marginTop: 10, marginBottom: 10 }}>
                            {props.trips.UpcomingTrip.ongoing && props.trips.UpcomingTrip.routePoints[props.trips.UpcomingTrip.routePoints.length - 1].title 
                              ? props.trips.UpcomingTrip.routePoints[props.trips.UpcomingTrip.routePoints.length - 1].title.substr(0, 20)
                              : 'Next Step'}
                          </Text>
                          <Icon name="keyboard-arrow-right" color={ constants.Colors.lightFontColor } />
                        </View>
                      </TouchableOpacity>
                      </View>
                      ): null
                  }
                  </>            
                ): null}

                {/* Bottom location view */}
                {props.app.authorized ? (
                  <View style={styles.cardView} onStartShouldSetResponder={()=> _getCurrentLocation().then(()=> console.log('requested'))} >
                      <Icon containerStyle={{ flex: 0.1 }} underlayColor={constants.Colors.underlayColor} size={20} color={constants.Colors.primaryColor} name="my-location" />
                      <Text numberOfLines={2} style={styles.locationTxt}>{currentLocationName}</Text>
                      <Icon containerStyle={{ flex: 0.1 }} underlayColor={constants.Colors.underlayColor} size={20} color={constants.Colors.primaryColor} name="refresh" />                  
                  </View>
                ): null}
                {/*End Bottom location view */}
            </View>

            { loading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={constants.Colors.backgroundColor} /> 
              </View>          
            )}
            
        </View >
    );
};


function mapStateToProps(state: any) {

    return {
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences,   
        vehicles: state.vehicles,
        trips: state.trips,     
    };
}

//same as dispatchmapto props in eS6
const actions = { updateFireBaseToken, get_UpcomingTrip, set_startDriving, set_stopDriving, set_PendingTripList, get_TripSearchHistory, set_preferences, logout};

export default connect(mapStateToProps, actions)(Home);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    },
    topBtnView: {
        padding: 15,
        zIndex: 100,
        position: 'absolute',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    BtnView: {
        height: 50,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        backgroundColor: 'white',
        elevation: 5,
    },
    iconStyle: {
        height: 20,
        width: 20,
        tintColor: constants.Colors.green
    },
    cardView: {
        width: SCREEN_WIDTH -20,
        height: 50,
        padding: 15,
        bottom: 15,
        right: 15,
        left: 15,
        flexDirection: 'row',
        backgroundColor: 'white',
        position: 'absolute',
        justifyContent: 'space-between',
        borderRadius: 5,
        elevation: 2
    },
    cardViewUpcomingTrip: {
      flex: 1,
      height: 50,
      padding: Platform.OS !=='ios'? 15: 0,
      bottom: 90,
      right: 15,
      left: 15,
      flexDirection: 'row',
      backgroundColor: 'white',
      position: 'absolute',
      justifyContent: 'space-between',
      borderRadius: 5,
      elevation: 2
  },
    cardViewStartDriving: {
      flex: 1,
      height: 50,
      padding: Platform.OS !=='ios'? 15: 0,
      bottom: 150,
      right: 15,
      left: 15,
      flexDirection: 'row',
      backgroundColor: 'white',
      position: 'absolute',
      justifyContent: 'space-between',
      borderRadius: 5,
      elevation: 2
  },
  buttonsStartDriving:{
    shadowOffset: { width: 2, height: 2 },
    shadowColor: constants.Colors.iosShadowColor,
    shadowOpacity: 1,
    elevation: 2,
    borderRadius: 5,
    margin: Platform.OS !== 'ios' ? -15 : 0,
    justifyContent: 'center',
    flexDirection: 'row',
    width: SCREEN_WIDTH - 20,
    backgroundColor: constants.Colors.pink400Color,
    padding: 0,
    height: 50, 
    alignItems: 'center'
  },
  buttonsStopDriving:{
    shadowOffset: { width: 2, height: 2 },
    shadowColor: constants.Colors.iosShadowColor,
    shadowOpacity: 1,
    elevation: 2,
    borderRadius: 0,
    margin: Platform.OS !== 'ios' ? -15 : 0,
    justifyContent: 'center',
    flexDirection: 'row',
    width: SCREEN_WIDTH - 20,
    backgroundColor: constants.Colors.primaryColorLight,
    padding: 0,
    height: 50,
    alignItems: 'center', 
  },
  buttonsUpcomingTrip:{
    borderRadius: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH-20,
    height: 50,
    backgroundColor: constants.Colors.positiveButtonColor,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: constants.Colors.iosShadowColor,
    shadowOpacity: 1,
    marginLeft: Platform.OS !== 'ios' ? -15 : 0,
    marginTop: Platform.OS !== 'ios' ? -15 : 0,
  },
    locationBar: {
      shadowOffset: { width: 2, height: 2 },
      shadowColor: constants.Colors.iosShadowColor,
      shadowOpacity: 1,
      borderRadius: 5,
      backgroundColor: constants.Colors.backgroundTranslucentColor,
      height: 55,
      paddingLeft: 10,
      margin: 10,
      elevation: 2,
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    locationTxt: {
        fontSize: 14,
        textAlign: 'center',
        paddingLeft: 10,
        flex: 1,
        width: '80%',
    },
    cardViewTop: {
        padding: 15,
        top: 80,
        right: 15,
        left: 15,
        flexDirection: 'row',
        backgroundColor: 'white',
        position: 'absolute',
        borderRadius: 5,
        elevation: 1
    },
    rideTxt: {
        fontSize: 14,
        textAlign: 'left',
        flex: 1,
        width: '80%',
        // backgroundColor: 'red'
    },
    previousList: {
        flex: 1,
        // padding: 10,
        top: 133,
        right: 15,
        left: 15,
        elevation: 1,
        position: 'absolute',
        borderRadius: 5,
        backgroundColor: constants.Colors.whiteColor,
    },
    recentSearchView: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
    },
    shroud: {
      position: 'absolute',
      backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    searchIcon: {},
    searchHistory: {
      flex:1,
      padding: 5,
      shadowOffset: { width: 2, height: 2 },
      shadowColor: constants.Colors.iosShadowColor,
      shadowOpacity: 1,
      borderRadius: 5,
      elevation: 2,
      width: '93%',
      position: 'absolute',
      flexDirection: 'column',
      alignItems: 'flex-start',
      top: 134,
      left: 15,
      backgroundColor: constants.Colors.backgroundTranslucentColor,
    },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    elevation: 3,
    backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
    alignItems: 'center',
    justifyContent: 'center',
  },  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  promo: {
    marginTop: 30,
    marginBottom: 30,
    width: 220,
    height: 67,
    alignSelf: 'center',
  },
  copyright: {
    textAlign: 'center',
    color: constants.Colors.green,
    fontStyle: 'italic',
  },
  sdgLogoContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sdgLogo: {
    marginTop: 10,
    marginRight: 15,
    width: 210,
    height: 22,
    alignSelf: 'center',
  },
  sdg13Logo: {
    marginTop: 10,
    width: 60,
    height: 60,
    alignSelf: 'center',
  },
  sdg13Slogan: {
    textAlign: 'center',
    color: constants.Colors.green,
    fontStyle: 'italic',
  },
  containerNotLoggedInUser: {
    position: 'absolute',
    backgroundColor: constants.Colors.whiteColor,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'column',
  }, 
});
