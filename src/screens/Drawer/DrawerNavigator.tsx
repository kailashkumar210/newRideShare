import React, { useState, useEffect } from 'react';
import { useGlobalize } from 'react-native-globalize';
import Splash from '../Splash';
import LoginOptions from '../LoginOptions';
import Login from '../Login';
import Registration from '../Registration';
import SelectCommunity from '../SelectCommunity';
import CustomDrawer from '.';
import Notifications from '../Notifications';
import NewRide from '../NewRide';
import Vehicles from '../Vehicles';
import Home from '../Home';
import { connect } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AddVehicle from '../AddVehicle/AddVehicle';
import Settings from '../Settings';
import RequestCommunityScreen from '../RequestCommunity';
import Help from '../Help';
import FeedBack from '../FeedBack';
import PastTrips from '../PastTrips';
import TripDetails from '../TripDetails';
import ShareRide from '../ShareRide/ShareRide';
// import Locations from '../Locations/Locations';
import ScheduledRide from '../ScheduledRide';
import UserProfile from '../UserProfile';
import SearchLocation from '../SearchLocation';
import LocationPicker from '../LocationPicker';
import SubscribedTrips from '../SubscribedTrips';
import PendingTripTrip from '../PendingTrips'
import PotentialRide from '../PotentialRide';
import NewTripDriverScreen from '../NewTripDriverScreen';
import NewTripDriverConfirmScreen from '../NewTripDriverConfirmScreen';
import PreviousSearchScreen from '../PreviousSearch';

