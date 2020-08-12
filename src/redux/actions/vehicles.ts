import { ACTIONS_VEHICLE, ACTIONS_APP } from './types';
import { store } from '../configureStore';
import { api_vehicles_Add,  api_vehicles_Remove, api_vehicles_Get } from '../../api/vehiclesApi';
import Vehicle from '../../models/Vehicle';


export const get_vehicles = async (token: string, defaultVehicleId: number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    console.log('through the action - Vehicle')
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    
    api_vehicles_Get(token).then( response => {
      const vehiclesJson: Array<Vehicle>| any = response !== undefined && response.data !== undefined ? response.data : {};
            console.log('Got the list of vehicles remotely');
            //console.log(response);

          if (vehiclesJson) {
            let _vehicles: Array<Vehicle>= [];
              vehiclesJson.map((v:Vehicle) => {
                //console.log(v);
                _vehicles.push(v);
                if (defaultVehicleId == 0){
                  defaultVehicleId=v.id;
                }                
                //Info coming from request
                /*  capacity: 4
                color: "gray"
                id: 109
                model: "Nissan Qashqai"
                plate: "Ldg"
                type: "car" */
            });
            store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_GET, payload:{ vehicles: _vehicles, defaultVehicle: defaultVehicleId} });    
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            resolve({ message: 'success' });
          }
          else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: 'Something is wrong with input data' });
          }
    }).catch(error => {
      console.log('From Vehicle Get Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}

export const add_vehicle = async (token: string, defaultVehicleId: number, vehicle2add: Vehicle): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    //console.log('through the action - Vehicle')
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    //console.log('calling api');
    api_vehicles_Add(token, vehicle2add).then( response => {
      //console.log('Service Returned from Vehicls');
      let responseJson: Vehicle | any = response.data;
          if (responseJson.id) {
        //    console.log('selected Default Vehicle: '+defaultVehicleId);
            let _isDefault:boolean = false;
            if (defaultVehicleId == responseJson.id || defaultVehicleId == 0) {
              //set the first vehicle as default automatically
              _isDefault= true;
            }
            store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_ADD, payload:{ vehicle: responseJson, isDefaultVehicle: _isDefault } });    
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            
            //this.vehicles.set(responseJson.id, responseJson);
            resolve({ message: 'success' });
          }
          else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: 'Something is wrong with input data' });
          }
    }).catch(error => {
      console.log('From Vehicle Add Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server." });
    });
  });
}


export const delete_vehicle = async (token: string, id2Remove: number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    //console.log('through the action - Vehicle delete')
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    api_vehicles_Remove(token, id2Remove).then( response => {
      //console.log('got from server');
      //console.log(response.data)
      let responseJson: string | any = response.data;
          if (responseJson.message == 'success') {
            store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_DELETE, payload:{ vehicleId2Remove: id2Remove } });    
            //this.vehicles.set(responseJson.id, responseJson);
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });            
            resolve({ message: 'success' });
          }
          else {
            store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } }); 
            reject({ message: 'Delete operation was denied by server' });
          }
    }).catch(error => {
      console.log('From Vehicle Add Exception: '+error);
      store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
      reject({ message: "Couldn't connect to server. Removing vehicle" });
    });
  });
}

export const set_favorite = async (id2SetAsDefault: number): Promise<any | Object> => {
  return new Promise((resolve, reject) => {
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: true } });    
    store.dispatch({type: ACTIONS_VEHICLE.VEHICLES_SET_DEFAULT, payload:{ defaultVehicleId: id2SetAsDefault } }); 
    store.dispatch({type: ACTIONS_APP.APP_SET_ISLOADING, payload:{ isLoading: false } });    
    resolve({message: 'success'});
  });
}