import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, Dimensions, Platform, Image, Keyboard, BackHandler } from 'react-native';
import constants from '../../constants';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Header from '../../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';
import {connect,} from 'react-redux';
import { Location } from '../../models/types';
import {Days} from '../../models/types';
import RoundedButton from '../../components/RoundedButton';
import {api_google_search, api_google_lookupPlaceById, api_google_lookupPlaceByLatLng } from '../../api/googleMapsApi';
import { ListItem } from 'react-native-elements';
const _ = require('lodash');

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const LocationPicker: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {

    let navigation = useNavigation();
    const {formatMessage} = useGlobalize();
    const [loading, setLoading] = useState(false);
    const [region, setRegion]= useState({
        latitude: props.route?.params?.latitude ? props.route?.params?.latitude : 0,
        longitude: props.route?.params?.longitude ? props.route?.params?.longitude : 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    const [location, setLocation]= useState({
        placeId: undefined,
        title: '',
        latitude: props.route?.params?.latitude ? props.route?.params?.latitude : 0,
        longitude: props.route?.params?.longitude ? props.route?.params?.longitude : 0,
        formattedAddress: '',
      });
    const [locationResults, setlocationResults] = useState<Array<Location>>([]);
    const [keyboardVisible, setkeyboardVisible]= useState(false);
    const [destinationLocationInputText, setdestinationLocationInputText]= useState('');
    //const [nearByLocationResults, setnearByLocationResults] =useState([]);
    //const [showAddressLoading, setshowAddressLoading]= useState(false);
    
    // useFocusEffect(()=>{
    //     console.log('1 parameter latitude ',props.route?.params?.latitude)
    // }
    // )
    
    useFocusEffect(
      React.useCallback(()=>{
        console.log('parameter latitude ',props.route?.params?.latitude)
      if (location.latitude == 0 && props.route?.params?.latitude)
        {
           setLocation({
            placeId: undefined,
            title: '',
            latitude: props.route?.params?.latitude ? props.route?.params?.latitude : 0,
            longitude: props.route?.params?.longitude ? props.route?.params?.longitude : 0,
            formattedAddress: '',
          });
          setRegion({
            latitude: props.route?.params?.latitude ? props.route?.params?.latitude : 0,
            longitude: props.route?.params?.longitude ? props.route?.params?.longitude : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          })
        }        
    },[location])
  );

    const onRegionChange = (newValue: { latitude: any; longitude: any; }) => {
        //console.log('region change');
        //console.log(newValue);
        let _location = {
          latitude: newValue.latitude,
          longitude: newValue.longitude,
          placeId: undefined,
        };
        setRegion({...region, latitude: newValue.latitude, longitude: newValue.longitude});
        _selectDestination(_location, false);
    };

    const _selectDestination = (place: Location, sendResult: boolean) => {
        sendResult == false && setLoading(true);
        if (place.placeId != undefined) {
            api_google_lookupPlaceById(place.placeId)
            .then(result => {
              let place = result.data.result;
              console.log('got location ')
              //console.log(place)
              setLocation({...location, 
                            title: place.name, 
                            latitude: place.geometry.location.lat,
                            longitude: place.geometry.location.lng,
                            placeId: place.placeId
                        })
              
              if (sendResult) _sendLocationResult();
            })
            .catch(error => {
              setLoading(false);
              console.log(error.message);
            });
        } else {
            api_google_lookupPlaceByLatLng(place.latitude, place.longitude)
            .then(response => {
              const results = response.data.results;
              const place = results[0];
              console.log('got location 2', place)
              //console.log(place)
              setLocation({...location, 
                title: place.formatted_address, 
                latitude: place && place.hasOwnProperty('geometry')?  place.geometry.location.lat: location.latitude,
                longitude: place && place.hasOwnProperty('geometry')?  place.geometry.location.lng : location.longitude,
                placeId: place.placeId
            })
              
              if (sendResult) _sendLocationResult();
            })
            .catch(error => {
              setLoading(false);
              console.log(error.message);
            });
        }
      };

    const _sendLocationResult =()=> {
        Keyboard.dismiss();
        setkeyboardVisible(false);  
        //console.log('returning Location:')
        //console.log(location);   
        setdestinationLocationInputText('');
        navigation.navigate(
          props.route.params.Origin ? props.route.params.Origin : 'SearchLocation', {
          isDestination: props.route.params.isDestination,
          selectedLocation : location,
        });
        navigation.setParams({selectedLocation: null, isDestination: null, Origin: null});
    }
    
    const _updateResults = (text: string) => {
        setdestinationLocationInputText(text);    
        if (text.length == 0) {
          setlocationResults([]);
        }
    
        if (text.length < 3) {
          return;
        }
    
        _search(text);
      };

     const _search = (text: string) => {
        //Will only search by text as both last values are equal
        api_google_search(text, region, 'search', 'search')
          .then(response => {
            console.log('api search returns with ');
            console.log(response.data);
            let results = response.data.predictions;
    
            let manipulatedResults = results.map((item: { structured_formatting: { main_text: any; }; place_id: any; }) => ({
              title: item.structured_formatting.main_text,
              icon: 'location-on',
              placeId: item.place_id,
            }));
            setlocationResults(manipulatedResults);
          })
          .catch(error => console.log(error.message));
      };

      const _renderAddressAutoComplete = () => {
        return (
          <View style={{ width: SCREEN_WIDTH }}>
            {locationResults.length > 0 && (
              <View style={styles.listContainer}>
                {locationResults.map((item, i) => (
                  <ListItem
                    key={i}
                    containerStyle={styles.listItem}
                    title={item.title}
                    titleStyle={{ textAlign: 'center' }}
                    leftIcon={{ name: item.icon }}
                    onPress={() => {
                      _selectDestination(item, true);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        );
      }
    


return (
        <View style={styles.container}>
        <Header
                headerText={formatMessage('screen/LocationPickerScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
        />
        <MapView
          //ref={mapView => (this.mMapView = mapView)}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={constants.Maps.MAP_STYLE_ULTRA_BLUE}
          showsMyLocationButton={true}
          showsUserLocation={true}
          rotateEnabled={false}
          showsCompass={false}
          pitchEnabled={false}
          initialRegion={region}
          onRegionChangeComplete={
            _.debounce(
              (region: { latitude: any; longitude: any; }) => {
              onRegionChange(region);
            },
            1000,
            {
              leading: true,
              trailing: false,
            }
          )}
        />
        <View style={styles.search}>
          <TextInput
            underlineColorAndroid="transparent"
            onChangeText={(text) => _updateResults(text)}
            //ref={searchbar => (this.mDestinationInput = searchbar)}
            style={[
              styles.input,
              {
                marginLeft: 10,
                marginRight: 10,
                marginTop: 10,
                borderRadius: 5,
                backgroundColor: constants.Colors.backgroundTranslucentColor,
                height: 40,
              },
            ]}
            editable={true}
            multiline={true}
            numberOfLines={2}
            placeholder={formatMessage('searchLocation/search_location')}
            maxLength={40}
          />
          {_renderAddressAutoComplete()}
        </View>
        
        
        {locationResults.length == 0 && (
          <View pointerEvents="none" style={styles.markerFixed}>
            <Image style={styles.marker} source={constants.Images.MARKER} />
          </View>
        )}



        {!keyboardVisible && (
          <View style={styles.bottomView}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.input}>
              {location.title ? location.title : 'Loading ...'}
            </Text>
            <RoundedButton
              buttonRegular
              containerViewStyle={{
                width: '100%',
                height: 50,
                borderColor: constants.Colors.primaryColor,
                backgroundColor: constants.Colors.primaryColor,
                elevation: 1,
                alignItems: 'center',
              }}
              textStyle={{ fontSize: 18 }}
              textColor={constants.Colors.whiteColor}
              title={formatMessage('searchLocation/select_this_location')}
              onPress={() => {
                _selectDestination(location, true);
              }}
            />
          </View>
        )}
      </View>
   
    );
}

export default LocationPicker
const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    input: {
      shadowOffset: { width: 2, height: 2 },
      //shadowColor: constants.Colors.amberA400Color,
      shadowOpacity: 1,
      borderRadius: 5,
      fontWeight: '300',
      color: 'black',
      textAlign: 'left',
      height: 40,
      flex: 1,
      padding: 10,
      //backgroundColor: constants.Colors.backgroundTranslucentColor,
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100%',
    },
    markerFixed: {
      left: '50%',
      position: 'absolute',
      top: '50%',
      marginLeft: -15,
      marginTop: -47,
    },
    marker: {
      height: 47,
      width: 30,
    },
    search: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    list: {},
    listItem: {
      backgroundColor: constants.Colors.whiteColor,
    },
    listContainer: {
      width: SCREEN_WIDTH,
      backgroundColor: constants.Colors.listBackgroundColor,
      flex: 1,
    },
    nearByAddressListContainer: {
      width: SCREEN_WIDTH,
      backgroundColor: constants.Colors.whiteColor,
      borderTopWidth: 0,
      borderBottomWidth: 0,
    },
    nearByAddressListItem: {
      backgroundColor: constants.Colors.whiteColor,
    },
    searchbox: {
      marginLeft: 5,
      marginRight: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    bottomView: {
      position: 'absolute',
      bottom: 0,
      width: SCREEN_WIDTH,
      backgroundColor: constants.Colors.whiteColor,
    },
    locationTitle: {
      fontSize: 18,
    },
    formattedAddress: {
      fontSize: 14,
    },
  });