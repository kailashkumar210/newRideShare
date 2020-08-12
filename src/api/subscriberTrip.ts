import httpClient from './httpClient'
import { AxiosResponse } from 'axios';
import { Days, Location } from '../models/types';
import Vehicle from '../models/Vehicle';
import moment, { isDate } from 'moment';
import Trip from '../models/Trip';
import SubscriberTrip from '../models/SubscriberTrip';
import SearchedTrip from '../models/SearchedTrip';

export interface ICommunity {
    id: number;
    name: string;
    code: string;
    visible: boolean;
}

export interface ICommunityResponse {
    data: Array<ICommunity>;
    message: string;
}

export const api_subscribe = (token: string, tripId:number, 
  passengerStartLocationObject: Location, passengerdestinationLocationObject: Location, passengerCount: number, daysInCronFormat: string) :Promise<any | Object>=> {

    console.log('ride details ', token,passengerStartLocationObject,passengerdestinationLocationObject,passengerCount,daysInCronFormat);
    
    return new Promise((resolve, reject) => {
    let url = '/trip/subscribe';

    if (tripId && passengerStartLocationObject && passengerdestinationLocationObject && passengerCount && daysInCronFormat) {
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
          startLat: passengerStartLocationObject.latitude,
          startLon: passengerStartLocationObject.longitude,
          destLat: passengerdestinationLocationObject.latitude,
          destLon: passengerdestinationLocationObject.longitude,
          passengerCount: passengerCount,
          days: daysInCronFormat,
          tripId: tripId
        },
      })
      .then(
        response => {
          let responseJson: SubscriberTrip = response.data;
          console.log('responseJson', responseJson)
          if (responseJson.id) {
            //this.subscriberTrips.set(responseJson.id, responseJson);
            resolve({ message: 'success', susbscriberTrip: responseJson });
          } else {
            reject({ message: response.data.message ? response.data.message : 'Something is wrong from server' });
          }                
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
      }
      else
      {
        reject({message: 'error'})
      }
    });  
};

export const api_unsubscribe = (token: string, tripId:number ) :Promise<any | Object>=> {
  return new Promise((resolve, reject) => {
  let url = `/trip/unsubscribe/${tripId}`;

  httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
  httpClient
    .get(url)
    .then(
      response => {
        let responseJson: SubscriberTrip = response.data;

        if (responseJson) {
          // this.subscriberTrips.set(id, updatedSubscriberTrip);
          resolve({ message: 'success', susbscriberTrip: responseJson });
        } else {
          reject({ message: response.data.message ? response.data.message : 'Something is wrong from server' });
        }                
      },
      error => {reject({message: 'error'})}
    ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    
  });  
};

export const api_subscribe_getRemote = (token: string) :Promise<any | Object>=> {
  return new Promise((resolve, reject) => {
  let url = '/trip/subscribed';

  httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
  httpClient
    .get(url)
    .then(
      response => {
        let responseJson: Array<SubscriberTrip> = response.data;
        if (responseJson) {
          //this.subscriberTrips.set(responseJson.id, responseJson);
          resolve({ message: 'success', subscriberTrips: response.data });
        } else {
          reject({ message: response.data.message ? response.data.message : 'Something is wrong from server' });
        }                
      },
      error => {reject({message: 'error'})}
    ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    
  });  
};

export const api_subscribe_request = (token: string, tripId:number, 
  passengerStartLocationObject: Location, passengerdestinationLocationObject: Location, passengerCount: number, daysInCronFormat: string) :Promise<any | Object>=> {
    return new Promise((resolve, reject) => {
    let url = '/trip/subscribe/request';

    if (tripId && passengerStartLocationObject && passengerdestinationLocationObject && passengerCount && daysInCronFormat) {
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
            startLat: passengerStartLocationObject.latitude,
            startLon: passengerStartLocationObject.longitude,
            destLat: passengerdestinationLocationObject.latitude,
            destLon: passengerdestinationLocationObject.longitude,
            passengerCount: passengerCount,
            days: daysInCronFormat,
            tripId: tripId,
        },
      })
      .then(
        response => {
          let responseJson: boolean = response.data;

          if (responseJson) {
            //this.subscriberTrips.set(responseJson.id, responseJson);
            resolve({ message: 'success', data: responseJson });
          } else {
            reject({ message: response.data.message ? response.data.message : 'Something is wrong from server' });
          }                
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
      }
      else
      {
        reject({message: 'error'})
      }
    });  
};

export const api_subscribe_get_PendingRequest = (token: string ) :Promise<any | Object>=> {
    return new Promise((resolve, reject) => {
    let url = '/trip/subscribe/pendings/trips';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
          isDriver: false,
        },
      })
      .then(
        response => {
          let responseJson = response.data;

          if (responseJson) {
            // this.pendingTrips.clear(); and later set to pendingTrips
            resolve({ message: 'success', pendingTrips: responseJson });
          } else {
            reject({ message: response.data.message ? response.data.message : 'Something is wrong from server' });
          }                
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
      
    });  
};
