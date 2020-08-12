import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import constants from '../../constants';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import Header from '../../components/Header';
import ModalSelector from 'react-native-modal-selector';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Icon, ButtonGroup, Button, CheckBox } from "react-native-elements";
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useGlobalize, FormattedMessage } from 'react-native-globalize';
import {connect,} from 'react-redux';
import { Location, LocationList } from '../../models/types';
import {Days} from '../../models/types';
import {getCenter} from 'geolib';
import { add_Trip2List } from '../../redux/actions/trip'
import Trip from '../../models/Trip';
import Vehicle from '../../models/Vehicle';
import Toast from 'react-native-simple-toast';
import { store } from '../../redux/configureStore';
import { ACTIONS_NEWTRIP } from '../../redux/actions/types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');


interface NewRideProps {
    startLocationObject: Location,
    destinationLocationObject: Location,
 }


let days = { sun: 0, mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 0 };
const passengerCountModalData = [{ key: 1, label: '1' }, { key: 2, label: '2' }, { key: 3, label: '3' }];

const _formattedDate = (date: Date): string => {
    return moment(date).format(constants.DateTime.dateFormat);
  };
const _formattedTime = (date: Date) => {
    return moment(date).format(constants.DateTime.timeFormat);
 };  
  

const NewTripDriverConfirmScreen: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    
    let navigation = useNavigation()
    let _startLocationObject:Location = props.newTrip?.startLocation ? props.newTrip.startLocation : {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    };

    let _destinationLocationObject: Location = props.newTrip?.destinationLocation ? props.newTrip.destinationLocation : {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    };
    
    const [selectedTab, setSelectedTab] = useState(0)
    const [notifyTripAvailable, setNotifyTripAvailable] = useState(false)
    const [passengerCount, setPassengerCount] = useState('1')
    const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
    const [isDaysModalVisible, setisDaysModalVisible] = useState(false);
    const [isTimePickerVisible, setisTimePickerVisible] = useState(false);
    const [time, setTime] = useState(_formattedTime(moment(new Date())
                                                    .add(30, 'm')
                                                    .toDate()));
    const [timeSelector, setTimeSelector] = useState(moment(new Date())
                                                    .add(30, 'm')
                                                    .toDate());
    const _newDate = new Date();
    const [date, setDate] = useState(_formattedDate(_newDate));
    const [dateSelector, setDateSelector] = useState<Date>(new Date());
    const [days, setdays] = useState({ sun: 0, mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 0 });
    const [daysCrons, setdaysCrons] = useState({ sun: 0, mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 0 });
    const [region, setRegion]=useState<{
        latitude:number, 
        longitude:number,
        latitudeDelta: number,
        longitudeDelta: number }>({
            latitude: props.newTrip?.startLocation ? props.newTrip.startLocation.latitude: 0,
            longitude: props.newTrip?.destinationLocation ? props.newTrip.destinationLocation.longitude: 0,
            latitudeDelta: 0.122,
            longitudeDelta: 0.1421 
    });
    const {formatMessage} = useGlobalize();
    const [loading, setLoading] = useState(false);
    // Tab labels
    const tabs = [formatMessage('newride/single'), formatMessage('newride/weekly')];
    const [note, setNote]= useState('');
    const [routePoints, setRoutePoints]= useState<Array<Location>>(props.newTrip.routePoints);
    const [startLocationObject, setStartLocationObject]= useState<Location>(_startLocationObject)
    const [destinationLocationObject, setDestinationLocationObject]= useState<Location>(_destinationLocationObject)
    const [defaultVehicle, setDefaultVehicle] = useState<Vehicle>(props.vehicles !== undefined ? props.vehicles.Vehicles[0] : new Vehicle())
    const [fullRoute, setFullRoute]= useState<Array<Location>>([])

    useEffect( () => { 
        //console.log('Pending Review Translations missing for errors, etc')
        let _defVIndex= props.vehicles.Vehicles.findIndex((v: { id: any; })=>v.id == props.vehicles.defaultVehicleId);
        if (_defVIndex > -1)
        { 
            setPassengerCount(props.vehicles.Vehicles[_defVIndex].capacity);
            setDefaultVehicle(props.vehicles.Vehicles[_defVIndex]);
        }
        else if (props.vehicles?.Vehicles.length > 0)
        {   setPassengerCount(props.vehicles.Vehicles[0].capacity);
        }
    }, [props.newTrip])
    
    useEffect(() => {
         // to update map once
         _updateRegionFromParams();               
    }, [props.newTrip])

    useFocusEffect(() => {
        // To control the back button and the store here
        if (props.newTrip.completed)
        {
            console.log('--> CLEANING')
            store.dispatch({type: ACTIONS_NEWTRIP.SET_COMPLETED, payload: {completed: true}});
            navigation.navigate('Home');               
        }
        else if(!props.newTrip.startLocation || props.newTrip.startLocation==0 || !props.newTrip.destinationLocation) {
            console.log('--> CLEANING2')
            store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP});
            navigation.navigate('Home'); 
        } 
        
        if (props.newTrip.routePoints && props.newTrip.routePoints.toString()!=='' && (props.newTrip.routePoints.length != routePoints.length || ( props.newTrip.routePoints.length == routePoints.length && props.newTrip.routePoints[0].latitude != routePoints[0].latitude)))
        {
            console.log('newTrip has different routepoints')
            setRoutePoints(props.newTrip.routePoints);
            setFullRoute([startLocationObject, ...props.newTrip.routePoints, destinationLocationObject]);
        }    
        if (props.newTrip.startLocation && props.newTrip.startLocation.latitude != 0 && startLocationObject.latitude == 0)
        {
            console.log('newTrip has different startLocation')
            setStartLocationObject(props.newTrip.startLocation)
        }
        if (props.newTrip.destinationLocationObject && props.newTrip.destinationLocationObject.latitude != 0 && destinationLocationObject.latitude == 0)
        {
            console.log('newTrip has different destination')
            setDestinationLocationObject(props.newTrip.destinationLocationObject);
            setFullRoute([startLocationObject, ...props.newTrip.routePoints, destinationLocationObject]);
        }
    });

    // method that calculates the center Region between Origin and Destination
    const _updateRegionFromParams = () => {
        
        if (props.newTrip && 
            (props.newTrip?.startLocation && props.newTrip?.startLocation.toString()!=='' && props.newTrip?.startLocation?.latitude !== startLocationObject.latitude && props.newTrip?.startLocation?.longitude !== startLocationObject.longitude) ||
            (props.newTrip?.destinationLocation && props.newTrip?.destinationLocation.toString()!==''&& props.newTrip?.destinationLocation?.latitude !== destinationLocationObject.latitude && props.newTrip?.destinationLocation?.longitude !== destinationLocationObject.longitude) ||
            (props.newTrip?.routePoints && props.newTrip?.routePoints !== routePoints.length)
        ){
          console.log('updating centerRegion and routepoints')
          console.log(props.newTrip);
          
          setDestinationLocationObject(props.newTrip.destinationLocation);
          setStartLocationObject(props.newTrip.startLocation);
          const _centerRegion: {longitude:number, latitude:number} | false = getCenter([props.newTrip.startLocation, props.newTrip.destinationLocation])
          if (_centerRegion && _centerRegion.latitude){
              console.log('centering region ', _centerRegion)
              setRegion({...region, latitude: _centerRegion.latitude, longitude: _centerRegion.longitude});
          }
          if (props.newTrip?.routePoints.toString()!=='' && props.newTrip?.routePoints.length > 0)
          {
            console.log('updating routePoints ')
            setRoutePoints(props.newTrip.routePoints);
          }
          console.log('set full route')
          setFullRoute([startLocationObject, ...props.newTrip.routePoints, destinationLocationObject]);
          // Clean params to avoid multiple repetitions                   
        }        
    }

    // Functions
    const _days = () => {
        if (days) {
          setdays({
            sun: days.includes('0') ? 1 : 0,
            mon: days.includes('1') ? 1 : 0,
            tue: days.includes('2') ? 1 : 0,
            wed: days.includes('3') ? 1 : 0,
            thu: days.includes('4') ? 1 : 0,
            fri: days.includes('5') ? 1 : 0,
            sat: days.includes('6') ? 1 : 0,
          });
        } else {
          setdays({ sun: 0, mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 0 });
        }        
      };


    // to update the time selected from the DatePicker selector
    const _handleTimePicked = (event:any, selectedDate:Date|any) => {
        //console.log('Selected Date');
        //console.log(selectedDate);
        if (selectedDate) {
            const currentDate = selectedDate || date;
            //
            let _temp = new Date();
            //console.log(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
            setTimeSelector(selectedDate);
            setTime(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
        }                
    };

    const _handleDatePicked = (event:any, selectedDate:Date|any) => {
        console.log(selectedDate, date);
        //setisDatePickerVisible(false);
        setDateSelector(selectedDate);
        setDate(_formattedDate(selectedDate));
      };
    
    const _daysInCronFormat = (days: Days): string => {
        let output = '';
        Object.keys(days).map((item, key) => { 
            (days[item] > 0 ? (output += '' + key) : '')
        });
        return output;
    };

    const _updateDayState = (day: string) => {
        let previousDays = days;
        console.log(previousDays[day]);
        previousDays[day] = previousDays[day] == 0 ? 1 : 0;
        setdays({...previousDays});
      };

     const _confirmTrip = () => {
        console.log('___CONFIRM TRIP___');
        // console.log(routePoints);
        
        let points = [...routePoints];
        var arrayLength = points.length;
        let startPoint:Location = {title: startLocationObject.title, latitude: startLocationObject.latitude, longitude: startLocationObject.longitude, position:1};
        console.log(points);
        
        for (var i = 0; i < arrayLength; i++) {
            console.log(points[i]);
            points[i]= {...points[i],position : i + 2}
        }
        console.log('Before full route')
        let destPoint:Location = {title: destinationLocationObject.title, latitude: destinationLocationObject.latitude, longitude: destinationLocationObject.longitude, position: arrayLength+2};        
        let _routePoints:LocationList = [startPoint, ...points, destPoint];  
        console.log(_routePoints);  
        let dateTimeString = date + ', ' + time;    
        let startTime = moment(dateTimeString, constants.DateTime.datetimeFormat).unix() * 1000;    
        let weekly = selectedTab == 1;    
        
        console.log(startTime);    
        setLoading(true);
        let _newTrip: Trip = new Trip();
        _newTrip.active=true;
        _newTrip.days= days;
        _newTrip.id=0;
        _newTrip.note= note;
        _newTrip.ongoing= false;
        _newTrip.startTime= startTime;
        _newTrip.routePoints= _routePoints;
        _newTrip.vehicle = defaultVehicle;
        _newTrip.weekly = weekly;
        

        actions.add_Trip2List(props.auth.current.token, _newTrip).then((response)=>{
            console.log(response);
            if (response.message === 'success')
            {
                setLoading(false);    
                console.log('success');
                store.dispatch({type: ACTIONS_NEWTRIP.CLEAR_NEWTRIP})                
                store.dispatch({type: ACTIONS_NEWTRIP.SET_COMPLETED, payload: {completed: true}})
                setNote('');

                Toast.showWithGravity(formatMessage('newride/toastSuccess') + startLocationObject.title + ' to ' + destinationLocationObject.title, Toast.LONG, Toast.CENTER);        
                navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'Home' },
                    ],
                })
            }
        }).catch(error => {
            setLoading(false);    
            Toast.showWithGravity(error.message,Toast.LONG, Toast.CENTER);
          }
        );
      };
    // EndFunctions



    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/NewTripDriverScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
            />
        <ScrollView keyboardShouldPersistTaps="handled"  showsVerticalScrollIndicator={false}> 
            <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={{ flex: 1}} enabled  >
            <View style={styles.TopView}>
                <View style={styles.searchbox}>
                    <Icon
                        size={20}
                        color={constants.Colors.primaryColor}
                        name="human-male-female"
                        type="material-community" />
                    <Text style={styles.input} numberOfLines={1} ellipsizeMode={'tail'}>{startLocationObject.title}</Text>
                </View>

                <View style={styles.searchbox}>
                    <Icon
                        size={20}
                        color={constants.Colors.pink400Color}
                        name="flag-variant"
                        type="material-community" />
                    <Text style={styles.input} numberOfLines={1} ellipsizeMode={'tail'}>{destinationLocationObject.title}</Text>
                </View>

            </View>

            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 5 , borderBottomWidth: 1, 
                        borderBottomColor: constants.Colors.lightGrayColor}}>
                <Text style={[styles.sectionHeaderText, { marginTop:5 }]}>{formatMessage('newride/pickup_schedule')}</Text>
                <ButtonGroup
                    onPress={(tabIndex) => setSelectedTab(tabIndex)}
                    selectedIndex={selectedTab}
                    selectedButtonStyle={{ backgroundColor: constants.Colors.primaryColor }}
                    // selectedBackgroundColor={Constants.Colors.primaryColor}
                    // color
                    selectedTextStyle={{ color: 'white' }}
                    buttons={tabs}
                    containerStyle={{
                        backgroundColor: constants.Colors.backgroundColor,
                        alignSelf: 'center',
                        height: 35,
                        width: '80%',
                        marginTop: 0,
                        borderColor: constants.Colors.primaryColor,
                    }}
                />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',borderBottomWidth: 1,
        borderBottomColor: constants.Colors.lightGrayColor }}>
                <TouchableOpacity onPress={()=> {
                    setisTimePickerVisible(true);                    
                }}>
                    <View style={styles.timeCard}>
                        <Icon size={23} color={constants.Colors.strokeGrayColor} name="access-time" style={{ margin: 5 }} />
                        <View
                            style={{
                                padding: 5,
                                backgroundColor: constants.Colors.inputBackgroundColor,
                                margin: 10,
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                            }} >
                        <Text style={styles.datetimeText}>{time}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {
                    isTimePickerVisible ? (
                        <Modal onBackButtonPress={() => { setisTimePickerVisible(false);  }}
                        onBackdropPress={() => {
                            setisTimePickerVisible(false);
                        }}
                        isVisible={isTimePickerVisible}
                        style={{
                            backgroundColor: 'white',
                            padding: 22,
                            marginTop: 50,
                            marginBottom: 50,
                            marginLeft: 40,
                            marginRight: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 2,
                            height: 160,
                            width: '80%',
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                        }}
                        >
                        <DateTimePicker
                            is24Hour={false}
                            style={{width:'100%'}}                  
                            maximumDate={new Date(2030,12,31)}
                            value={timeSelector}
                            mode={"time"}
                            minuteInterval={5}
                            onChange={(event, selectedDate)=>_handleTimePicked(event, selectedDate)}
                            onTouchCancel={()=> setisTimePickerVisible(false)}
                    />
                     <TouchableOpacity onPress={()=>setisTimePickerVisible(false)}><Text>Confirm</Text></TouchableOpacity>
                    </Modal>): null
                }


                {selectedTab == 0 ? (
                    <TouchableOpacity onPress={()=>setisDatePickerVisible(true)}>
                        <View style={styles.dateCard}>
                            <Icon style={{ margin: 5 }} size={23} color={constants.Colors.strokeGrayColor} name="calendar-blank" type="material-community" />
                            <View
                                style={{
                                    padding: 5,
                                    backgroundColor: constants.Colors.inputBackgroundColor,
                                    margin: 10,
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={styles.datetimeText}>{date}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    ): null}
                    {
                        selectedTab == 0 ? (
                          <Modal onBackButtonPress={() => { setisDatePickerVisible(false);  }}
                                    onBackdropPress={() => {
                                        setisDatePickerVisible(false);
                                    }}
                            isVisible={isDatePickerVisible}
                            style={{
                                backgroundColor: 'white',
                                padding: 22,
                                marginTop: 50,
                                marginBottom: 50,
                                marginLeft: 40,
                                marginRight: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 2,
                                height: 160,
                                width: '80%',
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                            }}
                            >
                            <DateTimePicker
                                style={{width:'100%'}}                  
                                is24Hour={false}
                                maximumDate={new Date(2030,12,31)}
                                minimumDate={new Date()}                                
                                value={dateSelector}
                                mode={"date"}
                                display={'default'}
                                onChange={(event, selectedDate)=>_handleDatePicked(event, selectedDate)}
                           // onTouchCancel={()=> setisDatePickerVisible(false)}
                        />
                        <TouchableOpacity onPress={()=>setisDatePickerVisible(false)}><Text>Confirm</Text></TouchableOpacity>
                        </Modal>): null
                    }
                
                {selectedTab == 1 ? (
                    <TouchableOpacity onPress={() => setisDaysModalVisible(true)}>
                        <View style={styles.dateCard}>
                            <Icon style={{ margin: 5 }} size={23} color={constants.Colors.strokeGrayColor} name="calendar-blank" type="material-community" />
                            <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: constants.Colors.inputBackgroundColor,
                                margin: 10,
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            >
                            {Object.keys(days).map((item, key) => (
                                <Text key={key} style={ days[item]> 0 ? styles.activeDayText : styles.deactiveDayText}>
                                {item.substring(0, 1).toUpperCase() + ' '}
                                </Text>
                            ))}
                            </View>
                        </View>
                        </TouchableOpacity>
                    ): null}
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: constants.Colors.lightGrayColor }}>
                <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 5, height: 100 }}>
                    <Text style={[styles.sectionHeaderText, { marginTop: 5 }]}>{formatMessage('newride/passengers')}</Text>
                    <View style={styles.passengerCountView}>
                        <Icon size={23} color={constants.Colors.strokeGrayColor} name="users" type="font-awesome" style={{ marginLeft: 10 }} />
                        <ModalSelector
                            style={{ width: 70, backgroundColor: constants.Colors.inputBackgroundColor, borderColor: 'transparent', marginLeft: 8 }}
                            selectStyle={{ borderRadius: 0, borderWidth: 0 }}
                            optionTextStyle={{ color: constants.Colors.blackColor }}
                            data={passengerCountModalData}
                            initValue={passengerCount.toString()}
                            onChange={(option: any) => setPassengerCount(option.key)}
                        />
                    </View>
                </View>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',borderBottomWidth: 1,
        borderBottomColor: constants.Colors.lightGrayColor, height: 60 }}>
                <Text style={styles.sectionHeaderText}>{formatMessage('newride/notesHeader')}</Text>
                <View style={{ zIndex:1000, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <TextInput
                    style={{
                        backgroundColor: constants.Colors.whiteColor,
                        borderBottomColor: '#000000',
                        borderBottomWidth: 1,
                        width: '80%',
                        fontSize: 15,
                    }}
                    multiline={true}
                    numberOfLines={2}
                    maxLength={250}
                    placeholder={formatMessage('newride/notesph')}
                    autoCorrect={false}
                    onChangeText={note => setNote(note)}
                    accessibilityElementsHidden={false}
                />
                </View>
            </View>

            {region && region.latitude != 0 && region.longitude != 0 ? (
                 <MapView 
                 provider={PROVIDER_GOOGLE}
                 style={styles.map}
                 showsMyLocationButton={true}
                 customMapStyle={constants.Maps.MAP_STYLE_ULTRA_BLUE}
                 showsUserLocation={true}
                 followsUserLocation={true}
                 showsCompass={true}
                 region={region}
             >
                 {props.newTrip && props.newTrip.startLocation != 0 ? (
                     <Polyline
                     coordinates={fullRoute}
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
                 ): null }
                 {startLocationObject ? (
                     <Marker
                     coordinate={{ latitude: startLocationObject.latitude, longitude: startLocationObject.longitude }}
                     ><Icon
                     size={20}
                     color={constants.Colors.fifthShadeColor}
                     name="human-male-female"
                     type="material-community" /></Marker>               
                 ): null }
                 {destinationLocationObject ? (
                     <Marker
                     coordinate={{ latitude:destinationLocationObject.latitude, longitude: destinationLocationObject.longitude }}
                                     ><Icon
                                     size={20}
                                     color={constants.Colors.pink400Color}
                                     name="flag-variant"
                                     type="material-community" /></Marker>                   
                 ): null }
 
                 {routePoints.map((item: Location) => (
                     <Marker title={item.title} key={item.title} coordinate={{ ...item }}>
                         <Icon color={constants.Colors.primaryDarkColor} name="location-on" />
                     </Marker>
                 ))}
             </MapView>
             
            ) : null}
           <Button
                icon={{ name: 'car-sports', type: 'material-community', color: 'white' }}
                containerStyle={{ borderRadius: 0 }}
                buttonStyle={{ 
                    width: '100%', 
                    height: 50, 
                    backgroundColor: constants.Colors.positiveButtonColor, 
                    borderRadius: 0
               }}
                raised
                title={props.preferences.isDriver ? formatMessage('newride/createride') : formatMessage('newride/findride')}
                onPressOut={()=>_confirmTrip()}
            />
        </KeyboardAvoidingView>
        </ScrollView>
        <Modal
            onBackButtonPress={() => {
                setisDaysModalVisible(!isDaysModalVisible);
            }}
            onBackdropPress={() => {
                setisDaysModalVisible(!isDaysModalVisible);
            }}
            isVisible={isDaysModalVisible}
            style={{
                backgroundColor: 'white',
                padding: 22,
                marginTop: 50,
                marginBottom: 50,
                marginLeft: 50,
                marginRight: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                borderColor: 'rgba(0, 0, 0, 0.1)',
            }}
            >
            <Text style={{ width: '100%', fontSize: 22, textAlign: 'left' }}>{formatMessage('newride/choosedays')}</Text>

            <View style={{ width: '100%', margin: 30 }}>
                {Object.keys(days).map((item, key) => (
                <CheckBox
                    containerStyle={{ width: 300 }}
                    key={key}
                    textStyle={{ marginLeft: 25, fontSize: 18, fontWeight: '100' }}
                    //style={{ paddingTop: 10, paddingRight: 5 }}
                    title={moment()
                    .day(key)
                    .format(constants.DateTime.dayFullFormat)}
                    checkedIcon="check-square"
                    checkedColor={constants.Colors.primaryColor}
                    checked={
                        parseInt(days[item]) > 0
                    }
                    onPress={() => {
                        console.log('click');
                        console.log(item);
                        console.log(parseInt(days[item]));
                        //console.log('implement updatedaystate');
                        _updateDayState(item);
                    }
                    }
                />
                ))}
            </View>

            <TouchableOpacity
                onPress={() => {
                setisDaysModalVisible(!isDaysModalVisible);
                }}
            >
                <Text style={{ width: '100%', fontSize: 18, textAlign: 'right', color: constants.Colors.primaryColor }}>{formatMessage('done')}</Text>
            </TouchableOpacity>
        </Modal>

        {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
            </View>
          ) : null}
        </View>
    );
};


