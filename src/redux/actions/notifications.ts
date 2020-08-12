import { api_notifications_Get } from '../../api/notificationsApi';

export const get_notifications = async (token: string, isDriver: boolean): Promise<any | Object> => {
    return new Promise((resolve, reject) => {
      console.log('through the action - notifications', isDriver)
      api_notifications_Get(isDriver, token).then(response => {
        const notificationsJson: Array<Object>| any = response !== undefined && response.data !== undefined ? response.data : {};        
        resolve({message:'success', data: notificationsJson});
        }).catch((error)=> {
            console.log('Error reading Notifications :');
            console.log(error);
            reject({message: error})
        })
    });
}  