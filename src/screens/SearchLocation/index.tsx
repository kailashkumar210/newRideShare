import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Keyboard } from 'react-native';
import constants from '../../constants';
import Header from '../../components/Header';
import { SearchBar, Icon, ListItem, Button } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';
import {connect,} from 'react-redux';
import { Location } from '../../models/types';
import {add_locationToHistory} from '../../redux/actions/preferences';
import { api_google_search, api_google_lookupPlaceById} from '../../api/googleMapsApi';
import analytics from '@react-native-firebase/analytics';
import { ACTIONS_NEWTRIP } from '../../redux/actions/types';
import { store } from '../../redux/configureStore';
var _ = require('lodash');

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const SearchScreen: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    
    let navigation = useNavigation();
    const {formatMessage} = useGlobalize();
    const [loading, setLoading] = useState(false);
    const [locationResults, setlocationResults] = useState <Array<Location>>(props.preferences.LocationHistory);
    const [pickupLocationInputText, setpickupLocationInputText]= useState('');
    const [destinationLocationInputText, setdestinationLocationInputText] = useState('');
    const [locationResultsForDestination, setlocationResultsForDestination] = useState(false);
    const [currentLocation, setcurrentLocation] = useState({latitude: 0,
      longitude: 0,
      title: '',
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });
    const [currentLocationName, setcurrentLocationName] = useState(props.route?.params?.currentLocation && props.route?.params?.currentLocation.title != formatMessage('searchLocation/locating') ? formatMessage('searchLocation/current_location'): formatMessage('searchLocation/pick_start'));
    const [destinationLocation, setdestinationLocation] = useState<Location | undefined>( {latitude: 0,
      longitude: 0,
      title:'',
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });
      
    // This screen comes from the Home page params should always contains currentLocation 
    // and when clicking in the location icon then it goes to LocationPicker and returns here with params selectedLocation
    // So currentLocation to init origin
    // Destination and SelectedLocation to populate the newTrip.Start and Destination..
    useEffect(() => {
        if (props.route?.params?.selectedLocation && props.route.params.isDestination !== undefined)
        {
          console.log('selected Location')
          if (!props.route.params.isDestination && props.route.params.selectedLocation  && props.route.params.selectedLocation.hasOwnProperty('title') && props.route.params.selectedLocation.title !== currentLocationName)
          {
            console.log('updating currentLocation ',props.route.params.selectedLocation)
            setcurrentLocation({...currentLocation, 
                              title:props.route.params.selectedLocation.title,
                              latitude: props.route.params.selectedLocation.latitude,
                              longitude: props.route.params.selectedLocation.longitude
            });
            setpickupLocationInputText(props.route.params.selectedLocation.title);
            navigation.setParams({selectedLocation:{}});
          }
          else if (props.route.params.isDestination && props.route.params.selectedLocation&& props.route.params.selectedLocation.hasOwnProperty('title') && props.route.params.selectedLocation.title !== destinationLocationInputText)
          {
            console.log('updating Destination', props.route.params.selectedLocation)
            setdestinationLocation({...destinationLocation, 
                              title: props.route.params.selectedLocation.title,
                              latitude: props.route.params.selectedLocation.latitude,
                              longitude: props.route.params.selectedLocation.longitude
            });
            setdestinationLocationInputText(props.route.params.selectedLocation.title);
            navigation.setParams({selectedLocation:{}});
          }
        }

          if (props.preferences && props.preferences.LocationHistory && (locationResults.toString()==='' || locationResults.length != props.preferences.LocationHistory)){
            console.log("SetLocation UseFocus Effect", props.preferences.LocationHistory.reverse());
            setlocationResults(props.preferences.LocationHistory.reverse());
          }
        
        //  console.log('focus Effect CurrentLocation', props.route.params.currentLocation, currentLocation.latitude);     
        //  console.log('focus Effect Destination', props.route.params.destinationLocationObject, destinationLocation?.latitude);     
      },[props.route?.params?.selectedLocation]);
    
    useEffect(()=>{
      if (currentLocation?.latitude == 0 && props.route?.params?.currentLocation && props.route?.params?.currentLocation.latitude > 0)
          {
            console.log('updating current position')
            setcurrentLocation(props.route.params.currentLocation)
          }      
          if (destinationLocation?.latitude == 0 && props.route?.params?.destinationLocationObject && props.route?.params?.destinationLocationObject.latitude > 0 )
          {
            console.log('updating destination position')
            setdestinationLocation(props.route.params.destinationLocationObject)
          } 
    }, [props.route?.params?.currentLocation,props.route?.params?.destinationLocationObject ])


    const _updateResults=(text:string, isDestination:boolean)=>{
            if (isDestination) 
            {
              setdestinationLocationInputText(text);
            }
            else 
            {
              setpickupLocationInputText(text);
            }    
            if (text.length == 0) 
            {
              console.log("set Loaction update result ");
              setlocationResults([]);
            }
        
            if (text.length < 3) {
              return;
            }    
            // _.debounce(
            //   (text:string) => {
            //       console.log('_updateResults 1', text)
                  _search(text);
            //   },1000,{
            //     leading: true,
            //     trailing: false,
            //   }
            // )
    }

   const _search = (text: string) => {        
        // We call the API from here to simplify 
        //console.log('pre actions to google')       
        api_google_search(text, {latitude: currentLocation.latitude+'', longitude: currentLocation.longitude+''}, currentLocationName, formatMessage('searchLocation/pick_start'))
          .then(response => {
            //console.log('this we got from google');
            let resultsJson:any = response.data;
            //console.log(resultsJson);
            let results =resultsJson.predictions;
    
            let manipulatedResults = results.map((item: { structured_formatting: { main_text: any; }; place_id: any; }) => ({
              title: item.structured_formatting.main_text,
              icon: 'location-on',
              placeId: item.place_id,
            }));
            console.log("SetLocation _search",manipulatedResults);
            setlocationResults(manipulatedResults);
          })
          .catch(error => {
            console.log('Error handling from Google API results');
            console.log(error.message)
          }
        );          
    };

    const onLocationPicked = (location: Location, isDestination: boolean) => {
        let pickedlocation: Location = {
          latitude: location.latitude,
          longitude: location.longitude,
          title: location.title,
        };
    
        navigation.setParams({selectedLocation:{}})
        
        if (isDestination) {
          setdestinationLocation(pickedlocation);
          setdestinationLocationInputText(pickedlocation.title !== undefined ? pickedlocation.title : '');
        } else {
          setcurrentLocation(pickedlocation); 
          setpickupLocationInputText(pickedlocation.title !== undefined ? pickedlocation.title : '');
        }
    
        if (currentLocation && destinationLocation) {
          console.log('Implement navigate to new trip screen, but you have the button yet.')
          //this._navigateToNewTripScreen(this.state.destinationLocation);
        }
      };

    const _onLocationItemClicked = (place: Location) => {
        Keyboard.dismiss();
        let locationObject;
    
        setLoading(true);
          
        if (place.placeId != undefined) {
          api_google_lookupPlaceById(place.placeId)
            .then(result => {
              let place = result.data.result;
              locationObject = {
                title: place.name,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              };
    
              setLoading(false);
              onLocationPicked(locationObject, locationResultsForDestination);
            })
            .catch((error: { message: any; }) => console.log(error.message));
        } else {
          locationObject = {
            title: place.title,
            latitude: place.latitude,
            longitude: place.longitude,
          };
          onLocationPicked(locationObject, locationResultsForDestination);
          setLoading(false);
        }
      };

     const _navigateToNewTripScreen = (destinationLocation: Location) => {
      console.log('navigate to newtripscreen '+ props.preferences.isDriver); 
      console.log(currentLocation)
      console.log(destinationLocation)
      if (currentLocation && destinationLocation && currentLocation.latitude != destinationLocation.latitude && currentLocation.longitude != destinationLocation.longitude) {
            actions.add_locationToHistory(destinationLocation).then((m)=> 
            {
              //console.log('SearchLocation - added, pending firebase register');
              analytics().logEvent('location_search', destinationLocation);
            });

          // We update the NewTrip Global State for the secreens to behave properly
          store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP, payload:{}});
          store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_STARTLOCATION, payload:{startLocation: currentLocation }});
          store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_DESTINATIONLOCATION, payload:{destinationLocation: destinationLocation }});

          console.log('SearchLocation - pending redirect to NEW_TRIP_DRIVER_SCREEN or NEW_TRIP_SCREEN');
          navigation.navigate(props.preferences.isDriver ? 'NewTripDriverScreen' :'NewRide', {
            startLocationObject: {
              title: currentLocation.title,
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            },
            destinationLocationObject: destinationLocation
          })          
        } 
        else {
          Toast.showWithGravity(formatMessage('select_start_end_location'),
            Toast.LONG,
            Toast.CENTER,
          );
        }
    };
    
    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/SearchScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => {
                  store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP})
                  navigation.reset({
                      index: 1,
                      routes: [
                        { name: 'Home' },
                      ],
                    })
                  
                }}
            />
        <View style={styles.searchbox}>
            <Icon size={18} style={styles.icon} color={constants.Colors.primaryColor} name="location-searching" />
            <SearchBar //underlineColorAndroid="transparent"
              onChangeText={
                _.debounce(
                  (text) => {
                    console.log("Text ", text);
                    _updateResults(text)
                  },
                1000,
                {
                  leading: true,
                  trailing: false,
                }
              )
                // _updateResults(text, false);
              }
              //autoFocus
              onFocus={() => {
                setlocationResultsForDestination(false );
              }}
              searchIcon={false}
              autoCorrect={false}
              lightTheme={true}
              // style={{padding: 1}}
              inputContainerStyle={{backgroundColor:constants.Colors.lightGrayColor}}
              containerStyle={{ width:SCREEN_WIDTH - 85 ,backgroundColor:constants.Colors.whiteColor, borderBottomColor: 'transparent',borderTopColor: 'transparent'}}
              inputStyle={styles.input}
              editable={true}
              value={pickupLocationInputText}
              placeholder={pickupLocationInputText ===''?currentLocationName: pickupLocationInputText}
              maxLength={40}
            />
          <Icon
            onPress={() => {
              //constants.Global.openLocationPickerModal(this.props.navigator, this.onLocationPicked, false);
              //console.log('Navigate to LocationPicker Screen once designed');
              navigation.navigate('LocationPicker', {
                Origin: 'SearchLocation',
                isDestination: false,
                latitude:  currentLocation.latitude , 
                longitude: currentLocation.longitude});
            }}
            raised
            size={18}
            color={constants.Colors.primaryColor}
            name="pin-drop"
          />
          
        </View>
        <View style={styles.searchbox} >
          <Icon size={18} style={styles.icon} color={constants.Colors.pink400Color} name="flag-variant" 
          type="material-community" />

          <SearchBar
            underlineColorAndroid="transparent"
            onChangeText={
              _.debounce(
                (text) => {
                  console.log("destination Text ", text);
                  _updateResults(text,true)
                },
              1000,
              {
                leading: true,
                trailing: false,
              }
            )
              // _updateResults(text, true);
            }
            //ref={searchbar => (this.mDestinationInput = searchbar)}
            autoFocus
            searchIcon={false}
            autoCorrect={false}
            // inputContainerStyle={{backgroundColor:constants.Colors.backgroundTranslucentColor}}
            lightTheme={true}
            inputContainerStyle={{backgroundColor:constants.Colors.lightGrayColor}}
            containerStyle={{ width:SCREEN_WIDTH - 85 ,backgroundColor:constants.Colors.whiteColor, borderBottomColor: 'transparent',borderTopColor: 'transparent'}}
            inputStyle={styles.input}
            editable={true}
            value={destinationLocationInputText}
            placeholder={formatMessage('placeholder/choose_destination')}
            maxLength={40}
            onFocus={() => {
              setlocationResultsForDestination(true );
            }}
          />

          <Icon
            onPress={() => {       
              //console.log(destinationLocation)
              console.log('passing parameter latitude: ', destinationLocation)       
              navigation.navigate('LocationPicker', { 
                isDestination: true,
                latitude: destinationLocation && destinationLocation.latitude > 0? destinationLocation.latitude : currentLocation.latitude, 
                longitude: destinationLocation && destinationLocation.longitude > 0? destinationLocation.longitude: currentLocation.longitude
              });
            }}
            raised
            style ={styles.icon}
            size={18}
            name="pin-drop"
            color={constants.Colors.primaryColor}
          />
        </View>

        <View style={styles.listContainer}>
          { locationResults.slice(0, 5).map((item, i) => (
            <ListItem
              key={i}
              style={{alignContent: 'center'}}
              title={item.title}
              titleStyle={{ textAlign: 'center' }}
              leftIcon={{ name: 'av-timer' }}
              rightIcon={{ name: 'chevron-right'}}
              bottomDivider={true}
              topDivider={true}
              onPress={() => {
                _onLocationItemClicked(item);
                //console.log('implement LocationItemClicked')
              }}
            />
          ))}
        </View>
        <Button
          disabled={destinationLocation === undefined || destinationLocation.latitude == 0}
          raised
          buttonStyle={{ width: SCREEN_WIDTH }}
          style={{backgroundColor:constants.Colors.positiveButtonColor}} 
          title={formatMessage('searchLocation/button_continue')}
          onPress={() => {
            //this._navigateToNewTripScreen(this.state.destinationLocation);
            destinationLocation ? _navigateToNewTripScreen(destinationLocation):null;
          }}
        />
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
          </View>
        )}
       </View>
    );
}

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences, 
        newTrip: state.newTrip    
    };
}

