export interface UserDto  {
    firstName:string;
    lastName:string;
    email:string;
    photoUrl:string;
}

export interface AccountDto{
    username:string;
    password:string;
    role:number;
}

export interface RegistrationObject {
    account: AccountDto;
    user: UserDto;
}

export const ADD_PERSONAL_INFO_SUCCESS = 'ADD_PERSONAL_INFO_SUCCESS';
export const ADD_ACCOUNT_INFO_SUCCESS = 'ADD_ACCOUNT_INFO_SUCCESS';
export const USERNAME_EXISTS = 'USERNAME_EXISTS';

type AddedPersonalInfoSuccessAction = {type: typeof ADD_PERSONAL_INFO_SUCCESS; payload: UserDto}
type AddedAccountInfoSuccessAction = {type: typeof ADD_ACCOUNT_INFO_SUCCESS; payload: AccountDto}
type UsernameExistsAction = {type: typeof USERNAME_EXISTS, payload: string}

type RegistrationAction = AddedPersonalInfoSuccessAction | AddedAccountInfoSuccessAction | UsernameExistsAction;

export default RegistrationAction;