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
                // dispatch(addedPersonalInfo(userDto));
                localStorage.setItem('userDto', JSON.stringify(userDto));
                navigate();
            }
            catch(error){
        }
    }
}

  export const register = ( username: string, password: string, role: string,navigate: () => void): ThunkAction<void, any, unknown, any> => {
    return async (dispatch: Dispatch) => {
      let personalInfo: UserDto | null = null;
  
      const personalInfoString = localStorage.getItem('userDto');
      if (personalInfoString) {
        try {
          personalInfo = JSON.parse(personalInfoString) as UserDto;
          console.log('Personal info:', personalInfo);
        } catch (error) {
          console.error('Failed to parse personalInfo from localStorage', error);
          return;
        }
      }
  
      if (!personalInfo) {
        console.error('Personal info is missing');
        return;
      }
      try {
        const roleInt = Number(role);
        const accountDto = { username, password, role: roleInt };
  
        const response = await axios.post('http://localhost:8000/tutorit/User/registration', {
          accountDto,
          userDto: personalInfo
        });
  
        console.log('Response:', response);
  
        if (response.status === 200) {
          navigate();
        }
  
      } catch (error) {
        console.error(error);
      }
  
    };
  };



