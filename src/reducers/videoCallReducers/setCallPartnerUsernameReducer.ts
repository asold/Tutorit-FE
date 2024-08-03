import { SET_CALL_PARTNER_USERNAME } from "../../types/commonTypes.ts";

const initialState = {
  callPartnerUsername: '',
};

const setCallPartnerUsernameReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_CALL_PARTNER_USERNAME:
      return {
        ...state,
        callPartnerUsername: action.payload,
      };
    default:
      return state;
  }
};

export default setCallPartnerUsernameReducer;
