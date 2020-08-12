import { ACTIONS_NEWTRIP } from '../actions/types';
import { Location } from '../../models/types';

export interface INewTripState {        
    completed: boolean;
    startLocation: Location;
    destinationLocation: Location;
    routePoints: Location[];
}

const _defaultNewTrip ={
    completed: false,
    startLocation: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
        title:'',
    },
    destinationLocation: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
        title:'',
    },
    routePoints: []
    }

    //UPDATE_STARTLOCATION: 'UPDATE_STARTLOCATION',
    //UPDATE_DESTINATIONLOCATION: 'UPDATE_DESTINATIONLOCATION',
    //SET_COMPLETED: 'SET_COMPLETED',
    //UPDATE_ROUTEPOINTS: 'UPDATE_ROUTEPOINTS'


export default function newTripReducer( state: INewTripState = _defaultNewTrip,
                                        action: { type: string; payload: string | Location | Array<Location> | object | undefined | any },
): INewTripState {
switch (action.type) {
    case ACTIONS_NEWTRIP.UPDATE_STARTLOCATION:
        console.log(action.type)
    return {
        ...state,
        startLocation: action.payload.startLocation,
    };
    case ACTIONS_NEWTRIP.UPDATE_DESTINATIONLOCATION:
        console.log(action.type)
    return {
        ...state,
        destinationLocation: action.payload.destinationLocation,
    };
    case ACTIONS_NEWTRIP.UPDATE_ROUTEPOINTS:
        console.log(action.type)
    return {
        ...state,
        routePoints: action.payload.routePoints,
    };
    case ACTIONS_NEWTRIP.SET_COMPLETED:
        console.log(action.type)
    return {
        ...state,
        completed: true,
    };
    case ACTIONS_NEWTRIP.CLEAR_NEWTRIP:
        console.log(action.type)
    return {
        ...state,
        destinationLocation: _defaultNewTrip.destinationLocation,
        startLocation: _defaultNewTrip.startLocation,
        completed: _defaultNewTrip.completed,
        routePoints: _defaultNewTrip.routePoints
    };    
    default:
        return {...state}  
    }
};