import httpClient from './httpClient'
import { AxiosResponse } from 'axios';

export interface INotificationResponse {
    data: Array<Object>;
    message: string;
}

export const api_notifications_Get = (isDriver:boolean, token: string) :Promise<AxiosResponse<INotificationResponse>> => {  
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        
    return httpClient.get(`/notification`, {
        params: {
          isDriver: isDriver,
        },
      });
}