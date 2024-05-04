import { combineReducers } from "redux";
import loginReducer from "./loginReducers/loginReducer.ts";

export const rootReducer = combineReducers({
    auth:loginReducer
});

export default rootReducer;