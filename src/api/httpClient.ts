import axios, { AxiosRequestConfig } from 'axios';
import { DEV_Network, PRD_Network } from '../constants/Network';
import {logout} from '../redux/actions/user';

// Use the DEV/PRD URL according to the Application version
const baseUrl = __DEV__ ? DEV_Network.API_URL : PRD_Network.API_URL;

const httpClient = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
});

class HttpAddInterceptor {
    dispatch: any;
  
    constructor() {
      // console.log(axios.defaults);

      /**
       * @description intercepts all axios requests (exl errors) to:
       * - Update config to add auth token
       */
      httpClient.interceptors.request.use(
        async config => await this.updateHeaders(config),
      );
  
      /**
       * @description intercepts all axios responses (inc errors) to:
       * - Prevent canceled requests from being treated as errors
       */
      httpClient.interceptors.response.use(
        //async response => await this.refreshTokenOnResponse(response),
        //async error => await this.refreshTokenOnError(error),
        response => {
          // Do something with response data
          return Promise.resolve(response);
        },
        error => {
          console.log('Interceptor got an error', error);
          //console.log(error);
          // Do something with response error
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401){ // && this.mUserStore.authorized) {
              // we can decide either to authenticate or logout
              logout();
              /*
              this.mUserStore.logout();
              let toast = Toast.show('Session expired. You have been logged out ', {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
              });
              */
            }
            return Promise.reject(error.response.status === 401 ? {...error, message: 'Session expired. You have been logged out: '+ error.message} : error);

          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
  
            /*let toast = Toast.show('Network connectivity problem.', {
              duration: Toast.durations.LONG,
              position: Toast.positions.CENTER,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
            });
            */
            return Promise.reject({...error, message: 'Network connectivity problem: ' +error.message});
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);  
            return Promise.reject(error);
          }
        }

      );
    }
  
    
    updateHeaders(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
      // If there is still 2 seconds remaing to expire token make api call otherwise renew token and make the request
      return new Promise(async resolve => {
        //console.log(config.url);
        /*if (config.url.indexOf(ReferenceURL) === -1) {
          const authInfo = await this.renewRefreshToken(2000);
          resolve({
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${authInfo.accessToken}`,
            },
          });
        } 
        else {
          resolve(config);
        }*/
        resolve(config);
        //console.log('updateHeaders')
        //console.log(config);
      });
    }

  /*
    async refreshTokenOnResponse(
      response: AxiosResponse<any>,
    ): Promise<AxiosResponse<any>> {
      // Silently renew token if there is 5 minutes to expire.
      response.config.url.indexOf(ReferenceURL) === -1 && (await this.renewRefreshToken(300000));
      return response;
    }
  
    async refreshTokenOnError(error: AxiosError): Promise<any> {
      if (error.response?.status === 401) {
        error.config.url.indexOf(ReferenceURL) === -1 &&
          (await this.renewRefreshToken(300000));
      }
      // TODO coordinate with Anugoon to use keys when he implement.
      console.log(error);
      console.log(error.config);
      error.response?.data &&
        AppAlert('Change with the keys API', error.response.data.message).then();
      return !axios.isCancel(error) && Promise.reject(error);
    }
  
    renewRefreshToken(time: number): Promise<AuthInfo> {
      return new Promise(async (resolve, reject) => {
        let authInfo = (await storage.getGenericPassword()) as AuthInfo;
        const timeStamp = new Date().getTime();
        if (
          new Date(authInfo.accessTokenExpirationDate).getTime() + time <=
          timeStamp
        ) {
          refreshIdpAuth(authInfo.refreshToken)
            .then(refreshResult => {
              authInfo = buildAuthInfo(refreshResult);
              storage.setGenericPassword(authInfo);
              resolve(authInfo);
            })
            .catch(err => {
              storage.removeGenericPassword();
              storage.remove(StorageKeys.Profile);
              clearUserData();
              this.dispatch(Actions.Remove_Token);
              reject(err);
            });
        } else {
          resolve(authInfo);
        }
      });
    }
    */
  }
  
  export default httpClient;
  export const CancelToken = axios.CancelToken;
  export const httpInterceptor = new HttpAddInterceptor();
  




