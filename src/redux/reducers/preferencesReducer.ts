import typeActions from '../actions/types';
import { LocationList } from 'src/models/types';

export interface IPreferencesState {
  LocationHistory: LocationList;
  isDriver: boolean;
  currentLocale: string; // 'en-US'
  timeRange: number; //7200 === 2hrs
  startRange: number; // 2000 == 2 km
  destRange: number; // 2000 == 2 km
}

export default function preferences(state : IPreferencesState = {
                                            LocationHistory: [],
                                            isDriver: false,
                                            currentLocale: 'en-US',
                                            timeRange: 7200,
                                            startRange: 2000,
                                            destRange: 2000

                                          }, 
                                    action: { type: string; payload: string | undefined | any }): IPreferencesState {
    switch (action.type) {
      case typeActions.ACTIONS_PREFERENCES.PREF_SET_DRIVER:
        return {...state, isDriver: action.payload.isDriver }
      case typeActions.ACTIONS_PREFERENCES.PREF_LOCATION_HISTORY:
        return {...state, LocationHistory: action.payload.LocationHistory }
      case typeActions.ACTIONS_PREFERENCES.PREF_SET_DEST_RANGE:
        return {...state, destRange: action.payload.destRange }
      case typeActions.ACTIONS_PREFERENCES.PREF_SET_TIME_RANGE:
        return {...state, timeRange: action.payload.timeRange }
      case typeActions.ACTIONS_PREFERENCES.PREF_SET_START_RANGE:
        return {...state, startRange: action.payload.startRange }
      case typeActions.ACTIONS_PREFERENCES.PREF_SET_PREFERENCES:
        return {...action.payload.preferences }      
      case typeActions.ACTIONS_PREFERENCES.PREF_LOCATION_ADD:
        // Receive a new location to be added to the History +
        // console.log(action)
        let _locationHistory: LocationList = [...state.LocationHistory];
        //console.log('preferences Reducer');
        //console.log(_locationHistory);
        const _found :number = _locationHistory.findIndex(p=> p.title?.toLocaleLowerCase() === action.payload.location.title.toLocaleLowerCase());
        if (_found <0){
          _locationHistory.push(action.payload.location);
        }
        //console.log(_locationHistory);
        //console.log('added successfully')
        return {...state, LocationHistory: [..._locationHistory ]};     
      default:
        return state
    }
  }