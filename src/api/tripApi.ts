import httpClient from './httpClient'
import { AxiosResponse } from 'axios';
import { Location } from '../models/types';
import Vehicle from '../models/Vehicle';
import moment from 'moment';
import Trip from '../models/Trip';
import SubscriberTrip from '../models/SubscriberTrip';
import SearchedTrip from '../models/SearchedTrip';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

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

export const api_organizations_Get = () :Promise<AxiosResponse<ICommunityResponse>> => {  
    return httpClient.get('/trip/organizations');    
}

export const api_trip_add = (token: string, startTime: number, weekly: boolean, days: Object, capacity: number, routePoints: Array<Location>, vehicle: Vehicle, note: string):Promise<any | Object> => {
    return new Promise((resolve, reject) => {
        if (startTime && routePoints && vehicle) {
            if (!weekly && moment(startTime).isBefore(moment())) {
              reject({ message: 'Selected time is in past' });
              return;
            }
    
            console.log(note);
            // WARNING DAYS was type Days and I changed to Object 
            let tripObject;    
            if (weekly) {
              tripObject = {
                startTime: startTime,
                weekly: weekly,
                days: days,
                routePoints: routePoints,
                vehicle: vehicle,
                note: note,
              };
            } else {
              tripObject = {
                startTime: startTime,
                weekly: weekly,
                capacity: capacity,
                routePoints: routePoints,
                vehicle: vehicle,
                note: note,
              };
            }
    
            httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
            httpClient.defaults.headers['Content-Type'] = 'application/json';
            httpClient.post('/trip/create', tripObject)
              .then(response => {

                let responseJson = response.data;    
                if (responseJson.id) {
                  // this.Trips.set(responseJson.id, responseJson);
                  resolve({ message: 'success', tripId: responseJson.id, data: responseJson });
                } else {
                  reject({ message: responseJson.message ? responseJson.message : 'Something is wrong with your input' });
                }
              })
              .catch(error => {
                reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
              });
          } else {
            reject({ message: 'Something is wrong with input data' });
          }
    })
}

export const api_trip_update = (token: string, startTime: number, tripId: number):Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      if (startTime && tripId) {
        let tripObject = {
          id: tripId,
          startTime: startTime,
        };

        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient.defaults.headers['Content-Type'] = 'application/json';
            
        httpClient
          .post('/trip/update', tripObject)
          .then(response => {
            let responseJson = response.data;

            if (responseJson.id) {
              // to handle in the reducer
              // this.Trips.set(responseJson.id, responseJson);
              resolve({ message: 'success', tripId: responseJson.id, data: responseJson  });
            } else {
              reject({ message: responseJson.message ? responseJson.message : 'Something is wrong with your input' });
            }
          })
          .catch(error => {
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
          });
      } else {
        reject({ message: 'Something is wrong with input data' });
      }
    });
};

export const api_trip_getRemote = (token: string):Promise<any | Object> => {
    return new Promise((resolve, reject) => {
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient
        .get('/trip')
        .then(response => {
          //console.log(response);
          let responseJson = response.data;

          if (!responseJson.message) {
            // to be done in the Reducer
            //this.Trips.clear();
            //for (let TripJson of responseJson) {
            //  this.Trips.set(TripJson.id, TripJson);
            //}
            resolve({ message: 'success', trips: responseJson });
          } else {
            reject({ message: responseJson.message });
          }
        })
        .catch(error => {
          reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        });
    });
};

