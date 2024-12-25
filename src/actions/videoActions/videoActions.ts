import { AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { HubConnection } from '@microsoft/signalr';
import { ACCEPT_CALL, ACTIVATE_CALLING_MODAL, DEACTIVATE_CALLING_MODAL, DECLINE_CALL } from '../../types/videoCallTypes.ts';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../common/constants.ts';
import { SET_CALL_PARTNER_USERNAME } from "../../types/commonTypes.ts";


const token = localStorage.getItem('token');

export const SET_RECEIVING_STATUS = 'SET_RECEIVING_STATUS';

export const setReceivingStatus = (isReceiving: boolean) => ({
    type: SET_RECEIVING_STATUS,
    payload: isReceiving,
});


export const acceptCall = (connectionId: string): ThunkAction<void, {}, {}, AnyAction> => 

    async (dispatch: Dispatch) => {

        try {
            const response = await axios.post(`${SERVER_ADDRESS}/tutorit/Call/acceptCall`, 
            { recipientClientId: connectionId },
             {
                headers: {
                    Authorization: `Bearer ${token}`  // Set the token as Bearer in the Authorization header
                }
            });

            if(response.status === 200){
                dispatch({ type: ACCEPT_CALL });
            }
        } catch (error) {
            console.error("Error in acceptCall:", error);
        }
    };

export const declineCall = (): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:DECLINE_CALL});
}

export const setInitialCallerUserName = (username:string): ThunkAction<void, {}, {}, AnyAction>=>async(dispatch:Dispatch)=>{
    dispatch({type:'SET_INITIAL_CALLER_USERNAME', payload:username})
}


export const setReceiverConnectionId = (connectionId:string): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:'SET_RECEIVER_CONNECTION_ID', payload:connectionId});
}

export const setCallPartnerUsername = (username: string): ThunkAction<void, {}, {}, AnyAction> => async (dispatch: Dispatch) => {
    dispatch({ type: SET_CALL_PARTNER_USERNAME, payload: username });
  };

export const activateCallingModal =(): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:ACTIVATE_CALLING_MODAL})
}

export const closeVideoCallModal =(): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:DEACTIVATE_CALLING_MODAL})
}
