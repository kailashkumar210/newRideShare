import { ACTIONS_USER } from '../actions/types';
import User from '../../models/User';

export interface IUserState {    
    current: User; 
    firebaseToken: string;  
}

export default function authReducer(state: IUserState = {
                                            current: new User(),
                                            firebaseToken:''
                                          },
                                    action: { type: string; payload: User | string | undefined | any },
): IUserState {
  switch (action.type) {
    case ACTIONS_USER.USER_LOGIN:
      return {
        ...state,
        current: action.payload,
    };
    case ACTIONS_USER.USER_LOGOUT:
      console.log('Pending Review')
      return {
        ...state,
        current: new User(),
    };
    case ACTIONS_USER.SET_FIREBASETOKEN:
      console.log('Pending Review')
      return {
        ...state,
        firebaseToken: action.payload.firebaseToken,
    };
    case ACTIONS_USER.USER_UPDATE_PROFILE:
      return {
        ...state,
        current: action.payload.userProfile,
    };                  
    case ACTIONS_USER.USER_CHANGE_PASSWORD:
      let _tempUser= {...state.current};
      _tempUser.password = action.payload.password;
      return {
        ...state,
        current: {..._tempUser}
    };                  
    default:
      return state;
  }
}