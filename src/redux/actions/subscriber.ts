import { ACTIONS_SUBSCRIBE, ACTIONS_APP } from './types';
import { store } from '../configureStore';
import { api_subscribe_getRemote, api_subscribe, api_unsubscribe, api_subscribe_request, api_subscribe_get_PendingRequest } from '../../api/subscriberTrip';
import Trip from '../../models/Trip';
import SearchedTrip from '../../models/SearchedTrip';
import SubscriberTrip from '../../models/SubscriberTrip';
import PendingTripRequest from '../../models/PendingTripRequest';

export const get_RemoteSubscribed = async (token: string): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - subscribed')
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_subscribe_getRemote(token).then( response => {
        console.log('remote subscribed responded')
        console.log(response);
        if (response.message === 'success'){
        const SubscribedTripsJson: Array<Trip> | any = response !== undefined && response.subscriberTrips !== undefined ? 
        response.subscriberTrips : {};
        
            if (SubscribedTripsJson) {              
              store.dispatch({type: ACTIONS_SUBSCRIBE.SET_REMOTESUBSCRIPTIONS, payload:{ subscriberTrips: SubscribedTripsJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }
        }
        else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: response.message });
          }
      }).catch(error => {
        console.log('From subscribed remote Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const set_subscribe = async (token: string, subscribed2Trip: SubscriberTrip): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - subscribed', subscribed2Trip.id, subscribed2Trip.routePoints[0], subscribed2Trip.routePoints[1], subscribed2Trip.capacity, subscribed2Trip.startTime)
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_subscribe(token, subscribed2Trip.id, subscribed2Trip.routePoints[0], subscribed2Trip.routePoints[1], subscribed2Trip.capacity, subscribed2Trip.startTime).then( response => {
        if (response.message === 'success'){
        const SubscribedTripJson: SubscriberTrip | any = response !== undefined && response.susbscriberTrip !== undefined ? 
        response.susbscriberTrip : {};
              console.log('set subscribed');
              console.log(response);
  
            if (SubscribedTripJson) {              
              store.dispatch({type: ACTIONS_SUBSCRIBE.SET_SUBSCRIBE, payload:{ Trip: SubscribedTripJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }
        }
        else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: response.message });
          }
      }).catch(error => {
        console.log('From set_subscribe remote Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const set_unsubscribe = async (token: string, tripId: number): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - Trip unsubscribe')
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      console.log('calling api');
      api_unsubscribe(token, tripId).then( response => {
        if (response.message === 'success'){
        const SubscribedTripJson: SubscriberTrip | any = response !== undefined && response.susbscriberTrip !== undefined ? 
        response.susbscriberTrip : {};
              console.log('set unsubscribed');
              console.log(response);
  
            if (SubscribedTripJson) {              
              store.dispatch({type: ACTIONS_SUBSCRIBE.SET_UNSUBSCRIBE, payload:{ Trip: SubscribedTripJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }
        }
        else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: response.message });
          }
      }).catch(error => {
        console.log('From set_subscribe remote Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const set_subscribe_request = async (token: string, subscribed2Trip: SubscriberTrip): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - Trip subscribe request')
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      console.log('calling api');
      api_subscribe_request(token, subscribed2Trip.trip.id, subscribed2Trip.startLocation, subscribed2Trip.destinationLocation, subscribed2Trip.passengerCount, subscribed2Trip.days).then( response => {
        if (response.message === 'success'){
        const SubscribedTripJson: boolean = response
              console.log('set subscribed');
              //console.log(response);
  
            if (SubscribedTripJson) {              
                // should this one update the trip ID to pending or anything?
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success', subscribed : SubscribedTripJson });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }
        }
        else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: response.message });
          }
      }).catch(error => {
        console.log('From set_subscribe remote Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const get_subscribed_PendingRequests = async (token: string): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - Trip PendingRequests')
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_subscribe_get_PendingRequest(token).then( response => {
        if (response.message === 'success'){
        const SubscribedTripsJson: Array<PendingTripRequest> | any = response !== undefined && response.pendingTrips !== undefined ? 
        response.pendingTrips : {};
              console.log('Getting the list of pending requests remotely');
              //console.log(response);
  
            if (SubscribedTripsJson) {              
              store.dispatch({type: ACTIONS_SUBSCRIBE.SET_PENDINGTRIPSREQUESTS, payload:{ pendingTripRequests: SubscribedTripsJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }
        }
        else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: response.message });
          }
      }).catch(error => {
        console.log('From subscribed pending remotes Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}
