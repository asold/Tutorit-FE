import { combineReducers } from "redux";
import loginReducer from "./loginReducers/loginReducer.ts";
import videoCallReducer from "./videoCallReducers/videoCallReducer.ts";
import receiverConnectionIdReducer from "./videoCallReducers/receiverConnectionIdReducer.ts";

export const rootReducer = combineReducers({
    auth:loginReducer,
    videoCall:videoCallReducer,
    receiver:receiverConnectionIdReducer
});

export default rootReducer;