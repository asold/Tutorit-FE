import { SET_RECEIVING_STATUS } from '../../types/videoCallTypes.ts';

const initialState = {
    receiverConnectionId: "",
    isReceiving: false,
    initialCallerUserName : "",
}

const receiverConnectionIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RECEIVING_STATUS:
            console.log("RECEIVING IN THE REDUCER! ", state)
            return {
                ...state,
                isReceiving: action.payload,
            };
        case "SET_RECEIVER_CONNECTION_ID":
            return {
                ...state,
                receiverConnectionId: action.payload
            };
        case "SET_INITIAL_CALLER_USERNAME":
            return{
                ...state,
                initialCallerUserName: action.payload
            }
        default:
            return state;
    }
}

export default receiverConnectionIdReducer;