//same as dispatchmapto props in eS6
const actions = {add_locationToHistory};

export default connect(mapStateToProps, actions)(SearchScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.Colors.backgroundColor,
      },      
    map: {
        flex:1,
        // height: 120,
        marginTop: 5
    },
    TopView: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: constants.Colors.lightGrayColor
    },
    searchbox: {
        width: SCREEN_WIDTH -10,
        paddingTop:0,
        marginTop: 5,        
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: constants.Colors.backgroundColor,
    },
    activeDayText: { fontSize: 18, color: constants.Colors.positiveButtonColor },
    deactiveDayText: { fontSize: 18, color: constants.Colors.strokeGrayColor },  
    icon: {
        alignItems: 'center',
        // flex: 0.2,
        paddingHorizontal:5
    },
    input: {
        fontWeight: '300',
        color: 'black',
        fontSize: 16,
        // textAlign: 'left',
        // alignSelf: 'center',
        // paddingLeft: 20,
        height: 40,
        flex: 1,
        // margin: 1,
        // borderRadius: 5,
        // borderWidth:1,
        // width:'100%'
    },
    sectionHeaderText: {
        color: constants.Colors.primaryColor,
        fontSize: 12,
        textAlign: 'left',
        fontWeight: '700',
        // width: '90%',
        // marginLeft: 10,
        // marginTop: 10,
        // marginBottom: 10,
        margin: 10
    },
    listItem: {
        //textAlign: 'center',
    },
    listContainer: {
        width: '100%',
    },
    ThirdView: {
        flex: 1,
        flexDirection: 'row',
        borderTopColor: constants.Colors.lightGrayColor,
        borderTopWidth: 1,
        paddingBottom: 10,
        paddingTop: 10
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      elevation: 3,
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
});