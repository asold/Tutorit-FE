import { combineReducers } from "redux";
import loginReducer from "./loginReducers/loginReducer.ts";
import videoCallReducer from "./videoCallReducers/videoCallReducer.ts";
import receiverConnectionIdReducer from "./videoCallReducers/receiverConnectionIdReducer.ts";
import registrationReducer from "./registrationReducers/registrationReducer.ts";
import setCallPartnerUsernameReducer from "./videoCallReducers/setCallPartnerUsernameReducer.ts";

export const rootReducer = combineReducers({
    auth:loginReducer,
    videoCall:videoCallReducer,
    receiver:receiverConnectionIdReducer,
    registration:registrationReducer,
    callPartner:setCallPartnerUsernameReducer,
});

export default rootReducer;