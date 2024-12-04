export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

type LoginSuccessAction = {type: typeof LOGIN_SUCCESS; payload: LoginResponseData}
type LoginFailureAction = {type: typeof LOGIN_FAILURE; payload: any}

type LoginAction = LoginSuccessAction | LoginFailureAction | {type: typeof LOGOUT};


export type LoginResponseData={
    token:string,
    userId:string
}


export interface LoginState {
    isLoggedIn: boolean;
    token: string | null;
    userId: string | null;
    error: any;
}

export default LoginAction;