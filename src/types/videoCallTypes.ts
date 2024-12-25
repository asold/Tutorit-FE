export const ACCEPT_CALL = 'ACCEPT_CALL';
export const DECLINE_CALL = 'DECLINE_CALL';

export const SET_RECEIVING_STATUS = 'SET_RECEIVING_STATUS';
export const ACTIVATE_CALLING_MODAL ='ACTIVATE_CALLING_MODAL';
export const DEACTIVATE_CALLING_MODAL ='DEACTIVATE_CALLING_MODAL';

type AcceptCallAction = { type: typeof ACCEPT_CALL }
type DeclineCallAction = { type: typeof DECLINE_CALL }
type ActivateCallingModal ={type: typeof ACTIVATE_CALLING_MODAL}
type DeactivateCallingModal ={type: typeof DEACTIVATE_CALLING_MODAL}

type VideoCallAction = AcceptCallAction | DeclineCallAction | ActivateCallingModal | DeactivateCallingModal;

export interface VideoCallState {
    accepted: boolean;
    declined: boolean;
}

export default VideoCallAction;