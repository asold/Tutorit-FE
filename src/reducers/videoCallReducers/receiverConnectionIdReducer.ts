const initialState = {
    receiverConnectionId: ""
}

const receiverConnectionIdReducer = (state = initialState, action) => {
    switch (action.type) {
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