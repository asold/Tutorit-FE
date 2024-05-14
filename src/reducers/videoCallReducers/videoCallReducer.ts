import VideoCallAction, { ACCEPT_CALL, DECLINE_CALL } from "../../types/videoCallTypes.ts";

const initialState = {
    accepted: false,
    declined:false
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
        default:
            return state;
    }
}

export default videoCallReducer;