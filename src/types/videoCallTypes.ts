export const ACCEPT_CALL = 'ACCEPT_CALL';
export const DECLINE_CALL = 'DECLINE_CALL';

export const SET_RECEIVING_STATUS = 'SET_RECEIVING_STATUS';

type AcceptCallAction = { type: typeof ACCEPT_CALL }
type DeclineCallAction = { type: typeof DECLINE_CALL }

type VideoCallAction = AcceptCallAction | DeclineCallAction;

export interface VideoCallState {
    accepted: boolean;
    declined: boolean;
}

export default VideoCallAction;