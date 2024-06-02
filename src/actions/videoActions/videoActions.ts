import { AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { HubConnection } from '@microsoft/signalr';
import { ACCEPT_CALL, DECLINE_CALL } from '../../types/videoCallTypes.ts';
import axios from 'axios';

const token = localStorage.getItem('token');

export const SET_RECEIVING_STATUS = 'SET_RECEIVING_STATUS';

export const setReceivingStatus = (isReceiving: boolean) => ({
    type: SET_RECEIVING_STATUS,
    payload: isReceiving,
});


export const acceptCall = (connectionId: string): ThunkAction<void, {}, {}, AnyAction> => 

    async (dispatch: Dispatch) => {

        try {
            const response = await axios.post(`http://localhost:8000/tutorit/Call/acceptCall`, 
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


export const setReceiverConnectionId = (connectionId:string): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    console.log("ASDASDANDJBWOFIVBIWORNVINWVNWILOERBVIOWRVNIOWERVBUYIR");
    dispatch({type:'SET_RECEIVER_CONNECTION_ID', payload:connectionId});
}