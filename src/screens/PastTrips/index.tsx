import React, { Component, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator,RefreshControl} from 'react-native';
import constants from '../../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { useGlobalize } from 'react-native-globalize';
import { Icon, Avatar, ListItem } from "react-native-elements";
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import Vehicle from '../../models/Vehicle';
import { get_RemoteTripList } from '../../redux/actions/trip'
import { TouchableOpacity } from 'react-native-gesture-handler';
// import useBackButton from '../../components/BackButtonHandler';

const PastTrips: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setisModalVisible] = useState(false);
    const [pastTrips, setPastTrips] = useState();
    // useBackButton('backScreen',props);
    useEffect(()=>{
        getPastTripData();
    },[]);

    const getPastTripData = () => {
        setLoading(true);
        actions.get_RemoteTripList(props.current.token).then((response)=>{
        {
            setLoading(false);
        }}).catch(error => {
            console.log(error);
            setLoading(false);
        });
    }

    const _handleRefresh = () => {
        getPastTripData();
    }

    function Item(props: any) {
        // console.log('past trip data',props.item)
        return (
            <TouchableOpacity style={[styles.itemView]} onPress={()=>navigation.navigate('TripDetails', {subscribed2Trip:props.item, bottomButtonText : "Activate"})}>
                <View style={[styles.rightView]}>
                    <View style={styles.desView}>
                        <Icon  
                            name={'query-builder'}
                            type={'MaterialIcons'}
                            size={25}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.nameTxt}>
                            {constants.Utils._humanReadableTime(props.item.startTime, props.item.weekly)}
                        </Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'calendar-blank'}
                            type={'material-community'}
                            size={25}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>
                            {formatMessage('past_trip/On_label')} {constants.Utils._humanReadableDate(props.item.startTime)}
                        </Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'directions-car'}
                            type={'MaterialIcons'}
                            size={25}
                            color={constants.Colors.primaryColor}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>
                            {formatMessage('past_trip/Start_at_label')}: {props.item.routePoints[0].title}
                        </Text>
                    </View>
                    <View style={styles.desView}>
                        <Icon 
                            name={'location-on'}
                            type={'material'}
                            size={25}
                            color={constants.Colors.pink400Color}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>
                            {formatMessage('past_trip/Destination_label')}: {props.item.routePoints[props.item.routePoints.length - 1].title}
                        </Text>
                    </View>

                </View>
         
            </TouchableOpacity>
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
                  color: constants.Colors.primaryColor,
                }}
              >
                {formatMessage('no_potential_ride')}
              </Text>
            </View>
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

        return (
            <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/PastTripsScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            <FlatList
                    style={{ flex: 1 }}
                    keyExtractor={item => item.id+''}          
                    data={props.trips.Trips ? (props.trips.Trips.filter(item => item.active==false)).reverse(): []}
                    renderItem={({ item, index=item.id }) => <Item item={item} index={index.toString()} setLoading={setLoading}/>}
                    ItemSeparatorComponent={_renderSeparator}
                    onRefresh={_handleRefresh}
                    refreshing={loading}
                    ListEmptyComponent={_emptyView}
                />
        </View>
        );
}

const actions = { get_RemoteTripList };

function mapStateToProps(state: any) {
    // console.log('state.trips.RemoteTrip', state.trips.Trips)
    return {
        app : state.appReducer,
        current: state.authReducer.current,
        vehicles: state.vehicles, 
        trips: state.trips         
    };
}

export default connect(mapStateToProps, actions)(PastTrips);

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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15
    },
    desView: {
        flex: 1,
        flexDirection:'row'
    },
    dateTxt: {
        color: constants.Colors.darkGrayColor,
        fontSize: 15,
        paddingLeft: 10,
        flexShrink: 1
    },
    nameTxt: {
        fontWeight: '700',
        fontSize: 18,
        color: constants.Colors.darkGrayColor,
        paddingLeft: 10,
        flexShrink: 1
    },
    rightView: {
        flex: 1,
        // flexDirection: 'row',
        // borderTopWidth: 1,
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
    }
})
