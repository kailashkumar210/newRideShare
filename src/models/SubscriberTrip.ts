import User from './User';
import Trip from './Trip';
import LocationConst from '../constants'

import type { Location } from './types';


export default class SubscriberTrip {
    id: number = 0;
    startTime: number = 0;
    endTime: number = 0;
    startLocation : Location = { latitude: LocationConst.LocationConst.latitude, longitude: LocationConst.LocationConst.longitude};
    destinationLocation : Location = { latitude: LocationConst.LocationConst.latitude, longitude: LocationConst.LocationConst.longitude};
    trip: Trip = new Trip();
    subscriber : User = new User();
    passengerCount: number = 0;
    days: string = '';
    active: boolean = false;
    capacity: number= 1;
}