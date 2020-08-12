import { combineReducers } from 'redux'
import counter from './counterReducer'
import authReducer from './authReducer'
import vehiclesReducer from './vehiclesReducer'
import appReducer from './appReducer'
import preferences from './preferencesReducer'
import tripsReducer from './tripsReducer';
import subscriberReducer from './subscriberReducer'
import newTripReducer from './newTrip';

export default combineReducers({
  counter : counter,
  authReducer : authReducer,
  vehicles : vehiclesReducer,
  appReducer: appReducer,
  preferences: preferences,
  trips: tripsReducer,
  subscriber: subscriberReducer,
  newTrip: newTripReducer,
})
