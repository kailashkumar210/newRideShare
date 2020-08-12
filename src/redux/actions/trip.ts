import { ACTIONS_TRIPS, ACTIONS_APP, ACTIONS_SUBSCRIBE } from './types';
import { store } from '../configureStore';
import {api_trip_getRemote, api_getPendingTrips, api_trip_add, api_trip_update, api_trip_Delete, api_trip_getUpcomingTrip, api_trip_startDriving,
   api_trip_stopDriving, api_trip_Deactivate, api_trip_Reactivate, api_trip_updateNote, api_trip_UpdateNotification,
    api_trip_SearchHistory, api_trip_RemoveSubscription, api_trip_AcceptSubscription, api_trip_RejectSubscription, api_getPendingTripRequest, api_Ride_Get, api_ride_detail,api_potential_ride, api_trip_cancelPendingRequest,api_trip_confirmTrip} from '../../api/tripApi';

import Trip from '../../models/Trip';
import SearchedTrip from '../../models/SearchedTrip';
import Toast from 'react-native-simple-toast';

export const get_RemoteTripList = async (token: string): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - Trip')
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_trip_getRemote(token).then( response => {
        if (response.message === 'success'){
        const TripsJson: Array<Trip> | any = response !== undefined && response.trips !== undefined ? response.trips : {};
              // console.log('Getting the list of Trips remotely');
              // console.log(response);
  
            if (TripsJson) {
              let _Trips: Array<Trip>= [];
                TripsJson.map((v:Trip) => {
                //  console.log(v);
                 _Trips.push(v);                 
              });
              store.dispatch({type: ACTIONS_TRIPS.GET_REMOTE_TRIPS, payload:{ Trips: _Trips} });    
              store.dispatch({type: ACTIONS_TRIPS.SET_TRIPS, payload:{ Trips: _Trips} });    
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
        console.log('From Trip Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const add_Trip2List = async (token: string, newTrip:Trip): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_trip_add(token, newTrip.startTime, newTrip.weekly, newTrip.days, newTrip.vehicle.capacity, 
        newTrip.routePoints, newTrip.vehicle, newTrip.note).then( response => {
        if (response.message === 'success'){
        const TripsJson: Array<Trip> | any = response !== undefined && 
        response.data !== undefined ? 
        response.data : {};
              console.log(response);
              // From the APIresolve({ message: 'success', tripId: responseJson.id, data: responseJson });
              store.dispatch({type: ACTIONS_TRIPS.ADD_TRIP, payload:{ tripId: response.tripId, trip: TripsJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              // creating the trip refreshes the upcoming trips to update the home page...
              get_UpcomingTrip(token, true).then(()=>
                  resolve({ message: 'success' })
              ).catch(()=>{
                  console.log('Trip added succesfully but refreshing upcoming trip failed..')
                  resolve({ message: 'success' })
                }
              )
              
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }                
      }).catch(error => {
        console.log('From Trip Get Exception: ');
        console.log(error);
        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: error.message? error.message: "Couldn't connect to server." });
      });
    });
}

export const update_TripStartTime = async (token: string, newTrip:Trip): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      // THIS ONLY UPDATES THE START TIME???
      api_trip_update(token, newTrip.startTime, newTrip.id).then( response => {
        if (response.message === 'success'){
        const TripsJson: Array<Trip> | any = response !== undefined && 
        response.data !== undefined ? 
        response.data : {};
              console.log(response);
              // From the APIresolve({ message: 'success', tripId: responseJson.id, data: responseJson });
              store.dispatch({type: ACTIONS_TRIPS.UPDATE_TRIP, payload:{ tripId: response.tripId, trip: TripsJson} });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }                
      }).catch(error => {
        console.log('From Trip Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: "Couldn't connect to server." });
      });
    });
}

