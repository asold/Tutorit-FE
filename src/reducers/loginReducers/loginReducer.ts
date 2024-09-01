import LoginAction, { LOGIN_FAILURE, LOGIN_SUCCESS, LoginState } from "../../types/loginTypes.ts";

const initialState:LoginState = {
    token:null,
    userId:null,
    error:null
}

const loginReducer = (state = initialState, action:LoginAction) => {
    
    switch(action.type){

        case LOGIN_SUCCESS:
            console.log("Login success", action);
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('userId', action.payload.userId);
            return {
                ...state,
                token: action.payload.token,
                userId:action.payload.userId,
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

