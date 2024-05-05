import LoginAction, { LOGIN_FAILURE, LOGIN_SUCCESS, LoginState } from "../../types/loginTypes.ts";

const initialState:LoginState = {
    token:null,
    error:null
}

const loginReducer = (state = initialState, action:LoginAction) => {
    
    switch(action.type){

        case LOGIN_SUCCESS:
            localStorage.setItem('token', action.payload);
            return {
                ...state,
                token: action.payload,
                error:null
            }
        case LOGIN_FAILURE:
            console.log("Login failed", action);
            return {
                ...state,
                token:null,
                error:action.payload
            }
        default:
            return state;
    }
}

export default loginReducer;