function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences,
        trips: state.trips,
        vehicles: state.vehicles,
        newTrip: state.newTrip           
    };
}

//same as dispatchmapto props in eS6
const actions = {add_Trip2List};

export default connect(mapStateToProps, actions)(NewTripDriverConfirmScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.Colors.whiteColor
    },
    map: {
        flex:1,
        // height: 160,
        minHeight: Platform.OS ==='ios'? 300: 160,
        minWidth: 160,
        marginTop: 5
    },
    TopView: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: constants.Colors.lightGrayColor
    },
    searchbox: {
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: constants.Colors.backgroundColor,
    },
    activeDayText: { fontSize: 18, color: constants.Colors.positiveButtonColor },
    deactiveDayText: { fontSize: 18, color: constants.Colors.strokeGrayColor },  
    icon: {
        alignItems: 'center',
    },
    input: {
        fontWeight: '300',
        color: 'black',
        fontSize: 16,
        textAlign: 'left',
        alignSelf: 'center',
        paddingLeft: 20,
        height: 40,
        flex: 1,
        margin: 1,
        // borderRadius: 5,
        // flexShrink: 1,
        // borderWidth:1
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
        textAlign: 'center',
    },
    listContainer: {
        width: '100%',
    },
    timeCard: {
        width: SCREEN_WIDTH / 2 - 45,
        height: 60,
        marginBottom: 3,
        alignItems: 'center',
        flexDirection: 'row',
    },
    dateCard: {
        elevation: 2,
        height: 60,
        width: SCREEN_WIDTH / 2 + 30,
        marginBottom: 3,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
    datetimeText: { fontSize: 18, color: 'black' },
    passengerCountView: {
        marginTop: 5,
        alignItems: 'center',
        backgroundColor: constants.Colors.backgroundColor,
        flexDirection: 'row',
    },
    subscribeThisRideView: {
        right: 10,
        alignItems: 'center',
        backgroundColor: constants.Colors.backgroundColor,
        flexDirection: 'row',
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
      elevation: 5,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
});
