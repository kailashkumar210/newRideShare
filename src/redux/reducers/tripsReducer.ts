import { ACTIONS_TRIPS } from '../actions/types';
import Trip from '../../models/Trip';
import SubscriberTrip from '../../models/SubscriberTrip';
import SearchedTrip from '../../models/SearchedTrip';

export interface ITripState {    
    Trips: Array<Trip>;
    SearchedTrips : Array<SearchedTrip>;
    UpcomingTrip: Trip;
    UpcomingSubscriberTrip: SubscriberTrip;
    HasUpcomingtrip: boolean;
    PendingTrips:Array<Trip>;
    ongoing: boolean;
    RemoteTrip: Array<Trip>;
}

export default function tripsReducer(state: ITripState = {
                                            Trips: [],
                                            SearchedTrips:[],
                                            UpcomingTrip: new Trip(),
                                            UpcomingSubscriberTrip: new SubscriberTrip(),
                                            HasUpcomingtrip: false,
                                            PendingTrips: [],
                                            ongoing: false,
                                            RemoteTrip: []
                                        },
                                action: { type: string; payload: string | Array<Trip> | object | undefined | any },
): ITripState {
  switch (action.type) {
    case ACTIONS_TRIPS.GET_TRIPS:
    case ACTIONS_TRIPS.SET_TRIPS:
            //console.log('trip Reducer accessed', action.payload.Trips)
      return {
        ...state,
        Trips: [...action.payload.Trips.map((value:Trip)=> value)],
    };  
    case ACTIONS_TRIPS.GET_SEARCHEDTRIPLIST:
      return {
        ...state,
        SearchedTrips: [...state.SearchedTrips.map((value)=> value)],
    };
    case ACTIONS_TRIPS.GET_TOP_2_SEARCHEDTRIPS:
      console.log(action);
      return {
        ...state,
        SearchedTrips: [...state.SearchedTrips.reverse().filter((i,index)=> index < 2)],
    }; 
    case ACTIONS_TRIPS.ADD_TRIP:
    case ACTIONS_TRIPS.UPDATE_TRIP:
      console.log(action);
      let _trips: Array<Trip> = [...state.Trips];
      console.log(_trips);
      
      if (_trips.length > 0){
        const _foundInArray = _trips.findIndex(p=> p.id == action.payload.trip.id);
        if (_foundInArray > -1){
            //update
            _trips[_foundInArray]= action.payload.trip;
        }
        else
        {
            //add
            _trips.push(action.payload.trip);
        }      
      }
      else {
          //add
        _trips.push(action.payload.trip);
      }     
      return {
        ...state,
        Trips: _trips        
    }; 
    case ACTIONS_TRIPS.DELETE_TRIP:
      console.log(action.type);
      console.log(action.payload);
      let _tripsD: Array<Trip> = [...state.Trips];
      console.log(_tripsD);
      const _index: number =_tripsD.findIndex(p=> p.id == action.payload.tripId)
      console.log('found the trip to remove');
      console.log(_index);
      _index > -1 ? _tripsD.splice(_index,1) : _tripsD;
      console.log('removing trip');
      console.log(_tripsD);      
      return {
        ...state,
        Trips: [..._tripsD]
    };
    case ACTIONS_TRIPS.SET_PENDINGTRIPS:
            console.log("Action", action.type);
            console.log("Pending Trip Payload ",action.payload.pendingTrips.length);
      return {
        ...state,
        PendingTrips: [...action.payload.pendingTrips.map((value:Trip)=> value)],
    };  
    case ACTIONS_TRIPS.GET_UPCOMINGTRIP:
        console.log(action.type);
        //console.log(action.payload);
        return {
            ...state,
            UpcomingTrip: action.payload.UpcomingTrip,
            UpcomingSubscriberTrip: action.payload.UpcomingSubscriberTrip,
            HasUpcomingtrip: action.payload.hasUpcomingtrip
        }
    case ACTIONS_TRIPS.START_DRIVING:
    case ACTIONS_TRIPS.STOP_DRIVING:
        console.log(action.type);
        //console.log(action.payload);
        return {
            ...state,
            UpcomingTrip: action.payload.UpcomingTrip,  
            ongoing: action.payload.ongoing,            
        } 
    case ACTIONS_TRIPS.DEACTIVATE_TRIP:
    case ACTIONS_TRIPS.REACTIVATE_TRIP:
    case ACTIONS_TRIPS.REMOVE_SUBSCRIPTION:
    case ACTIONS_TRIPS.ACCEPT_SUBSCRIPTION:
    case ACTIONS_TRIPS.REJECT_SUBSCRIPTION:
        console.log("Action ",action.type);
        console.log("Payload ",action.payload);
        //console.log("Reducer Trips",state.Trips);
        let _tripsDea: Array<Trip> = [...state.Trips];
        const _indexD: number =_tripsDea.length > 0 ? _tripsDea.findIndex(p=> p.id == action.payload.tripId) : null;
        if (_indexD > -1){
            _tripsDea[_indexD] = action.payload.Trip;
        }
        return {
            ...state,
            Trips: _tripsDea,            
        }  
    case ACTIONS_TRIPS.UPDATE_NOTE:
        console.log(action.type);
        console.log(action.payload);
        let _tripsUpNote: Array<Trip> = [...state.Trips];
        const _indexUN: number =_tripsUpNote.findIndex(p=> p.id == action.payload.tripId)
        if (_indexUN > -1){
            _tripsUpNote[_indexUN].note= action.payload.Note;
        }
        return {
            ...state,
            Trips: _tripsUpNote,            
        }  
    case ACTIONS_TRIPS.UPDATE_TRIP_NOTIFICATION:
        console.log(action.type);
        console.log(action.payload);

        let _searchedTrips: Array<SearchedTrip> = [...state.SearchedTrips];        
        const _indexST: number =_searchedTrips.findIndex(p=> p.id == action.payload.tripId)
        if (_indexST > -1){
            _searchedTrips[_indexST].notifyTripAvailable= action.payload.notifyTripAvailable;
        }
        return {
            ...state,            
            SearchedTrips: _searchedTrips,            
        }
    case ACTIONS_TRIPS.SET_SEARCHEDTRIPLIST:
        //console.log(action.type);
        //console.log(action.payload);
        return {
            ...state,            
            SearchedTrips: [...action.payload.SearchedTrips],            
        }
    case ACTIONS_TRIPS.SET_UPCOMINGTRIP:
        console.log(action.type);
        //console.log(action.payload);
            return {
                ...state,            
                UpcomingSubscriberTrip: action.payload.upcomingSubscriberTrip,    
                UpcomingTrip: action.payload.upcomingTrip,
                HasUpcomingtrip: action.payload.hasUpcomingTrip     
            }
    case ACTIONS_TRIPS.GET_REMOTE_TRIPS:
        // console.log('remote trips', action.payload.Trips)
        return {
            ...state,
            RemoteTrip: action.payload.Trips
        }          
    default:
      return state;
  }
}