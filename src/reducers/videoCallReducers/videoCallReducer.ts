import VideoCallAction, { ACCEPT_CALL, ACTIVATE_CALLING_MODAL, DEACTIVATE_CALLING_MODAL, DECLINE_CALL } from "../../types/videoCallTypes.ts";

const initialState = {
    accepted: false,
    declined:false,
    videoCallModalActive: false
}

const videoCallReducer = (state = initialState, action:VideoCallAction) => {
    switch (action.type) {
        case ACCEPT_CALL:
            return {
                ...state,
                accepted: true
            }
        case DECLINE_CALL:
            return {
                ...state,
                declined: true
            }
        case ACTIVATE_CALLING_MODAL:
            return{
                ...state,
                videoCallModalActive:true
            }
        case DEACTIVATE_CALLING_MODAL:
            return{
                ...state,
                videoCallModalActive:false
            }
        default:
            return state;
    }
}

export default videoCallReducer;