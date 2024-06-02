import { SET_RECEIVING_STATUS } from '../../types/videoCallTypes.ts';

const initialState = {
    receiverConnectionId: "",
    isReceiving: false,
}

const receiverConnectionIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RECEIVING_STATUS:
            return {
                ...state,
                isReceiving: action.payload,
            };
        case "SET_RECEIVER_CONNECTION_ID":
            return {
                ...state,
                receiverConnectionId: action.payload
            }
        default:
            return state;
    }
}

export default receiverConnectionIdReducer;