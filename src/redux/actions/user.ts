import { ACTIONS_USER, ACTIONS_VEHICLE, ACTIONS_APP, ACTIONS_PREFERENCES } from './types';
import { store } from '../configureStore';
import { api_vehicles_Get } from '../../api/vehiclesApi';
import { api_user_login, api_user_Get_Profile, api_user_Reset_Password, api_user_Register, api_FireBaseToken_Update, api_FireBaseToken_Delete, api_user_UpdateProfile, api_user_ChangePassword, IProfile, IProfileData } from '../../api/userApi';
import User from '../../models/User';
import Organization from '../../models/Organization';
import Vehicle from '../../models/Vehicle';
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-community/async-storage';
import { api_potential_ride } from 'src/api/tripApi';

var Base64 = require('base-64');


export const login_Action = async (username: string, password: string, isdriver: boolean): Promise<any | Object>  => {
    return new Promise((resolve, reject) => {
        
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });
        password = Base64.encode(password.replace(' ',''));
            
        // Call user api to check validity
        api_user_login(username, password).then(async (response)=> {
            let responseJson = response.data;
            
            if (responseJson.token) {
                store.dispatch({type: ACTIONS_APP.APP_SET_AUTHORIZED, payload: { authorized: true }})                
                store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_CLEAR });
                
                const getUserProfile = await api_user_Get_Profile(responseJson.token);
                const getVehiclesRemote = await api_vehicles_Get(responseJson.token);
                
                const profileJson: any = getUserProfile !== undefined && getUserProfile.data !== undefined ? getUserProfile.data : {};
                const vehiclesJson: any = getVehiclesRemote !== undefined && getVehiclesRemote.data !== undefined ? getVehiclesRemote.data : {};
                let _profile = new User();
                let _vehicles = Array<Vehicle>();
                if (profileJson)
                {
                    _profile.username = username;
                    _profile.password = password;
                    _profile.name = profileJson.name;
                    _profile.email = profileJson.email;
                    _profile.authtype = profileJson.authtype;
                    _profile.id = profileJson.id;
                    _profile.phone = profileJson.phone;
                    _profile.role = profileJson.role;
                    _profile.photo = profileJson.photo;
                    _profile.organization = profileJson.organization ? profileJson.organization : new Organization();
                    _profile.isDriver = isdriver ? 1 : 0;
                    _profile.token = responseJson.token;
                    // update the status with information
                    store.dispatch({type: ACTIONS_USER.USER_LOGIN, payload: _profile}); 
                    store.dispatch({type: ACTIONS_PREFERENCES.PREF_SET_DRIVER, payload: { isDriver: _profile.isDriver }})
                    analytics().setUserId( profileJson.email);           
                }
                
                if (vehiclesJson) {
                    vehiclesJson.map((v:Vehicle) => {
                        //console.log(v);
                        _vehicles.push(v);
                        //Info coming from request
                        /*  capacity: 4
                        color: "gray"
                        id: 109
                        model: "Nissan Qashqai"
                        plate: "Ldg"
                        type: "car" */
                    });
                    store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_GET , payload: {vehicles: _vehicles}});
                } 
                resolve({ message: 'success'});          
            } 
            else {
             reject({ message: 'Something is wrong with your credentials' });
            }
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
            },
            error => {
            console.log('From API Login: ' +error);
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
            reject({ message: error.response ? error.response.status : "Couldn't reach server!" });
            }
        )
        .catch(error => {
            console.log('From Exception: '+error);
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
            reject({ message: "Couldn't connect to server." });
        });
    });
}

export const reset_Password_Action = async (email: string): Promise<any | Object>  => {
    return new Promise((resolve, reject) => {
        store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });
        email = Base64.encode(email.replace(' ',''));
            
        // Call user api to check validity
        api_user_Reset_Password(email).then(async (response)=> {
            console.log("Reset Password response ",response);
            let responseJson = response.status;
            if (responseJson == 200) {                
                resolve({ message: 'success'});          
            } 
            else {
             reject({ message: 'Something is wrong' });
            }
                store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
            },
            error => {
                console.log('From API reset pass: ' +error);
                console.log(error);
                store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
                reject({ message: error.response ? error.response.status : "Couldn't reach server!" });
            }
        )
        .catch(error => {
            console.log('From Exception: '+error);
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
            reject({ message: "Couldn't connect to server." });
        });
    });
}


