import httpClient from './httpClient'
import { AxiosResponse } from 'axios';
import User from '../models/User';
import { Platform } from 'react-native';

export interface ILogin {
    token: string;
}
export interface IProfileData {
    authtype: number;
    deviceAddress: string;
    email: string;
    id: number;
    name: string;
    organization: object;//{id: 19, name: "UNGSC Valencia", code: "UNGSC Valencia", visible: true}
    phone: string;
    role: string;
    username: string;
    photo: string;
}

export interface IProfile {
    data: IProfileData
}

export const api_user_login = (username:string, password: string ) :Promise<AxiosResponse<ILogin>> => {    
    console.log('api called  '+ username)
    if (username && password) {
        username = username.replace(' ', '');
        username = username.toLocaleLowerCase();
        password = password.replace(' ', '');
  
        delete httpClient.defaults.headers.common['Authorization'];
        console.log('request triggered  ')
        console.log(httpClient.defaults.headers);
        return httpClient.post(`/authentication?username=${username}&password=${password}`);
    }
    else {         
     return Promise.reject({ message: 'Fields can not be empty'});
    }
}

export const api_user_Get_Profile = (token:string) :Promise<AxiosResponse<IProfile>> => {    
    //console.log(token)  
    if (token !== undefined && token !== null) {      
        httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.get('/user');
    }
    else 
    {         
        return Promise.reject({ message: 'token is empty, relogin'});
    }
}

export const api_user_Reset_Password = (email:string) :Promise<AxiosResponse<IProfile>> => {    
    if (email !== undefined && email !== null) {      
        //httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.get('/user/reset/' + email)
    }
    else 
    {         
        return Promise.reject({ message: 'email is empty, invalid'});
    }
}

export const api_user_Register = (newUser:User) :Promise<AxiosResponse<IProfile>> => {    
    console.log('api called  '+ newUser.username)
    if (newUser.username && newUser.password && newUser.name && newUser.phone && newUser.email && newUser.organization) {
        newUser.username = newUser.username.replace(' ', '').toLocaleLowerCase();
        newUser.password = newUser.password.replace(' ', '');
  
        delete httpClient.defaults.headers.common['Authorization'];
        let data = new FormData();
        data.append('email', newUser.email);
        data.append('phone', newUser.phone);
        data.append('name', newUser.name);
        data.append('org', newUser.organization.code);
        data.append('password', newUser.password);

        if (newUser.photo) data.append('photo', newUser.photo);

        const config = {
          headers: { 'content-type': 'multipart/form-data' },
        };
        return httpClient.post('/user/create', data, config)
    }
    else 
    {         
        return Promise.reject({ message: 'values are empty in fields or invalid'});
    }
}

export const api_user_UpdateProfile = (token: string, updateUser:User, photo:any) :Promise<AxiosResponse<IProfile>> => {    
    console.log('api called  '+ updateUser.username)

    if (updateUser.username && updateUser.phone) {
        updateUser.username = updateUser.username.replace(' ', '').toLocaleLowerCase();
        
        let data = new FormData();
        data.append('email', updateUser.username);
        if (updateUser.phone) data.append('phone', updateUser.phone);
        if (photo && photo.type) data.append('photo', {
            name: photo.uri.split('/').pop(),
            type: photo.type,
            uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        });
        
        const config = {
           headers: { 
            'content-type': 'multipart/form-data;',
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'Accept': 'application/json'
            },
          };
        //httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.post('/user/update', data, config)
    }
    else 
    {         
        return Promise.reject({ message: 'values are empty in fields or invalid'});
    }  
}

export const api_user_ChangePassword = (token: string, newPassword:string) :Promise<AxiosResponse<IProfile>> => {    
    
    if (newPassword) {
        
        let data = new FormData();
        data.append('password', newPassword);
        
        const config = {
           headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'},
        };
        //httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
        return httpClient.post('/user/password', data, config)
    }
    else 
    {         
        return Promise.reject({ message: 'Unable to update Password'});
    }
}

export const api_FireBaseToken_Update = (token: string, firebaseToken: string) :Promise<void> => {
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    return httpClient.get('/user/device', {
        params: {
          address: firebaseToken,
        },
      })
      .then(
        response => {
          //console.log(response);
          //console.log('Firebase token updated.');
        },
        error => console.log(error)
      );
}

export const api_FireBaseToken_Delete = (token: string) :Promise<void> => {
    httpClient.defaults.headers['Authorization'] = 'Bearer ' + token;
    return httpClient.get('/user/deregister-device')
      .then(
        response => {
          console.log(response);
          console.log('Firebase token Deleted.');
        },
        error => console.log(error)
      );
}