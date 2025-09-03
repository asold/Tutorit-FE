import LoginAction, { LOGIN_FAILURE, LOGIN_SUCCESS, LoginState, LOGOUT } from "../../types/loginTypes.ts";

const initialState:LoginState = {
    isLoggedIn:false,
    token:null,
    userId:null,
    error:null
}

const loginReducer = (state = initialState, action:LoginAction) => {
    switch(action.type){
        case LOGIN_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('userId', action.payload.userId);
            return {
                ...state,
                isLoggedIn:true,
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
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}

export default loginReducer;

