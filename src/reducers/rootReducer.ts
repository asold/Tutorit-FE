import { combineReducers } from "redux";
import loginReducer from "./loginReducers/loginReducer.ts";
import videoCallReducer from "./videoCallReducers/videoCallReducer.ts";

export const rootReducer = combineReducers({
    auth:loginReducer,
    videoCall:videoCallReducer
});

export default rootReducer;