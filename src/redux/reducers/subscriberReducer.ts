import { ACTIONS_SUBSCRIBE } from '../actions/types';
import Trip from '../../models/Trip';
import SubscriberTrip from '../../models/SubscriberTrip';
import PendingTripRequest from '../../models/PendingTripRequest';

export interface ISubscriberState {    
    SubscriberTrips: Array<SubscriberTrip>;
    PendingTripsRequests : Array<PendingTripRequest>;    
}

export default function subscriberReducer(state: ISubscriberState = {
                                            SubscriberTrips: [],
                                            PendingTripsRequests:[],                                           
                                        },
                                action: { type: string; payload: string | Array<SubscriberTrip>| Array<PendingTripRequest> | object | undefined | any },
): ISubscriberState {
  switch (action.type) {
    case ACTIONS_SUBSCRIBE.GET_ISSUBSCRIBED:
        //Not a reducer as this is not updating the state..
        console.log(action.type)    
        const _indexFound = state.SubscriberTrips.findIndex((p)=> p.id = action.payload.tripId);
        const _value:boolean = _indexFound > -1 ? true : false;
        return {...state}
    case ACTIONS_SUBSCRIBE.SET_REMOTESUBSCRIPTIONS:       
    console.log(action.type)    
    return {...state, SubscriberTrips: action.payload.subscriberTrips}        
    case ACTIONS_SUBSCRIBE.SET_PENDINGTRIPSREQUESTS:       
    console.log(action.type)    
            return {...state, PendingTripsRequests: action.payload.pendingTripRequests}        
    case ACTIONS_SUBSCRIBE.SET_SUBSCRIBE:       
    console.log(action.type)    
    let _subscribedtrips: Array<SubscriberTrip> = [...state.SubscriberTrips];
        const _indexFoundSubs = _subscribedtrips.findIndex((p)=> p.id = action.payload.Trip.id);
        if (_indexFoundSubs > -1) { _subscribedtrips[_indexFoundSubs] = action.payload.Trip }
        return {...state, SubscriberTrips: _subscribedtrips}        
    case ACTIONS_SUBSCRIBE.SET_UNSUBSCRIBE:   
        console.log(action.type, action.payload)    
        let _unsubscribedtrips: Array<SubscriberTrip> = [...state.SubscriberTrips];
        const _indexFoundUnSubs = _unsubscribedtrips.findIndex((p)=> p.id = action.payload.Trip.id);
        _indexFoundUnSubs > -1 ? _unsubscribedtrips.splice(_indexFoundUnSubs,1) : _unsubscribedtrips;
        return {...state, SubscriberTrips: _unsubscribedtrips}        
    default: 
      return {...state};
  }
}