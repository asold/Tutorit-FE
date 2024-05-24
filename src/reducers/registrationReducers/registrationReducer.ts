import RegistrationAction, { ADD_ACCOUNT_INFO_SUCCESS, ADD_PERSONAL_INFO_SUCCESS, RegistrationObject } from "../../types/regTypes.ts";

const initialState: RegistrationObject = {
  account: {
    username: '',
    password: '',
    role: 0
  },
  user: {
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: ''
  }
};

const registrationReducer = (state = initialState, action: RegistrationAction): RegistrationObject => {
  switch (action.type) {
    case ADD_PERSONAL_INFO_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case ADD_ACCOUNT_INFO_SUCCESS:
      return {
        ...state,
        account: {
          ...state.account,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export default registrationReducer;
