import { ACTIONS_USER, ACTIONS_VEHICLE } from '../actions/types';
import Vehicle from '../../models/Vehicle';

export interface IVehiclesState {    
    Vehicles: Array<Vehicle>;
    defaultVehicleId : number
}

export default function vehiclesReducer(state: IVehiclesState = {
                                            Vehicles: [],
                                            defaultVehicleId:0  
                                        },
                                action: { type: string; payload: string | undefined | any },
): IVehiclesState {
  switch (action.type) {
    case ACTIONS_VEHICLE.VEHICLES_CLEAR:
      console.log('Vehicle Reducer accessed')
      console.log(action);
      return {
        ...state,
        Vehicles: [],
    };  
    case ACTIONS_VEHICLE.VEHICLES_GET:
      console.log(action);
      console.log(action.payload)
      return {
        ...state,
        Vehicles: action.payload.vehicles,
        defaultVehicleId: action.payload.vehicles.length === 1 ? action.payload.vehicles[0].id : action.payload.defaultVehicle
    }; 
    case ACTIONS_VEHICLE.VEHICLES_ADD:
      console.log(action);
      let _vehicles: Array<Vehicle> = [...state.Vehicles];
      console.log(_vehicles);
      let _isDefault = action.payload.isDefaultVehicle ? action.payload.vehicle.id : state.defaultVehicleId;

      if (_vehicles.length > 0){
        const _foundInArray = _vehicles.findIndex(p=> p.id == action.payload.vehicle.id);
        if (_foundInArray > -1){
          _vehicles[_foundInArray]= action.payload.vehicle;
        }
        else
        {
          _vehicles.push(action.payload.vehicle);
        }      
      }
      else {
        _isDefault = true;
        _vehicles.push(action.payload.vehicle);
      }     
      return {
        ...state,
        Vehicles: _vehicles,
        defaultVehicleId: _isDefault ? action.payload.vehicle.id : state.defaultVehicleId
    }; 
    case ACTIONS_VEHICLE.VEHICLES_SET_DEFAULT:
      return {
        ...state,
        defaultVehicleId: action.payload.defaultVehicleId
    };  
    case ACTIONS_VEHICLE.VEHICLES_DELETE:
      console.log('Action remove vehicle' + action.payload.vehicleId2Remove);
      let _vehiclesD: Array<Vehicle> = [...state.Vehicles];
      console.log('passed the vehiclesD')
      console.log(_vehiclesD);
      let _defaultD:number = state.defaultVehicleId;
      const _index: number =_vehiclesD.findIndex(p=> p.id == action.payload.vehicleId2Remove)
      console.log('found the vehicle to remove');
      console.log(_index);
      _index > -1 ? _vehiclesD.splice(_index,1) : _vehiclesD;
      console.log('removing vehicle');
      console.log(_vehiclesD);
      if (_vehiclesD.length == 0 ){
        _defaultD = 0;
      }
      else if (_vehiclesD.length > 0 && _defaultD == action.payload.vehicleId2Remove)
      {
        _defaultD = _vehiclesD[0].id;
      }

      return {
        ...state,
        Vehicles: _vehiclesD,
        defaultVehicleId: _defaultD
      };
    default:
      return state;
  }
}