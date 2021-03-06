import React, { Component, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, RefreshControlComponent, RefreshControl, Alert } from 'react-native';
import constants from '../../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { useGlobalize } from 'react-native-globalize';
import { Icon, Avatar, ListItem } from "react-native-elements";
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { get_RemoteTripList } from '../../redux/actions/trip';
import Trip from '../../models/Trip';

const ScheduledRide: React.FC = (props: any) => {

    let navigation = useNavigation()
    const { formatMessage } = useGlobalize();
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const [data, setData] = useState([]);
    const [loadFirstTime, setLoadFirsttime] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(() => {
        if (data.toString() === '' && loadFirstTime) {
            _handleRefresh();
        }
    });

    const _handleRefresh = () => {
        setRefreshing(true);
        _makeRemoteRequest();
    };

    const _makeRemoteRequest = () => {
        setLoading(true);
        setLoadFirsttime(false);
        actions.get_RemoteTripList(props.auth.current.token).then(() => {
            setLoading(false);
            setRefreshing(false);
        }).catch(error => {
            setLoading(false);            
        });
        
    }

    const _hasPendingRequest = (id: number) => {
        //console.log('props.trips.PendingTrips.includes(id)',props.trips.PendingTrips)
        return props.trips.PendingTrips.includes(id);
    };
    
    function ScheduledItem(props: any) {
        return (
            <TouchableOpacity style={[styles.itemView]} onPress={() => navigation.navigate('TripDetails', { subscribed2Trip: props.item, bottomButtonText : "Deactivate" })}>

                <View style={[styles.rightView, { borderTopColor: (props.index != 0) ? constants.Colors.strokeGrayColor : 'transparent' }]}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>

                        <View style={{ flexDirection: 'row' }}>

                            <Icon
                                name={'query-builder'}
                                type={'MaterialIcons'}
                                size={27}
                                color={constants.Colors.primaryColor}
                                style={{ alignSelf: 'center' }}
                            />
                            <Text allowFontScaling={false} style={styles.nameTxt}>
                                {constants.Utils._humanReadableTime(props.item.startTime)}
                            </Text>
                        </View>
                        {_hasPendingRequest(props.item.id) ? <Icon name="circle" type="font-awesome" size={15} color={constants.Colors.pink400Color} /> : null}

                    </View>
                    <View style={[styles.desView, { marginTop: 10 }]}>
                        <Icon
                            name={'calendar-blank'}
                            type={'material-community'}
                            size={27}
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
                            size={27}
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
                            size={27}
                            color={constants.Colors.pink400Color}
                            style={{ alignSelf: 'center' }}
                        />
                        <Text allowFontScaling={false} style={styles.dateTxt}>
                            {formatMessage('past_trip/Destination_label')}: {props.item.routePoints[props.item.routePoints.length-1].title}
                        </Text>
                    </View>

                </View>

            </TouchableOpacity>
        );
    }

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

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/ScheduledTripsScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
                rightActionVisible={true}
                width={SCREEN_WIDTH}
            />
            <FlatList
                style={{ flex: 1 }}
                data={props.trips.Trips.length > 0 ? (props.trips.Trips.filter((item: Trip) => item.active == true )).reverse() : []}
                keyExtractor={item=> item.id+''}
                renderItem={({ item, index = item.id }) => <ScheduledItem item={item} index={index.toString()} />}
                refreshing={refreshing}
                onRefresh={_handleRefresh}
                ListEmptyComponent={_emptyView}
            
            />
        </View>
    );
}

const actions = { get_RemoteTripList };

function mapStateToProps(state: any) {
    //console.log('state.trips.PendingTrips', state.trips.Trips);
    return {
        app: state.appReducer,
        auth: state.authReducer,
        trips: state.trips,        
    };
}

export default connect(mapStateToProps, actions)(ScheduledRide);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    itemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15
    },

    desView: {
        flex: 1,
        // paddingLeft: 15
        flexDirection: 'row',
        // justifyContent:'space-between'
    },
    dateTxt: {
        color: constants.Colors.darkGrayColor,
        fontSize: 16,
        paddingLeft: 10,
        // lineHeight: 15
        flexShrink: 1,
    },
    nameTxt: {
        fontWeight: 'bold',
        fontSize: 18,
        color: constants.Colors.darkGrayColor,
        paddingLeft: 10,
        flexShrink: 1
    },
    rightView: {
        flex: 1,
        borderTopWidth: 1,
        padding: 15
    },
})
