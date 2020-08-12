import { ACTIONS_APP } from '../actions/types';

export interface IAppState {    
    isLoading: boolean;
    isAndroid : boolean;
    authorized : boolean
}

export default function appReducer(state: IAppState = {
                                            isLoading: false,
                                            isAndroid: true,
                                            authorized: false,  
                                        },
                                action: { type: string; payload: string | undefined | any },
): IAppState {
  switch (action.type) {
    case ACTIONS_APP.APP_SET_ISLOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
    };  
    case ACTIONS_APP.APP_SET_AUTHORIZED:
      return {
        ...state,
        authorized: action.payload.authorized,
    };   
    default:
      return state;
  }
}