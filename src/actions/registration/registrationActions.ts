import axios from "axios";
import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import RegistrationAction, { ADD_ACCOUNT_INFO_SUCCESS, UserDto } from "../../types/regTypes.ts";


const addedPersonalInfo = (userInfo:UserDto):any => {
    return {
        type: 'ADD_PERSONAL_INFO_SUCCESS',
        payload: userInfo
    };
};

export const addPersonalInfo =  (firstName: string, lastName: string, email:string, photoUrl:string,  navigate: () => void ):
    ThunkAction<void, any, unknown, RegistrationAction> => 
        async (dispatch:Dispatch) => {{
            try{
                const userDto = {firstName, lastName, email, photoUrl};
                dispatch(addedPersonalInfo(userDto));
                navigate();
            }
            catch(error){
        }
    }
}

export const registerUser = (username: string, password: string, role: string, personalInfo: UserDto, navigate: () => void): ThunkAction<void, any, unknown, RegistrationAction> => 
    async (dispatch: Dispatch) => {
      try {

        const roleInt = Number(role);
        const accountDto = { username, password, roleInt };

        const response = await axios.post(`http://localhost:8000/tutorit/User/registration`, { accountDto, userDto: personalInfo });

        console.log("AAAAAAAA")
        console.log(response.status);
  
        // if (response.data === "Username already exists") {
        //   return;
        // }
  
        // dispatch({ type: ADD_ACCOUNT_INFO_SUCCESS, payload: accountDto });
        // navigate();
      } catch (error) {
        console.error(error);
      }
    };