export const updateProfile = async (token:string, photo:any, userProfile: User) : Promise<any | Object>  => {
   
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });

    console.log('User profile', userProfile.phone, photo);
    return new Promise((resolve, reject) => {
        
        api_user_UpdateProfile(token, userProfile, photo).then(async (response) => {
            let userJson: IProfileData | any = response.data;

            if (userJson) {
                console.log(userJson);
                resolve({ message: 'success' });
                store.dispatch({
                    type: ACTIONS_USER.USER_UPDATE_PROFILE,
                    payload: {userProfile: {...userProfile, photo: userJson.photo}}
                });
                store.dispatch({
                    type: ACTIONS_APP.APP_SET_ISLOADING,
                    payload:{ isLoading: false } 
                })
            } else {
                console.log('Something is wrong')
                reject({ message: 'Something is wrong' });
                store.dispatch({
                    type: ACTIONS_APP.APP_SET_ISLOADING,
                    payload:{ isLoading: false } 
                })
            }
        })
        .catch(error => {
            store.dispatch({
                type: ACTIONS_APP.APP_SET_ISLOADING,
                payload:{ isLoading: false } 
            })
            console.log('profile action');
            console.log(error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        });
    });
}

export const changePassword = (token:string, newPassword: string) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });

    console.log('updatePass', newPassword);
    return new Promise((resolve, reject) => {
        newPassword = Base64.encode(newPassword.replace(' ',''));
        api_user_ChangePassword(token, newPassword).then(async (response) => {
            let userJson = response.data;
            if (userJson) {
                console.log(userJson);
                store.dispatch({
                    type: ACTIONS_USER.USER_CHANGE_PASSWORD,
                    payload: { password: newPassword}
                })
                resolve({ message: 'success' });
                
            } else {
                console.log('Something is wrong')
                store.dispatch({
                    type: ACTIONS_APP.APP_SET_ISLOADING,
                    payload:{ isLoading: false } 
                })
                reject({ message: 'Something is wrong' });
                
            }
        })
        .catch(error => {
            console.log('register action');
            console.log(error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        });
        
    });
}



export const get_Profile_remote = async (token:string) : Promise<any|Object> => {
    return new Promise((resolve, reject)=>{
        api_user_Get_Profile(token).then((response)=>{
            resolve({message:'success', data: response});
        })
        .catch((error)=>{
            reject({message:error});
        })
    });
}


export const logout = () : Promise<any | Object> => {
    return new Promise((resolve) => {
      console.log('pending logout commented lines');
      //this.deleteFirebaseToken();
      //delete httpInterceptor.defaults.headers.common['Authorization'];
      
      AsyncStorage.clear();
      store.dispatch({ type: ACTIONS_USER.USER_LOGOUT });
      store.dispatch({ type: ACTIONS_APP.APP_SET_AUTHORIZED, payload:{ authorized:false }})
      store.dispatch({ type: ACTIONS_VEHICLE.VEHICLES_CLEAR});
      store.dispatch({ type: ACTIONS_PREFERENCES.PREF_LOCATION_HISTORY, payload: { LocationHistory: [] }});
      
      //Trip.Trips.clear();
      //Trip.upcomingTrip = new models.Trip();
      //Trip.hasUpcomingTrip = false;
      
      resolve();
    });
}

export const register = async (newUser:User) : Promise<any | Object>  => {
    return new Promise((resolve, reject) => {
        newUser.password = Base64.encode(newUser.password.replace(' ',''));

        api_user_Register(newUser).then(async (response) => {
            let userJson = response.data;
            if (userJson) {
                console.log(userJson);
                resolve({ message: 'success' });
            } else {
                reject({ message: userJson.message ? userJson.message : 'Something is wrong' });
            }
        })
        .catch(error => {
            console.log('register action');
            console.log(error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            reject({ message: error.response ? error.response.data.message : "Couldn't reach server!" });
        });
    });
}

export const updateFireBaseToken = async (token:string, firebaseToken:string) : Promise<any|Object> => {
    return new Promise((resolve, reject)=>{
        api_FireBaseToken_Update(token, firebaseToken).then((response)=>{
            store.dispatch({type: ACTIONS_USER.SET_FIREBASETOKEN, payload:{firebaseToken: firebaseToken}});
            resolve({message:'success'});
        })
        .catch((error)=>{
            reject({message:error});
        })
    });
}

export const deleteFireBaseToken = async (token:string) : Promise<any|Object> => {
    return new Promise((resolve, reject)=>{
        api_FireBaseToken_Delete(token).then((response)=>{
            store.dispatch({type: ACTIONS_USER.SET_FIREBASETOKEN, payload:{firebaseToken: ''}});
            resolve({message:'success'});
        })
        .catch((error)=>{
            reject({message:error});
        })
    });
}