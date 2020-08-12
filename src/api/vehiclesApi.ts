import Vehicle from "../models/Vehicle";
import httpClient from './httpClient'
import { AxiosResponse } from 'axios';
import { store } from "src/redux/configureStore";

export interface IVehicles {
    defaultVehicle: Vehicle,
    vehicles : Array<Vehicle>,
}

export interface IVehiclesResponse {
    data: IVehicles
}

export interface IVehicleResponse {
    data: Vehicle
}

export interface IVehicleRemoveResponse {
    message: string
}

export const api_vehicles_Get = (token:string) :Promise<AxiosResponse<IVehiclesResponse>> => {  
    if (token !== undefined && token !== null) {         
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.get('/vehicle');
    }
    else {         
     return Promise.reject({ message: 'token is empty'});
    }
}

export const api_vehicles_Add = (token:string, newVehicle: Vehicle) :Promise<AxiosResponse<IVehicleResponse>> => {  
    //console.log(newVehicle);
    //console.log('token: ');
    //console.log(token);
    if (token !== undefined && token !== null && token !== '' && newVehicle &&  newVehicle.model && newVehicle.color && newVehicle.plate && newVehicle.capacity && newVehicle.type) {         
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        httpClient.defaults.headers['Content-Type'] = 'application/json';
        console.log('updating item : ' + newVehicle.id)
        let _vehicleInfo:any = {
            model: newVehicle.model,
            color: newVehicle.color,
            plate: newVehicle.plate,
            capacity: newVehicle.capacity,
            type: newVehicle.type,            
        }
        _vehicleInfo =newVehicle.id > 0 ? {..._vehicleInfo, id: newVehicle.id} : _vehicleInfo;
        console.log(_vehicleInfo);
        return httpClient.post('/vehicle', _vehicleInfo);
    }
    else {   
       // console.log('either token or vehicle are not valid')      
     return Promise.reject({ message: 'Adding Vehicle issue, either the token is empty or the vehicle does not have every mandatory field.'});
    }
}


export const api_vehicles_Remove = (token:string, id: number) :Promise<AxiosResponse<IVehicleRemoveResponse>> => {  
    if (token !== undefined && token !== null && id > 0) {         
            httpClient.defaults.headers['Access-Control-Allow-Origin']= '*';
            httpClient.defaults.headers['Content-Type']= 'application/json';
            httpClient.defaults.method='DELETE';            
            httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.delete(`/vehicle/${id}`, {
            method: 'DELETE',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            withCredentials: true,            
          });
    }
    else {         
     return Promise.reject({ message: 'Adding Vehicle issue, either the token is empty or the vehicle does not have every mandatory field.'});
    }
}