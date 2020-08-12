import httpClient from './httpClient'
import { AxiosResponse } from 'axios';
import constants from '../constants';

const _key =__DEV__ ? constants.Network.DEV_Network.GOOGLE_API_KEY : constants.Network.PRD_Network.GOOGLE_API_KEY;
        
export interface IResults {
    [x: string]: any;
    data: Object| any ;
}

export const api_google_search = (text: string, currentLocation:{latitude: string, longitude:string}, currentLocationName:string, defaultValue:string  ) :Promise<AxiosResponse<IResults>> => {    
    console.log('google api called  '+ text)
    if (text) {
        let url:string='';    
        if (currentLocationName === defaultValue) {
          url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=` + text + 
          `&radius=1000&key=` + _key +
          `&language=en`;
        } else {
          url =`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=` +
            text +
            `&location=` +
            currentLocation.latitude +
            `,` +
            currentLocation.longitude +
            `&radius=1000&key=` +
            _key +
            `&language=en`;
        }
        //console.log(httpClient.defaults.headers);        
        return httpClient.get(url);
    }
    else {         
     return Promise.reject({ message: 'Fields can not be empty'});
    }
}

export const api_google_lookupPlaceById = (place_id: string):Promise<AxiosResponse<IResults>> => {  
  return httpClient.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + place_id + '&key=' + _key);  
}

export const api_google_lookupPlaceByLatLng = (lat: number, lng:number):Promise<AxiosResponse<IResults>> => {  
  let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key='+_key+'&language=en';
  return httpClient.get(url);  
}
