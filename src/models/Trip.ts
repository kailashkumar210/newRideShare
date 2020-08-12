import type { Location, LocationList, Days } from './types';
import User from './User';
import Vehicle from './Vehicle';

export default class Trip {
    public id: number;
    public routePoints: LocationList = [];
    public startTime: number = 0;
    public user: User= new User();
    public vehicle: Vehicle = new Vehicle();
    public weekly: boolean= false;
    public days: Object= {};
    public active : boolean= false;
    public ongoing: boolean= false;
    public daysCronString: string = ''
    public note: string ='';
    
    constructor(){
        this.id=0;
    }
}