export const remove_TripFromList = async (token: string, tripId: number): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      // THIS ONLY UPDATES THE START TIME???
      api_trip_Delete(token, tripId).then( response => {
        if (response.message === 'success'){
              store.dispatch({type: ACTIONS_TRIPS.DELETE_TRIP, payload:{ tripId: tripId } });    
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              resolve({ message: 'success' });
            }
            else {
              store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
              reject({ message: 'Something is wrong with input data' });
            }                
      }).catch(error => {
        console.log('From remove Trip Get Exception: ');
        console.log(error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message:error.message? error.message: "Couldn't connect to server." });
      });
    });
}

export const set_PendingTripList = async (token: string, isDriver:boolean): Promise<any | Object> => {
  console.log('action pending trip ')
  return new Promise((resolve, reject) => {
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
      api_getPendingTripRequest(token, isDriver).then( response => {
        console.log('PENDING LIST ',response);
        if (response.message === 'success'){
        const TripsJson: Array<Trip> | any = response !== undefined && response.pendingTrips !== undefined ? response.pendingTrips : {};
              console.log('Getting the list of Trips remotely');
              console.log(response);
  
            if (TripsJson) {
              let _Trips: Array<Trip>= [];
                TripsJson.map((v:Trip) => {
                 //console.log(v);
                 _Trips.push(v);                 
              });
              store.dispatch({type: ACTIONS_TRIPS.SET_PENDINGTRIPS, payload:{ pendingTrips: _Trips} });    
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
        console.log('From Trip Get Exception: '+error);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        reject({ message: error.message? error.message:"Couldn't connect to server." });
      });
    });
}

export const get_UpcomingTrip = async (token: string, isDriver:boolean): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_getUpcomingTrip(token, isDriver).then( response => {
      if (response.message === 'success'){
      const TripsJson: any = response !== undefined && response.upcomingTrip !== undefined ? response : {};
            console.log('Getting upcomingtrip');
            //console.log(response);

          if (TripsJson) {
            if (!isDriver){
              store.dispatch({type: ACTIONS_TRIPS.SET_UPCOMINGTRIP, payload:{ isDriver: isDriver, upcomingSubscriberTrip: TripsJson.upcomingSubscriberTrip, upcomingTrip: TripsJson.upcomingTrip, hasUpcomingTrip: TripsJson.hasUpcomingTrip} });    
            }
            else {
              store.dispatch({type: ACTIONS_TRIPS.SET_UPCOMINGTRIP, payload:{ isDriver: isDriver, upcomingTrip: TripsJson.upcomingTrip, hasUpcomingTrip: TripsJson.hasUpcomingTrip} });    
            }
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
      console.log('From getupcomingtrip Get Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: error.message? error.message:"Couldn't connect to server." });
    });
  });
}

export const set_startDriving = async (token: string, tripId:number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_startDriving(token, tripId).then( response => {
       console.log('startDriving action')
       console.log(response);
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.START_DRIVING, 
          payload:{ UpcomingTrip: response.upcomingTrip, ongoing: response.ongoing } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        resolve({ message: 'success'});
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch(error => {
      console.log('From setstartDrivinb Get Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const set_stopDriving = async (token: string, tripId:number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_stopDriving(token, tripId).then( response => {
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.STOP_DRIVING, 
          payload:{ UpcomingTrip: response.upcomingTrip, ongoing: response.ongoing } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        resolve({ message: 'success'});
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch(error => {
      console.log('From setstopDrivinb Get Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const set_deactivate_Trip = async (token: string, tripId:number): Promise<any | Object> => {
  console.log("Action Deactivate : ",tripId);
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_Deactivate(token, tripId).then( response => {
      console.log('trip deactivated '+ response)
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.DEACTIVATE_TRIP, payload:{ tripId: tripId, Trip: response.data } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        resolve({ message: 'success'});
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch(error => {
      console.log('From deactivate Get Exception: '+error);
      Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);

      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const set_reactivate_Trip = async (token: string, tripId:number): Promise<any | Object> => {
  console.log("Reactive ",tripId);
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_Reactivate(token, tripId).then((response: { message: string; data: any; }) => {
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.DEACTIVATE_TRIP, 
          payload:{ tripId: tripId, Trip: response.data } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });
        resolve({ message: 'success'});    
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From deactivate Get Exception: '+error);
      Toast.showWithGravity('Unable to reactivate'+error, Toast.LONG, Toast.BOTTOM);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}  

export const set_noteFor_Trip = async (token: string, tripId:number, note: string): Promise<any | Object> => {
  console.log('set_noteFor_Trip', token, tripId, note)
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_updateNote(token, tripId, note).then((response: { message: string; data: any; }) => {
      console.log('set_noteFor_Trip response', response)
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.UPDATE_NOTE, 
          payload:{ tripId: tripId, Note: note } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });   
        resolve({ message: 'success'}); 
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From deactivate Get Exception: ',error);
      Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}  

export const set_ConfirmTrip = async (token, tripId, passengerStartLocationObject, passengerdestinationLocationObject, passengerCount,daysInCronFormat): Promise<any | Object> =>{
  
  console.log("Passenger Count ", passengerCount);
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_confirmTrip(token, tripId, passengerStartLocationObject, passengerdestinationLocationObject, passengerCount,daysInCronFormat).then((response: { message: string; data: any; }) => {
        console.log("Trip Confirm Response", response)
      if (response.status == 200){        
      //   store.dispatch({type: ACTIONS_TRIPS.UPDATE_NOTE, 
      //     payload:{ tripId: tripId, Note: note } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });   
        resolve({ message: 'success'}); 
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From deactivate Get Exception: '+error);
      Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const set_TripNotification = async (token: string, searchedTrip: SearchedTrip): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_UpdateNotification(token, searchedTrip).then((response: { message: string; data: any; }) => {
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.UPDATE_TRIP_NOTIFICATION, 
          payload:{ tripId: searchedTrip.id, notifyTripAvailable: searchedTrip.notifyTripAvailable } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });   
        resolve({ message: 'success'}); 
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From deactivate Get Exception: ',error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
} 

export const get_TripSearchHistory = async (token: string): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_SearchHistory(token).then((response: { message: string; SearchedTrips: any; }) => {
      console.log('trip search History');
      //console.log(response.SearchedTrips);
      if (response.message === 'success'){        
        //store.dispatch({type: ACTIONS_TRIPS.SET_SEARCHEDTRIPLIST, payload:{ SearchedTrips: []}});
        store.dispatch({type: ACTIONS_TRIPS.SET_SEARCHEDTRIPLIST, payload: { SearchedTrips: response.SearchedTrips }});
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });   
        resolve({ message: 'success'}); 
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From trip search Get Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
} 

export const set_removeSubscription_Trip = async (token: string, tripId:number, susbscriberId: number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_RemoveSubscription(token, tripId, susbscriberId).then( response => {
      if (response.message === 'success'){        
        store.dispatch({type: ACTIONS_TRIPS.REMOVE_SUBSCRIPTION, 
          payload:{ tripId: tripId, Trip: response.data } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
        resolve({ message: 'success'});
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch(error => {
      console.log('From remove susbscription Get Exception: '+error);
      Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);

      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const set_acceptSubscription_Trip = async (token: string, tripId:number, susbscriberId: number, note: string): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    // console.log('_acceptPendingSubsciption in ts',token, tripId, susbscriberId, note)
    api_trip_AcceptSubscription(token, tripId, susbscriberId, note).then((response: { message: string; Trip: any; }) => {
      
      console.log('Accept Subscription API ',response)
      
      if (response.message === 'success'){        
        console.log('_acceptPendingSubsciption in ts 1',response)
        store.dispatch({type: ACTIONS_TRIPS.ACCEPT_SUBSCRIPTION, 
          payload:{ tripId: tripId, Trip: response.Trip } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });
        resolve({ message: 'success'});    
      }
      else {
        console.log('_acceptPendingSubsciption in ts 2',response);
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('_acceptPendingSubsciption From accept susbs Get Exception: ',error);
      Toast.showWithGravity(error, Toast.LONG, Toast.BOTTOM);

      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
} 

export const set_rejectSubscription_Trip = async (token: string, tripId:number, susbscriberId: number, note: string): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_trip_RejectSubscription(token, tripId, susbscriberId, note).then((response: { message: string; Trip: any; }) => {
      if (response.message === 'success'){   
        console.log("Reject API Call ",response)   ;  
        store.dispatch({type: ACTIONS_TRIPS.REJECT_SUBSCRIPTION, 
          payload:{ tripId: tripId, Trip: response.Trip } });        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });
        resolve({ message: 'success'});    
      }
      else {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
        reject({ message: response.message });
      }
    }).catch((error: string) => {
      console.log('From reject subscription Get Exception: '+error);
      Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);

      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
} 

// past trip Api
export const get_pastRide = async (token: string) => {
  return new Promise((resolve, reject) => {
  console.log('through the action - Ride')
  api_Ride_Get(token).then( (response: { message: string; data: any; }) => {
    const RideJson = response !== undefined && response.data !== undefined ? response.data : {};
          console.log('Getting the list of Past Ride remotely');
          console.log(response);

        if (RideJson) {
          let _ride : Array<Trip>= [];
          RideJson.map((v: Trip) => {
              _ride.push(v);
          });
          console.log('Pending - check api data return');
          resolve({ message: 'success', data: response.data });
        }
        else {
          reject({ message: 'Something is wrong with input data' });
        }
  }).catch((error: string) => {
    console.log('From Ride Get Exception: '+error);
    reject({ message: "Couldn't connect to server." });
  });
});
}

export const get_rideDetails = async (token: string, subscribed2TripId: string): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    // console.log('through the action - get_rideDetails')
    api_ride_detail(subscribed2TripId, token).then(response => {
      // console.log('api get_rideDetails');
      // console.log(response);
      const getRideDetailsJson: Array<Object>| any = response !== undefined && response.data !== undefined ? response.data : {};
      
      resolve({message:'success', data: getRideDetailsJson});
      }).catch((error)=> {
          console.log('Error reading get_rideDetails :');
          console.log(error);
          reject({message: error})
      })
  });
} 

export const get_PotentialTripList = (token: string, data) => {
  return new Promise((resolve, reject) => {
  console.log('Potential Ride ');
  api_potential_ride(token,data).then( (response: { message: string; data: any; }) => {
    const RideJson = response !== undefined && response.data !== undefined ? response.data : {};
          console.log('Getting the list of Past Ride remotely');
          console.log("Potential RIde response ",response.data);

        if (RideJson) {
          // let _ride : Array<Trip>= [];
          // RideJson.map((v: Trip) => {
          //     _ride.push(v);
          // });
          console.log('Pending - check api data return');
          resolve({ message: 'success', data: response.data });
        }
        else {
          reject({ message: 'Something is wrong with input data' });
        }
  }).catch((error: string) => {
    console.log('From Ride Get Exception: '+error);
    reject({ message: "Couldn't connect to server." });
  });
});
}

export const cancelPendingTripRequest = (token: string,tripId: number) => {
  return new Promise((resolve, reject) => {
  console.log('api_trip_cancelPendingRequest ',tripId);
  api_trip_cancelPendingRequest(token,tripId).then( (response: { message: string; data: any; }) => {
    const RideJson = response !== undefined && response.data !== undefined ? response.data : {};
          console.log("api_trip_cancelPendingRequest response ",RideJson);

        if (RideJson) {
          // let _ride : Array<Trip>= [];
          // RideJson.map((v: Trip) => {
          //     _ride.push(v);
          // });
          store.dispatch({type: ACTIONS_SUBSCRIBE.SET_UNSUBSCRIBE, payload : { TripId: tripId}})
          console.log('Cancel - check api data return');
          resolve({ message: 'success', data: response.data });
        }
        else {
          reject({ message: 'Something is wrong with input data' });
        }
  }).catch((error: string) => {
    console.log('From Ride Get Exception: '+error);
    Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);

    reject({ message: "Couldn't connect to server." });
  });
});
}