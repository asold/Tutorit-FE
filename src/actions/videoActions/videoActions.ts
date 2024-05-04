import { AnyAction, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { HubConnection } from '@microsoft/signalr';

export const sendVideoChunk = (
  chunk: Blob,
  connection: HubConnection,
  partnerUsername: string,
  token: string
): ThunkAction<void, {}, {}, AnyAction> => async (dispatch: Dispatch) => {
  if (connection && connection.state === 'Connected') {
    console.log('Sending chunk of data...', chunk.size, 'bytes');
    try {
      // Assuming your server has a method called "SendVideoStream" that expects certain parameters
      await connection.send('ReceiveVideoStream', partnerUsername, chunk);
      console.log('Chunk of data sent');
    } catch (error) {
      console.error('Error sending video chunk:', error);
      dispatch({ type: 'VIDEO_UPLOAD_FAILURE', payload: 'Failed to send video chunk' });
    }
  } else {
    console.error('SignalR connection is not open or ready');
    dispatch({ type: 'VIDEO_UPLOAD_FAILURE', payload: 'SignalR connection is not open or ready' });
  }
};
