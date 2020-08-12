import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TextInput } from 'react-native';
import Constants from '../../constants';
import Header from '../../components/Header';
import { Icon, Divider, Button } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import {getCenter} from 'geolib';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';
import { Location } from '../../models/types';
import SortableList from 'react-native-sortable-list';
import Row from './Row';
import { connect } from 'react-redux';
import { store } from '../../redux/configureStore';
import { ACTIONS_NEWTRIP } from '../../redux/actions/types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const NewTripDriverScreen: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    let mMapView: MapView;
    let navigation = useNavigation();
    const {formatMessage} = useGlobalize();
    const tabs = ['Single', 'Weekly'];
    const [loading, setLoading] = useState(false);
    const [isInputVisible, setisInputVisible] = useState(false);
    const [selectedPickUpLocation, setSelectedPickUpLocation]=useState<Location>();
    const [locationDetail, setLocationDetail]= useState<string>('');
    const [routePoints, setRoutePoints]= useState<Array<Location>>([]);
    const [region, setRegion]=useState<{
        latitude:number, 
        longitude:number,
        latitudeDelta: number,
        longitudeDelta: number }>({
            latitude: props.newTrip.startLocation ? props.newTrip.startLocation.latitude: 0,
            longitude: props.newTrip.startLocation ? props.newTrip.startLocation.longitude: 0,
            latitudeDelta: 0.122,
            longitudeDelta: 0.1421 
    });
    const [pickedregion, setpickedRegion]=useState<{
        latitude:number, 
        longitude:number,
        latitudeDelta: number,
        longitudeDelta: number }>({
            latitude: props.newTrip.startLocation ?props.newTrip.startLocation.latitude: 0,
            longitude: props.newTrip.startLocation ?props.newTrip.startLocation.longitude: 0,
            latitudeDelta: 0.122,
            longitudeDelta: 0.1421 
    });
    const [finalOrder, setFinalOrder] = useState<number[]>([]);
    const [routeObjects, setRouteObjects]= useState([{}]);

    const [currentLocation, setcurrentLocation] = useState<Location | undefined>(props.newTrip.startLocation);
    const [destinationLocation, setdestinationLocation] = useState<Location | undefined>( props.newTrip.destinationLocation);
    
    useFocusEffect(()=>{
      console.log("Route Points ", props.route.params);
      if(!props.newTrip.startLocation || !props.newTrip.destinationLocation || props.newTrip.completed) {
        store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP});
        navigation.navigate('Home'); 
      }
      
      // update destination from new trip
      if (destinationLocation && !destinationLocation.hasOwnProperty('latitude') &&  props.newTrip.destinationLocation.hasOwnProperty('latitude') && destinationLocation.latitude != props.newTrip.destinationLocation.latitude)
      {
        console.log('updated setdestination')
        setdestinationLocation( props.newTrip.destinationLocation);
      }     
      if (currentLocation && props.newTrip && props.newTrip.startLocation && props.newTrip.startLocation.latitude !== currentLocation.latitude )
      {
        setcurrentLocation(props.newTrip.startLocation);
         _updateRegionFromParams();
      }

      if (routePoints.length != props.newTrip.routePoints.length && (props.route.params.selectedLocation === undefined || props.route.params.selectedlocation != null))
      {
        console.log('routepoints from useFocusEffect')
        setRoutePoints(props.newTrip.routePoints);
        setRouteObjects(props.newTrip.routePoints);
      }



      if (props.route.params && props.route.params.selectedLocation && props.route.params.selectedLocation.toString() !== '')
      {
        //
        console.log('returning from location picker, selected Location:')
        console.log(props.route.params.selectedLocation);
        let _tempLocation: Location = props.route.params.selectedLocation;
        onLocationPicked(_tempLocation);
        navigation.setParams({isDestination: null, selectedLocation: null});
      }       
    });
   
    useEffect(()=>{
        console.log('updating region from Effect');
        updateRouteObjects(routePoints);
        _updateRegionFromParams();
    }, [])

    const _updateRegionFromParams=() => {      
      console.log('Updating Region From params');
      if (currentLocation && destinationLocation ){      
        const _centerRegion: {longitude:number, latitude:number} | false = getCenter([{latitude: currentLocation?.latitude, longitude: currentLocation.longitude}, {latitude: destinationLocation?.latitude, longitude: destinationLocation?.longitude}])
        if (_centerRegion && _centerRegion.latitude){
            setRegion({...region, latitude: _centerRegion.latitude, longitude: _centerRegion.longitude});
        }        
      }
    }

    // Method called when coming back from the selector
    const onLocationPicked = (place: Location) => {
        let pickedlocation: Location = {
          latitude: place.latitude,
          longitude: place.longitude,
          title: place.title,
        };
    
        let currentRoutePoints = routePoints;
        const _found:number =currentRoutePoints.findIndex((rp)=> rp.latitude == pickedlocation.latitude && rp.longitude == pickedlocation.longitude)
        // console.log('do I have the point already?')
        // console.log(_found)
        // Only push it if not found already
        if (_found == -1) {
          currentRoutePoints.push(pickedlocation);
          setRoutePoints(currentRoutePoints);
          setisInputVisible(false);
          setpickedRegion({
              latitude: pickedlocation.latitude,
              longitude: pickedlocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          console.log('routepoints updated, now update routeobjects')
          console.log(routePoints)
          console.log(routeObjects)
          updateRouteObjects(routePoints);
          
        }
    };

    const _removeLocation = (location: Location) => {
        console.log('removing location');
        let array = [...routePoints];
        array.splice(array.indexOf(location), 1);
        let pp = array;
        setRoutePoints([...pp ]);
        updateRouteObjects([...pp ]);
        // Update the state
        store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_ROUTEPOINTS, payload: {routePoints: [...pp]}})
      };
    
    const _updateLocationDetail = () => {
        if (selectedPickUpLocation){
            let currentIndex = routePoints.indexOf(selectedPickUpLocation);
            setSelectedPickUpLocation({...selectedPickUpLocation, address: locationDetail});
            let _routePoints = [...routePoints];
            _routePoints[currentIndex] = selectedPickUpLocation;
            // Update the state
            store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_ROUTEPOINTS, payload: {routePoints: [..._routePoints]}})
            
            setRoutePoints([..._routePoints]);
            updateRouteObjects([..._routePoints]);
            setisInputVisible(false);
        }
      };

    function updateRouteObjects(routePoints: Location[]) {
        let routeArray = routePoints;
        if (routePoints && routePoints.length > 0) {
            console.log('--> New value for route Objects')
            setRouteObjects([...routePoints]);
            console.log('--> UPDATED value for route Objects')
            console.log(routePoints);
            console.log(routeObjects);
        }
        else{
          console.log('Emptying the routeObjects')
          setRouteObjects([{}]);
        }
    }


    const _renderRow = ({ data, active }) => {
        return (<Row 
          data={data} 
          active={active} 
          _onDelete={_removeLocation} 
          />);
    };

    const _onRegionChange = (_region: React.SetStateAction<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; }>) => {
        //console.log('region change')
        //setpickedRegion(_region);
    };

    const _reorderPoints = () => {
      let reorderedLocations: Array<Location> = [];
        if (finalOrder && finalOrder.length > 0) {
          for (let i = 0; i < finalOrder.length; i++) {
            let location: Location = routePoints[finalOrder[i]];
            reorderedLocations.push(location);
          }
          setRoutePoints([...reorderedLocations]);
        } else {
          reorderedLocations = routePoints;
        }
    
        //console.log('PENDING Send the communication to the New Trip Driver Confirm Screen')
        /*console.log('RoutePoints and finalOrder')
        console.log(routePoints);
        console.log(finalOrder);
        console.log(reorderedLocations);
        console.log(props.route.params.destiny);
        */
        console.log(props.newTrip)
        if (reorderedLocations)
        {  
          store.dispatch({type: ACTIONS_NEWTRIP.UPDATE_ROUTEPOINTS, payload: {routePoints: reorderedLocations}})
        }
    }

    const _navigateToConfirmRouteScreen = () => {        
        _reorderPoints();        
        navigation.navigate('NewTripDriverConfirmScreen');        
    };

    const _pickLocation = () => {
        console.log('open the LocationPicker ')
        navigation.navigate('LocationPicker', {
            latitude: props.route.params.startLocationObject.latitude,
            longitude: props.route.params.startLocationObject.longitude,
            isDestination: false,
            Origin: 'NewTripDriverScreen',
            NavigatingFrom:'NewDriverTrip'
        })
    }

    return (
    <View style={styles.container}>
        <View
          style={{
            justifyContent: 'center',
            width: SCREEN_WIDTH,            
          }}
        >
          <Header
                headerText={formatMessage('screen/NewTripDriverScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.navigate('SearchLocation')}
            />
      </View>
      <View
          style={{
            justifyContent: 'center',
            width: SCREEN_WIDTH,
            height: 180,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.searchbox}>
              <Icon  style={{margin:10}} size={15} color={Constants.Colors.primaryColor} name="my-location" />
              <Text style={styles.input} numberOfLines={1} ellipsizeMode={'tail'}>{props.newTrip.startLocation.title}</Text>
            </View>

            {              
                routeObjects !== undefined && routeObjects[0] !== undefined && routeObjects[0].hasOwnProperty('latitude')  && (
                <View style={{ flexDirection: 'column', width: '95%', marginTop: 2, marginBottom: 2 }}>
                  <SortableList
                    style={styles.list}
                    contentContainerStyle={styles.contentContainer}
                    data={routeObjects}
                    renderRow={_renderRow}                  
                    onChangeOrder={(e: React.SetStateAction<number[]>) => {
                      console.log('onChangeOrder');
                      setFinalOrder(e);
                      console.log(finalOrder);
                    }}
                  />                
                </View>
              )             
            }

            <View style={styles.searchbox}>
              <Icon style={{margin:10}} size={15} color={Constants.Colors.pink400Color} name="location-on" />
              <Text style={styles.input} numberOfLines={1} ellipsizeMode={'tail'}>{props.newTrip.destinationLocation.title}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: SCREEN_WIDTH,
            flex: 3,
            flexBasis: 300,
          }}
        >
          <Button
            icon={{ name: 'plus', type: 'material-community', color: Constants.Colors.primaryColor }}
            buttonStyle={{ margin: 0, height: 50 }}
            style={{ marginLeft: 0, marginRight: 0, height: 50, backgroundColor:Constants.Colors.backgroundColor }}
            // textStyle={{ color: Constants.Colors.primaryColor }}
            title="Add Pick/Drop Points"
            onPress={_pickLocation}
          />
          {isInputVisible && (
            <View style={{ flexDirection: 'row', margin: 10 }}>
              <TextInput
                autoFocus
                onChangeText={text => ( setLocationDetail(text)) }
                style={{flex:1}}
                placeholder="Pickup point details.."
                onSubmitEditing={_updateLocationDetail}
                onEndEditing={() => setisInputVisible(false)}
              >
                {selectedPickUpLocation ? selectedPickUpLocation.address : 'Not defined'}
              </TextInput>
              <Icon raised size={13} color={Constants.Colors.green400Color} name="save" onPress={_updateLocationDetail} />
              <Icon
                raised
                size={13}
                color={Constants.Colors.pink400Color}
                name="cancel"
                onPress={() => {
                  setisInputVisible(false);
                }}
              />
            </View>
          )}

          <Divider style={{ backgroundColor: Constants.Colors.strokeGrayColor, marginTop: 3 }} />

          <MapView
            //ref={mapView => (mMapView = mapView)}
            style={{
              width: SCREEN_WIDTH,
              flex: 1,
              top: 0,
              bottom: 0,
            }}
            provider={PROVIDER_GOOGLE}
            customMapStyle={Constants.Maps.MAP_STYLE_ULTRA_BLUE}
            showsUserLocation={true}
            showsCompass={true}
            initialRegion={region}
            //region={pickedregion}
            showsMyLocationButton={true}
            onRegionChange={(_region)=>_onRegionChange(_region)}
          >
            {props.newTrip.startLocation &&
            (
            //  <Marker coordinate={{ ...props.route.params.startLocationObject }}>
            <Marker coordinate={{ ...props.newTrip.startLocation }}>
              <Icon color={Constants.Colors.primaryColor} name="my-location" />
            </Marker>)}
            
            {props.newTrip.destinationLocation &&
            (<Marker coordinate={{ ...props.newTrip.destinationLocation }}>
              <Icon color={Constants.Colors.pink400Color} name="location-on" />
            </Marker>
            )}

            {routePoints.map((item: Location) => (
              <Marker title={item.title} key={item.title} coordinate={{ ...item }}>
                <Icon color={Constants.Colors.primaryDarkColor} name="location-on" />
              </Marker>
            ))}

            {props.newTrip.destinationLocation ? 
                  <Polyline
                    coordinates={[props.newTrip.startLocation,...routePoints, props.newTrip.destinationLocation]}
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
                />               
            : null }

          </MapView>

          <Button
            //disabled={this.state.routePoints.length == 0}
            buttonStyle={{ width: '100%', height: 50 }}
            style={{ marginLeft: 0, marginRight: 0, backgroundColor:Constants.Colors.positiveButtonColor}}
            raised
            title="Confirm Ride"
            onPress={()=>_navigateToConfirmRouteScreen()}
          />
        </View>
      </View>)
}

