import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform } from 'react-native';
import constants from '../../constants';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import Header from '../../components/Header';
import ModalSelector from 'react-native-modal-selector';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Icon, ButtonGroup, Button, CheckBox } from "react-native-elements";
import { useNavigation } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';
import {connect,} from 'react-redux';
import { Location } from '../../models/types';
import {Days} from '../../models/types';
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

const _defaultLocation ={
    latitude: 13.762925,
    longitude: 100.5091538,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };


const NewRide: React.FC = (props:any) => {//{startLocationObject, destinationLocationObject}) => {
    
    let navigation = useNavigation()
    let startLocationObject:Location = props.newTrip && props.newTrip.startLocation && props.newTrip.startLocation!== undefined ? {..._defaultLocation, latitude: props.newTrip.startLocation.latitude, longitude:props.newTrip.startLocation.longitude, title: props.newTrip.startLocation.title} : _defaultLocation; 
    let destinationLocationObject = props.newTrip && props.newTrip.destinationLocation && props.newTrip.destinationLocation!== undefined ? {..._defaultLocation, latitude: props.newTrip.destinationLocation.latitude, longitude:props.newTrip.destinationLocation.longitude, title: props.newTrip.destinationLocation.title} : _defaultLocation; 

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

    const {formatMessage} = useGlobalize();
    const [loading, setLoading] = useState(false);
    // Tab labels
    const tabs = [formatMessage('newride/single'), formatMessage('newride/weekly')];

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
        console.log('Selected Date', selectedDate);
       // setisTimePickerVisible(false);
        if (selectedDate) {
            const currentDate = selectedDate || date;
            //console.log(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
            setTimeSelector(selectedDate);
            setTime(('0'+currentDate.getHours()).slice(-2)+":"+('0'+currentDate.getMinutes().toString()).slice(-2));
        }                
    };

    const _handleDatePicked = (event:any, selectedDate:Date|any) => {
        console.log(selectedDate);
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

    const _navigateToPotentialRidesScreen = () => {
        let dateTimeString = date + ', ' + time;    
        let startTime = moment(dateTimeString, constants.DateTime.datetimeFormat).unix() * 1000;    
        let weekly = selectedTab == 1;    
        let daysInCronFormat;
        console.log('final date to query' ,dateTimeString, startTime)
        if (!weekly) {
          let day = moment
            .unix(startTime / 1000)
            .local()
            .day();
          daysInCronFormat = '' + day;
        } else {
          daysInCronFormat = _daysInCronFormat(days);
        }
            
        //  screen: Constants.Screens.POTENTIAL_RIDES_SCREEN.screen,
          navigation.navigate('PotentialRide', {
            startLocationObject: startLocationObject,
            destinationLocationObject: destinationLocationObject,
            capacity: passengerCount,
            datetime: startTime,
            days: daysInCronFormat,
            weekly: weekly,
            notifyTripAvailable: notifyTripAvailable,
            NavigatingFrom:'NewRide'
          });
      };
    // EndFunctions

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/NewTripDriverScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
            />
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
                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.input}>{destinationLocationObject.title}</Text>
                </View>

            </View>

            <View style={{ paddingBottom:5 }}>
                <Text style={styles.sectionHeaderText}>{formatMessage('newride/pickup_schedule')}</Text>
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
                        height: 40,
                        width: '80%',
                        marginTop: 0,
                        borderColor: constants.Colors.primaryColor,
                    }}
                />
            </View>

            {/* Code copy from old file */}

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={()=> setisTimePickerVisible(true)}>
                    <View style={styles.timeCard}>
                        <Icon size={23} color={constants.Colors.strokeGrayColor} name="access-time" 
                        style={{ margin: 5 }} />
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
                    <TouchableOpacity onPress={()=>{

                    console.log('DatePickervisible: ', selectedTab,  isDatePickerVisible);
                    setisDatePickerVisible(true)
                }}>
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
                
                {selectedTab == 1 && (
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
                    )}
            </View>

            <View style={styles.ThirdView}>

                <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 5 }}>

                    <Text style={[styles.sectionHeaderText, { marginTop: -5 }]}>{formatMessage('newride/passengers')}</Text>

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

                <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 5 }}>
                    <Text style={styles.sectionHeaderText}>{formatMessage('newride/subscribe')}</Text>
                    <View style={styles.subscribeThisRideView}>
                        <Icon size={23} color={constants.Colors.strokeGrayColor} name="notifications" style={{ marginLeft: 5 }} />
                        <CheckBox
                            size={23}
                            textStyle={{ fontSize: 8, fontWeight: '100' }}
                            // style={{}}
                            iconRight
                            title={formatMessage('newride/get_notified')}
                            checkedIcon="check-square"
                            checkedColor={constants.Colors.primaryColor}
                            checked={notifyTripAvailable}
                            onPress={() => setNotifyTripAvailable(!notifyTripAvailable)}
                        />
                    </View>
                </View>

            </View>


            <MapView 
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsMyLocationButton={true}
                customMapStyle={constants.Maps.MAP_STYLE_ULTRA_BLUE}
                showsUserLocation={true}
                followsUserLocation={true}
                showsCompass={true}
                region={{
                    latitude: startLocationObject.latitude,
                    longitude: startLocationObject.longitude,
                    latitudeDelta: 0.025,
                    longitudeDelta: 0.0021,
                }}
            >
                {startLocationObject && destinationLocationObject ? (
                    <Polyline
                    coordinates={[
                        { latitude: startLocationObject.latitude, longitude: startLocationObject.longitude },
                        { latitude: destinationLocationObject.latitude, longitude: destinationLocationObject.longitude },                        
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
            </MapView>
            <Button
                icon={{ name: 'car-sports', type: 'material-community', color: 'white' }}
                containerStyle={{ borderRadius: 0 }}
                buttonStyle={{ width: '100%', height: 50, backgroundColor: constants.Colors.positiveButtonColor, borderRadius: 0 }}
                onPress={_navigateToPotentialRidesScreen}
                raised
                title={props.preferences.isDriver ? formatMessage('newride/createride') : formatMessage('newride/findride')}
            />

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


        </View>
    );
};


function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences, 
        newTrip: state.newTrip,    
    };
}

//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, actions)(NewRide);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.Colors.whiteColor
    },
    map: {
        // height: 120,
        // marginTop: 5
        flex: 1,
        minHeight: Platform.OS ==='ios'? 300: 160,
        width: SCREEN_WIDTH,
        bottom: 0,
    },
    TopView: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: constants.Colors.lightGrayColor
    },
    searchbox: {
        // padding: 10,
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
        borderRadius: 5,
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
        // flex: 1,
        flexDirection: 'row',
        borderTopColor: constants.Colors.lightGrayColor,
        borderTopWidth: 1,
        paddingBottom: 10,
        paddingTop: 10,
    }
});
