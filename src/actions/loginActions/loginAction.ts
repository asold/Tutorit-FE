import { ThunkAction } from "redux-thunk";
import LoginAction from "../../types/loginTypes";
import { Dispatch } from "redux";
import axios from 'axios';

const loginSuccess = (token:string):any => {
    return {
        type: 'LOGIN_SUCCESS',
        payload: token
    };
};

const LoginFailure = (error:any):any => {
    return {
        type: 'LOGIN_FAILURE',
        payload: error
    };
};


export const login =  (username: string, password: string, onSuccess: () => void):
    ThunkAction<void, any, unknown, LoginAction> => 
        async (dispatch:Dispatch) => {{
            try{
                const response = await axios.post(`http://localhost:8000/tutorit/User/login`, {username, password});
                const token = response.data;
                dispatch(loginSuccess(token));
                onSuccess();
            }
            catch(error){
                await dispatch(LoginFailure(error));
        }
    }
}