function mapStateToProps(state: any) {
  return {
      newTrip: state.newTrip    
  };
}

//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, actions)(NewTripDriverScreen);


const styles = StyleSheet.create({
    daysCheckBoxText: { color: Constants.Colors.primaryDarkColor, textAlign: 'right', width: 40, marginRight: 5, fontWeight: 'bold' },
    daysView: {
      marginBottom: 3,
      paddingTop: 8,
      elevation: 2,
      height: 60,
      alignItems: 'center',
      paddingLeft: 10,
      width: SCREEN_WIDTH - 10,
      backgroundColor: Constants.Colors.backgroundColor,
      flexDirection: 'row',
    },
    dateText: { fontSize: 25, color: 'white' },
    passengerCountView: {
      marginBottom: 3,
      elevation: 2,
      height: 40,
      width: SCREEN_WIDTH - 10,
      backgroundColor: Constants.Colors.backgroundColor,
      flexDirection: 'row',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: Constants.Colors.backgroundColor,
    },
    input: {
      fontWeight: '300',
      color: 'black',
      width: '90%',
      textAlign: 'center',
      textAlignVertical: 'center',
      height: 35,
      // flex: 1,
      paddingLeft: 10,
      margin: 1,
      borderRadius: 5,
      backgroundColor: Constants.Colors.inputBackgroundColor,
      // flexShrink:1
    },
  
    search: {
      fontSize: 15,
      textAlign: 'left',
    },
  
    routeEntryText: {
      fontWeight: '300',
      color: Constants.Colors.positiveButtonColor,
      width: '80%',
      textAlign: 'center',
      textAlignVertical: 'center',
      height: 35,
      flex: 1,
      margin: 1,
      borderRadius: 5,
      backgroundColor: Constants.Colors.inputBackgroundColor,
    },
  
    searchContainer: {
      flex: 1,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderRadius: 5,
      margin: 0,
      padding: 0,
    },
    searchbox: {
      marginLeft: 10,
      marginRight: 15,
      flexDirection: 'row',
      alignItems: 'center',
    },
    routeEntryContainerView: {
      marginLeft: 5,
      marginRight: 5,
      marginTop: 1,
      marginBottom: 1,
      height: 35,
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    icon: {
      alignItems: 'center',
    },
    list: {
      maxHeight: 100,
    },
    listItem: {
      textAlign: 'center',
    },
    listContainer: {
      width: SCREEN_WIDTH,
    },
    dateCard: {
      elevation: 2,
      height: 60,
      marginBottom: 3,
      width: SCREEN_WIDTH - 10,
      backgroundColor: Constants.Colors.primaryDarkColor,
      flexDirection: 'row',
    },
    timeCard: {
      elevation: 2,
      height: 60,
      marginBottom: 3,
      width: SCREEN_WIDTH - 10,
      backgroundColor: Constants.Colors.primaryColor,
      flexDirection: 'row',
    },
    contentContainer: {
      width: SCREEN_WIDTH,  
      ...Platform.select({
        ios: {
          paddingHorizontal: 30,
        },  
        android: {
          paddingHorizontal: 0,
        },
      }),
    },
  });


