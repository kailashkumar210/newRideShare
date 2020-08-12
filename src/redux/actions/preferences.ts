import { ACTIONS_VEHICLE, ACTIONS_APP, ACTIONS_PREFERENCES } from './types';
import { store } from '../configureStore';
import { IPreferencesState } from '../reducers/preferencesReducer';
import { Location } from '../../models/types';

/*
export interface IPreferencesState {
  LocationHistory: LocationList;
  isDriver: boolean;
  currentLocale: string; // 'en-US'
  timeRange: number; //7200 === 2hrs
  startRange: number; // 2000 == 2 km
  destRange: number; // 2000 == 2 km
}
*/

export const clear_locationHistory = async (): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    //console.log('through the action - clearLocH')
    store.dispatch({type: ACTIONS_PREFERENCES.PREF_LOCATION_HISTORY, payload: { LocationHistory:[] }});
    resolve({message: 'success'});
  });
}

export const set_preferences = async (newPreferences:IPreferencesState): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    //console.log('through the action - clearLocH')
    store.dispatch({type: ACTIONS_PREFERENCES.PREF_SET_PREFERENCES, payload: {preferences:newPreferences}});
    resolve({message: 'success'});
  });
}

export const add_locationToHistory = async (newLocation:Location): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    //console.log('through the action - clearLocH')
    store.dispatch({type: ACTIONS_PREFERENCES.PREF_LOCATION_ADD, payload: {location: newLocation}});
    resolve({message: 'success'});
  });
}