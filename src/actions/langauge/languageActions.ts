import { AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { SET_GLOBAL_LANGUAGE } from "../../types/commonTypes.ts";

export const updateGlobalLanguage = (langauge:string): ThunkAction<void, {}, {}, AnyAction> => async(dispatch:Dispatch)=>{
    dispatch({type:SET_GLOBAL_LANGUAGE, payload:langauge})
} 