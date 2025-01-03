import { ThunkAction } from "redux-thunk";
import LoginAction, { LOGIN_SUCCESS, LOGOUT } from "../../types/loginTypes.ts";
import { Dispatch } from "redux";
import axios from 'axios';
import { SERVER_ADDRESS } from "../../common/constants.ts";

const loginSuccess = (token:string, userId:string):any => {
    return {
        type: 'LOGIN_SUCCESS',
        payload: {token, userId}
    };
};

const LoginFailure = (error:any):any => {
    return {
        type: 'LOGIN_FAILURE',
        payload: error
    };
};

// loginActions.ts

export const loginUser = (token: string, userId: string) => ({
  type: LOGIN_SUCCESS,
  payload: { token, userId },
});


export const login =  (username: string, password: string):
    ThunkAction<Promise<string>, any, unknown, LoginAction> => 
        async (dispatch:Dispatch) => {{
            try{
                const response = await axios.post(`${SERVER_ADDRESS}/tutorit/User/login`, {username, password});

                console.log("Action response: ",response)
                const token = response.data.token;
                const userId = response.data.userId;
                
                console.log("UserId: ",userId)
                console.log("Token: ",token)
                
                dispatch(loginSuccess(token, userId));
                return response.data.role;
                
            }
            catch(error){
                await dispatch(LoginFailure(error));
        }
    }
}

export const logoutUser = () => ({
    type: LOGOUT,
  });