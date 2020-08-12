import React, { Component, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator,RefreshControl,Image} from 'react-native';
import constants from '../../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { useGlobalize } from 'react-native-globalize';
import { Icon, Avatar, ListItem } from "react-native-elements";
import {connect} from 'react-redux';
import { get_TripSearchHistory,set_TripNotification } from '../../redux/actions/trip'
import { TouchableOpacity } from 'react-native-gesture-handler';
import useBackButton from '../../components/BackButtonHandler';
import { store } from '../../redux/configureStore';
import { ACTIONS_NEWTRIP } from '../../redux/actions/types';
import Toast from 'react-native-simple-toast';

const PreviousSearch: React.FC = (props: any)   => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setisModalVisible] = useState(false);
    const [pastTrips, setPastTrips] = useState();
    const [listData,setListData] = useState([]);
    useBackButton('backScreen',props);

    useFocusEffect(
        React.useCallback(()=>{
                    if (navigation.isFocused()){
                        getTripSearchHistory();}
      },[props.current])
    );

    const getTripSearchHistory = () => {
        console.log('api call',props.app.authorized, !props.current.isDriver)
        setLoading(true);
        actions.get_TripSearchHistory(props.current.token).then(success => {
                console.log('success',success,props.getSearchedTrips)
                setLoading(false);
                setListData(props.getSearchedTrips.reverse());
            }).catch(error => {
                console.log(error);
                setLoading(false);
            });
        
    }

   
    const navigateToNextScreen = (item:any) => {
        // We update the NewTrip Global State for the secreens to behave properly
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
    }

    const getTripNotify = (item) => {
        console.log('getTRipNotify',item)
        item.notifyTripAvailable = !item.notifyTripAvailable;
        actions.set_TripNotification(props.current.token, item).then(success => {
            console.log(item);
            Toast.showWithGravity(item.notifyTripAvailable ? 'Subscribed to search' :'Unsubscribed to search',Toast.LONG, Toast.BOTTOM);
        }).catch((error)=> console.log('Subscription to search failed', error))
    }

    function Item(props: any) {
        // console.log('data',props.item)
        let item = props.item;
        return (
            <View key={item.id+''} style={[styles.itemView]}>
                <View style={[styles.rightView]} onStartShouldSetResponder={ () => navigateToNextScreen(props.item)}>
                    <View style={styles.desView}>
                        <Icon  
                            name={'query-builder'}
                            type={'MaterialIcons'}
                            size={27}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.nameTxt}>
                        {constants.Utils._humanReadableTime(item.datetime, false)}
                        </Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'calendar-blank'}
                            type={'material-community'}
                            size={27}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>
                            {formatMessage('past_trip/On_label')} {item.weekly ? constants.Utils._humanReadableDaysFromCron(item.days) : constants.Utils._humanReadableDate(item.datetime)}
                        </Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'directions-car'}
                            type={'MaterialIcons'}
                            size={27}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>{formatMessage('past_trip/Start_at_label')} : {props.item.startAddressTitle}</Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'location-on'}
                            type={'material'}
                            size={27}
                            color={constants.Colors.pink400Color}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>{formatMessage('past_trip/Destination_label')} : {props.item.destAddressTitle}</Text>
                    </View>

                </View>
                <TouchableOpacity style={styles.BtnView}>
                    <Icon
                        raised
                        size={20}
                        color={props.item.notifyTripAvailable?constants.Colors.primaryColor:constants.Colors.strokeGrayColor}
                        name="notifications"
                        onPress={() => getTripNotify(props.item)}                       
                    />
                </TouchableOpacity>
         
            </View>
        );
    }

    const _renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: '95%',
              alignSelf: 'center',
              backgroundColor: '#CED0CE',
            }}
          />
        );
      };

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

      const   _emptyView = () => {
        return (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                padding: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: constants.Colors.primaryColor,
                }}
              >
                {formatMessage('no_potential_ride')}
              </Text>
            </View>
        );
      };
    

        return (
            <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/TripSearchHistoryScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            <FlatList
                    style={{ flex: 1 }}
                    keyExtractor={(item)=> item.id+''}
                    data={listData.reverse()}
                    renderItem={({ item, index=item.id }) => <Item item={item} index={index.toString()} setLoading={setLoading}/>}
                    ItemSeparatorComponent={_renderSeparator}
                    onRefresh={getTripSearchHistory}
                    refreshing={loading}
                    ListEmptyComponent={_emptyView}

                />
        </View>
        );
}

const actions = { get_TripSearchHistory, set_TripNotification };

function mapStateToProps(state: any) {
    //console.log('state.trips', state.authReducer.current, state.trips.SearchedTrips)
    return {
        app : state.appReducer,
        current: state.authReducer.current,
        getSearchedTrips: state.trips.SearchedTrips         
    };
}

export default connect(mapStateToProps, actions)(PreviousSearch);

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    headerTxt: {
        color: constants.Colors.whiteColor,
        fontSize: 18,
        fontWeight: '400',           
    },
    itemView: {
        // width: '100%',
        flex:1,
        flexDirection: 'row',
        justifyContent:'space-between',
        // paddingRight: 20,
    },
    desView: {
        // flex: 1,
        flexDirection:'row'
    },
    dateTxt: {
        color: constants.Colors.darkGrayColor,
        fontSize: 16,
        paddingLeft: 10
    },
    nameTxt: {
        fontWeight: 'bold',
        fontSize: 18,
        color: constants.Colors.darkGrayColor,
        paddingLeft: 10
    },
    rightView: {
        width: '85%',
        padding: 15
    },
    MainViewStyles: {
        backgroundColor: constants.Colors.positiveButtonColor,
        width:'100%',
        height:60,
        justifyContent:'center',
        alignItems:'center'
    },
    requestTextView: {
        fontSize:18,
        color: constants.Colors.whiteColor
    },
    ImageViewStyles: {
        backgroundColor: constants.Colors.whiteColor,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    },
    BottomTextView: {
        backgroundColor: constants.Colors.whiteColor,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        height:60,
        borderTopWidth:1,
        borderTopColor:constants.Colors.greyTextColor
    },
    btnView: {
        width:'50%',
        justifyContent:'center',
        alignItems:'center'
    },
    btnText: {
        fontSize:18,
        fontWeight:'600'
    },
    centerView: {
        height:60,
        borderRightWidth:1,
        borderRightColor:constants.Colors.greyTextColor
    },
    BtnView: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginRight: 20,
    },
    iconStyle: {
        height: 20,
        width: 20,
        // tintColor: constants.Colors.green
    },
})
