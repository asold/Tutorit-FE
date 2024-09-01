import { combineReducers } from "redux";
import loginReducer from "./loginReducers/loginReducer.ts";
import videoCallReducer from "./videoCallReducers/videoCallReducer.ts";
import receiverConnectionIdReducer from "./videoCallReducers/receiverConnectionIdReducer.ts";
import registrationReducer from "./registrationReducers/registrationReducer.ts";
import setCallPartnerUsernameReducer from "./videoCallReducers/setCallPartnerUsernameReducer.ts";
import globalLanguageReducer from "./language/globalLanguageReducer.ts"
import courseListReducer from "./courseReducers/courseListReducer.ts";

export const rootReducer = combineReducers({
    auth:loginReducer,
    videoCall:videoCallReducer,
    receiver:receiverConnectionIdReducer,
    registration:registrationReducer,
    callPartner:setCallPartnerUsernameReducer,
    globalLanguage:globalLanguageReducer,
    courseList:courseListReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