const DrawerNavigator : React.FC = (props: any) => {
    const { formatMessage } = useGlobalize();
    const RootStack = createStackNavigator();
    const Drawer = createDrawerNavigator();
    const menuItemsDriver = [
        /*{
            index: 1,
            name: formatMessage('screen/Rewards'),
            destination: formatMessage('screen/Rewards'),
            icon: 'nature',
            iconType: 'material',
            component: ShareRide,
        },*/
        {
            index: 2,
            name: formatMessage('screen/ScheduledTripsScreen'),
            destination: formatMessage('screen/ScheduledTripsScreen'),
            icon: 'location-on',
            iconType: 'material',
            component: ScheduledRide,
        },
        {
            index: 3,
            name: formatMessage('screen/PastTripsScreen'),
            destination: formatMessage('screen/PastTripsScreen'),
            icon: 'av-timer',
            iconType: 'material',
            component: PastTrips,
        },
        {
            index: 4,
            name: formatMessage('screen/VehiclesScreen'),
            destination: formatMessage('screen/VehiclesScreen'),
            icon: 'directions-car',
            iconType: 'material',
            component: Vehicles,
        },
        {
            index: 5,
            name: formatMessage('screen/SendFeedbackScreen'),
            destination: formatMessage('screen/SendFeedbackScreen'),
            icon: 'feedback',
            iconType: 'material',
            component: FeedBack,
        },
        {
            index: 6,
            name: formatMessage('screen/SettingsScreen'),
            destination: formatMessage('screen/SettingsScreen'),
            icon: 'settings',
            iconType: 'material',
            component: Settings,
        },
        {
            index: 7,
            name: 'Help',
            destination: formatMessage('screen/HelpScreen'),
            icon: 'help',
            iconType: 'material',
            component: Help,
        },
        // {
        //     index: 8,
        //     name: 'FAKE',
        //     destination: formatMessage('screen/SettingsScreen'),
        //     icon: 'settings',
        //     iconType: 'material',
        //     component: Settings,
        // },
    ];

    const menuItemsRider = [
       /* {
            index: 1,
            name: formatMessage('screen/Rewards'),
            destination: formatMessage('screen/Rewards'),
            icon: 'nature',
            iconType: 'material',
            component: ShareRide,
        },*/
        {
            index: 2,
            name: formatMessage('screen/SubscribedTripsScreen'),
            destination: formatMessage('screen/SubscribedTripsScreen'),
            icon: 'flag',
            iconType: 'material',
            component: SubscribedTrips,
        },
        {
            index: 3,
            name: formatMessage('screen/PendingTripRequestScreen'),
            destination: formatMessage('screen/PendingTripRequestScreen'),
            icon: 'av-timer',
            iconType: 'material-community',
            component: PendingTripTrip,
        },
        {
            index: 4,
            name: formatMessage('screen/PastTripsScreen'),
            destination: formatMessage('screen/PastTripsScreen'),
            icon: 'av-timer',
            iconType: 'material',
            // screenObject: constants.Screens.SUBSCRIBED_TRIPS_SCREEN,
            component: SubscribedTrips,
        },
        {
            index: 5,
            name: formatMessage('screen/TripSearchHistoryScreen'),
            destination: formatMessage('screen/TripSearchHistoryScreen'),
            icon: 'search',
            iconType: 'material',
            component: PreviousSearchScreen,
        },
        {
            index: 6,
            name: formatMessage('screen/SendFeedbackScreen'),
            destination: formatMessage('screen/SendFeedbackScreen'),
            icon: 'feedback',
            iconType: 'material',
            component: FeedBack,
        },
        {
            index: 7,
            name: formatMessage('screen/SettingsScreen'),
            destination: formatMessage('screen/SettingsScreen'),
            icon: 'settings',
            iconType: 'material',
            component: Settings,
        },
        {
            index: 8,
            name: 'Help',
            destination: formatMessage('screen/HelpScreen'),
            icon: 'help',
            iconType: 'material',
            component: Help,
        },
        // {
        //     index: 9,
        //     name: 'FAKE2',
        //     destination: formatMessage('screen/SettingsScreen'),
        //     icon: 'settings',
        //     iconType: 'material',
        //     component: Settings,
        // },
    ];
    
    // Read the isDriver from Store and assign the mode as per persisted status
    const _drawerOptions: Array<object> = props.preferences.isDriver ? menuItemsDriver : menuItemsRider;
    
    return (
        <Drawer.Navigator
            initialRouteName="Splash"            
            drawerContent={props => <CustomDrawer {...props} options={_drawerOptions} />}>
            <RootStack.Screen name="Splash" component={Splash} options={{ gestureEnabled: false }} />
            <Drawer.Screen name="Home" component={Home} />
            {
                _drawerOptions.map((item: any) => (
                    <Drawer.Screen
                        key={item.index}
                        name={item.name} // comes from translation
                        component={item.component} />
                ))
            }
            <RootStack.Screen name="LoginOptions" component={LoginOptions} options={{ gestureEnabled: false }} />
            <RootStack.Screen name="Login" component={Login} options={{ gestureEnabled: false }} />
            <RootStack.Screen name="SelectCommunity" component={SelectCommunity} options={{ gestureEnabled: false }} />
            <RootStack.Screen name="RequestCommunity" component={RequestCommunityScreen} options={{ gestureEnabled: false }} />            
            <RootStack.Screen name="Registration" component={Registration} options={{ gestureEnabled: false }} />
            <RootStack.Screen name="Notifications" component={Notifications} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="NewRide" component={NewRide} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="AddVehicle" component={AddVehicle} options={{ gestureEnabled: false }}/>

            <RootStack.Screen name="PastTrips" component={PastTrips} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="TripDetails" component={TripDetails} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="ShareRide" component={ShareRide} options={{ gestureEnabled: false }}/>
            {/* <RootStack.Screen name="Locations" component={Locations} options={{ gestureEnabled: false }}/> */}
            <RootStack.Screen name="UserProfile" component={UserProfile} options={{ gestureEnabled: false }}/>
            
            <RootStack.Screen name="SearchLocation" component={SearchLocation} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="LocationPicker" component={LocationPicker} options={{ gestureEnabled: false }}/>

            <RootStack.Screen name="ScheduledRide" component={ScheduledRide} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="PotentialRide" component={PotentialRide} options={{gestureEnabled: false}}/>
            
            <RootStack.Screen name="NewTripDriverScreen" component={NewTripDriverScreen} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="NewTripDriverConfirmScreen" component={NewTripDriverConfirmScreen} options={{ gestureEnabled: false }}/>
            <RootStack.Screen name="PreviousSearchScreen" component={PreviousSearchScreen} options={{ gestureEnabled: false }}/>

        </Drawer.Navigator>
    );
}

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        current: state.authReducer.current,
        preferences: state.preferences,
    };
}
//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, null)(DrawerNavigator);