export const api_getPendingTrips = (token: string, isDriver: boolean) :Promise<any | Object>=> {
    return new Promise((resolve, reject) => {
    let url = '/trip/subscribe/pendings';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
          isDriver: isDriver,
        },
      })
      .then(
        response => {
          let responseJson = response.data;
          if (!responseJson.message) {
            // this.pendingTrips = responseJson;
            resolve({ message: 'success', pendingTrips: responseJson });
          }          
        },
        error => console.log(error)
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_getPendingTripRequest = (token: string, isDriver: boolean) :Promise<any | Object>=> {
 console.log('PendingTripRequest ',isDriver)
  return new Promise((resolve, reject) => {
  let url = '/trip/subscribe/pendings';

  httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
  httpClient
    .get(url, {
      params: {
        isDriver: isDriver,
      },
    })
    .then(
      response => {
        console.log('Pending Trip Request response ',response.data )
        let responseJson = response.data;
        if (!responseJson.message) {
          // this.pendingTrips = responseJson;
          resolve({ message: 'success', pendingTrips: responseJson });
        }          
      },
      error => console.log("Pendint Trip Error", error)
    ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
  });
};

export const api_trip_cancelPendingRequest = (token: string, tripId: number):Promise<any | Object> => {
    return new Promise((resolve, reject) => {
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient
        .get('/trip/subscribe/pendings/cancel', {
            params: {
              tripId: tripId,
            },
        })
        .then(response => {
          console.log('Cancel request for trip ', response);
          let responseJson = response.data;

          if (!responseJson.message) {
            // to be done in the Reducer
            //this.Trips.clear();
            //for (let TripJson of responseJson) {
            //  this.Trips.set(TripJson.id, TripJson);
            //}
            resolve({ message: 'success', data: responseJson });
          } else {
            reject({ message: responseJson.message });
          }
        })
        .catch(error => {
          console.log('dhh',error.message)
          Toast.showWithGravity(error.message, Toast.LONG, Toast.BOTTOM);
          reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        });
    });
};

export const api_trip_getUpcomingTrip = (token: string, isDriver: boolean) :Promise<any | Object>=> {
    return new Promise((resolve, reject) => {
    let url = '/trip/upcomingfordriver';

    if (!isDriver) {
        url = '/trip/upcomingforpassenger';
    }

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url)
      .then(
        response => {
          let responseJson = response.data;
          if (!responseJson.message && responseJson) {
            /*
            if (!responseJson.message && responseJson) {
                if (!isDriver) {
                  this.upcomingSubscriberTrip = responseJson;
                  this.upcomingTrip = this.upcomingSubscriberTrip.trip;
                } else {
                  this.upcomingTrip = responseJson;
                }
                this.hasUpcomingTrip = true;
              } else {
                this.upcomingTrip = new models.Trip();
                this.upcomingSubscriberTrip = new models.SubscriberTrip();
                this.hasUpcomingTrip = false;
              }
              return this.hasUpcomingTrip;*/
              if (!isDriver){
                resolve({ message: 'success', upcomingSubscriberTrip: responseJson, upcomingTrip: responseJson.trip, hasUpcomingTrip:true });
              }
              else
              {
                resolve({ message: 'success', upcomingSubscriberTrip: new SubscriberTrip(), upcomingTrip: responseJson, hasUpcomingTrip: true });              
              }
          }  
          else {
            resolve({ message: 'success', upcomingSubscriberTrip: new SubscriberTrip(), upcomingTrip: new Trip(), hasUpcomingTrip: false});              
          }        
        },
        error => console.log(error)
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_postDriverLocation = (token: string, tripId:number, latitude: number, longitude: number) :Promise<any | Object>=> {
    return new Promise((resolve, reject) => {
    let url = '/trip/updatelocation';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
            tripId: tripId,
            latitude: latitude,
            longitude: longitude,
          },
      })
      .then(
        response => {
          console.log('posted successfully')
          //console.log(response);
            resolve({ message: 'success'});                    
        },
        error => {
          console.log('error post driverLoc api')
          console.log(error);
          
          reject({message: 'error'})
        }
      ).catch(error => {
        reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        console.log(error);
      });
    });
};

export const api_trip_getDriverLocation = (token: string, tripId:number):Promise<object|any> => {
    return new Promise((resolve, reject) => {
    let url = '/trip/getlocation';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
            tripId: tripId
          },
      })
      .then(
        response => {
          let responseJson = response.data;
          if (responseJson == '') {
            return null;
          }
          let driverLocation: Location = { title: 'Driver', latitude: responseJson.latitude, longitude: responseJson.longitude, latitudeDelta:0 , longitudeDelta:0 };

          return resolve({message: 'success', driverLocation: driverLocation ? driverLocation : null})         
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_startDriving = (token: string, upcomingTripId:number): Promise<object|any> => {
    return new Promise((resolve, reject) => {
    let url = '/trip/start';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
            tripId: upcomingTripId,            
          },
      })
      .then(
        response => {
            let responseJson = response.data;
            if (!responseJson.message && responseJson) {
                resolve({ message: 'success', upcomingTrip: responseJson, ongoing: responseJson.ongoing});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error, ongoing is same as it was'})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_stopDriving = (token: string, upcomingTripId:number): Promise<object|any> => {
    return new Promise((resolve, reject) => {
    let url = '/trip/stop';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url, {
        params: {
            tripId: upcomingTripId,            
          },
      })
      .then(
        response => {
            let responseJson = response.data;
            if (!responseJson.message && responseJson) {
                resolve({ message: 'success', ongoing: responseJson.ongoing});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error, ongoing is same as it was'})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_Delete = (token: string, tripId:number) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = '/trip/'+tripId;

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .delete(url)
      .then(
        response => {
            let responseJson = response.data;
            if (responseJson.message === 'success') {
                //remove the trip from the store list
                resolve({ message: 'success'});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error, ongoing is same as it was'})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_Deactivate = (token: string, tripId:number) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = `/trip/${tripId}/deactivate`;

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url)
      .then(
        response => {
            let responseJson = response.data;
            console.log("Deactivate response",responseJson)
            if (!responseJson.message) {
                //deactivate the trip in the trip's store with an action
                resolve({ message: 'success', data: responseJson});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_Reactivate = (token: string, tripId:number): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = `/trip/${tripId}/reactivate`;

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url)
      .then(
        response => {
            let responseJson = response.data;
            if (!responseJson.message) {
                //reactivate the trip in the trip's store with an action
                resolve({ message: 'success', data: responseJson});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => {reject({message: 'error '+ error})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

// export cosnt api_trip_confirmSubscription = () 
 
export const api_trip_updateNote = (token: string, tripId: number, note: string) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient.defaults.headers['Content-Type'] = 'multipart/form-data';
        
        let data = new FormData();
        data.append('tripId', tripId + '');//to convert to string
        data.append('note', note);
        //console.log('pre Sending the note to server: ',tripId, note)
        httpClient
          .post(`/trip/update_driver_note`, data)
          .then(response => {
            const responseJson = response.status;
            //console.log('what we got: ', response.data);
            if (responseJson== 200) {
              // to handle in the reducer
              // update the note content in the store
              resolve({ message: 'success'});
            } else {
              reject({ message: response.data?.message !== undefined ? response.data.message : 'Something is wrong with your input' });
            }
          })
          .catch(error => {
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
          });      
    });
};

export const api_trip_UpdateNotification = (token: string, searchedTrip: SearchedTrip) :Promise<any | Object> => {
    console.log('token searchedTrip',token,searchedTrip)
    return new Promise((resolve, reject) => {
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient.defaults.headers['Content-type'] = 'multipart/form-data';
        
        let data = new FormData();
        data.append('id', searchedTrip.id + '');
        data.append('notify', searchedTrip.notifyTripAvailable);
       
        httpClient
          .post(`/trip/update_trip_notify`, data)
          .then(response => {
            let responseJson = response.data;
            console.log("Trip notifiy ",response);
            if (response.status == 200) {
              // to handle in the reducer
              // update the note content in the store
              // this.SearchedTrips.get(searchedTrip.id + '').notifyTripAvailable = searchedTrip.notifyTripAvailable;
              resolve({ message: 'success'});
            } else {
              reject({ message: responseJson.message ? responseJson.message : 'Something is wrong with your input' });
            }
          })
          .catch(error => {
            console.log("Error in trip notifiy ")
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
          });      
    });
};

export const api_trip_SearchHistory = (token: string) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = '/trip/search/history';

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url)
      .then(
        response => {
            let responseJson = response.data;
            if (!responseJson.message) {
                //update trip's store with an action
                //this.SearchedTrips.clear();
                //for (let SearchedTripJson of responseJson) {
                //this.SearchedTrips.set(SearchedTripJson.id, SearchedTripJson);
                //}   
                resolve({ message: 'success', SearchedTrips: responseJson});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_RemoveSubscription = (token: string, tripId: number, subscriberId: number) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = `/trip/remove/${tripId}/${subscriberId}`;

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url)
      .then(
        response => {
            let responseJson = response.data;
            console.log("Response of unsubscribe", responseJson);
            if (!responseJson.message) {
                //update trip's store with an action
                resolve({ message: 'success',TripId: tripId, Trip: responseJson});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_trip_AcceptSubscription = (token: string, tripId: number, subscriberId: number, note: string) :Promise<any | Object> => {

  return new Promise((resolve, reject) => {
    let url =  `/trip/subscribe/accept`;
    console.log('Accept Subscripton tripId ',tripId,' Accept Subscription Uid', subscriberId);
    //console.log("Use Note ", token);
    
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient.get(url, {
      params: {
        tripId: tripId,
        userId: subscriberId,
        notes: note,
      },
    }).then(
        response => {
            let responseJson = response.data;
            console.log("Accept ",response);
            if (!responseJson.message) {
              console.log('if _acceptPendingSubsciption in ts in api',response.data)
              //update trip's store with an action
                resolve({ message: 'success', TripId: tripId, Trip: responseJson});  
            } 
            else {
                console.log('else _acceptPendingSubsciption',responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => { console.log("Accept Error ", error); reject({message: 'error'})}
      ).catch(error => {
        console.log('error _acceptPendingSubsciption', error);
        reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" })});
    });
};

export const api_trip_RejectSubscription = (token: string, tripId: number, subscriberId: number, note: string) :Promise<any | Object> => {
    return new Promise((resolve, reject) => {
    let url = `/trip/subscribe/reject`;

    console.log('Reject Subscripton tripId ',tripId, 'Reject Subscription Uid ',subscriberId,'Use Note ', note);

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    httpClient
      .get(url,{
        params: {
          tripId: tripId,
          userId: subscriberId,
          notes: note,
        },
      })
      .then(
        response => {
            let responseJson = response.data;
            if (!responseJson.message) {
                //update trip's store with an action
                resolve({ message: 'success', TripId: tripId, Trip: responseJson});  
            } 
            else {
                console.log(responseJson.message);
                reject({message: 'error '+ responseJson.message})
            }                 
        },
        error => {reject({message: 'error'})}
      ).catch(error => reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" }));
    });
};

export const api_Ride_Get = (token: string) => {  
  if (token !== undefined && token !== null) {         
      httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
      console.log('URL', httpClient.get('/trip/'))
      return httpClient.get('/trip/');
  }
  else {         
   return Promise.reject({ message: 'token is empty'});
  }
}

export const api_ride_detail = (subscribed2TripId:string, token: string) :Promise<any | Object> => {  
  httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
      
  return httpClient.get(`/trip/${subscribed2TripId}/subscribers/${moment().day()}`);
}

export const api_potential_ride = async (token: string,data) => {  
  if (token !== undefined && token !== null) {         
      httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
      console.log('Data ', data);

     let res =  await httpClient.get('/trip/search',{
        params: data
      });

      return res;
  }
  else {         
   return Promise.reject({ message: 'token is empty'});
  }
}

export const api_trip_confirmTrip = async (token, tripId, passengerStartLocationObject, passengerdestinationLocationObject, passengerCount,daysInCronFormat) => {
  // return new Promise((resolve, reject) => {

    console.log("passendgerStart ", token);

    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    let res = await httpClient.get('/trip/subscribe/request',{params: {
            startLat: passengerStartLocationObject.latitude,
            startLon: passengerStartLocationObject.longitude,
            destLat: passengerdestinationLocationObject.latitude,
            destLon: passengerdestinationLocationObject.longitude,
            passengerCount: passengerCount,
            days: daysInCronFormat,
            tripId: tripId
          }});
     return res;     
  // })
}