import { AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { HubConnection } from '@microsoft/signalr';
import { ACCEPT_CALL, DECLINE_CALL } from '../../types/videoCallTypes.ts';


export const acceptCall = (): ThunkAction<void, {}, {}, AnyAction> => async (dispatch: Dispatch) => {
    console.log("Accepting call in action BBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
    dispatch({ type: ACCEPT_CALL });
  
};


export const declineCall = (): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:DECLINE_CALL});
}
