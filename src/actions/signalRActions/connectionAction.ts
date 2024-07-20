import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'; 
import { ThunkDispatch } from 'redux-thunk'; 
import { AnyAction } from 'redux'; 
import { SERVER_ADDRESS } from '../../common/constants';

export const connectToSignalR = (userToken:string) => {
  return async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {

      const connection = new HubConnectionBuilder()
        .withUrl(`${SERVER_ADDRESS}/hub?userToken=${userToken}`) 
        .configureLogging(LogLevel.Information)
        .build();

        connection.onreconnecting(() => {
          console.log('Connection reconnecting...');
        });
  
        connection.onreconnected(() => {
          console.log('Connection reestablished.');
          dispatch(signalRConnected(connection.connectionId)); 
        });

        connection.onclose((error) => {
          console.log('Connection closed:', error);
          setTimeout(() => connectToSignalR(userToken), 5000); 
        });

      await connection.start();

      dispatch(signalRConnected(connection.connectionId)); 

      console.log('Connection established.');
    } catch (error) {
      console.error('Connection failed:', error);
    
    }
  };
};

export const signalRConnected = (connectionId: string | null) => {
  return {
    type: 'SIGNALR_CONNECTED',
    payload: connectionId
  };
};
