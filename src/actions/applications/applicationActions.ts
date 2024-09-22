import { AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { APPLICATIONS_STATUS_CHANGE } from "../../types/commonTypes.ts";

export const changeApplicationStatus = (
  applicationStatus: number // Add application status here (0: Pending, 1: Accepted, 2: Declined)
): ThunkAction<void, {}, {}, AnyAction> => async (dispatch: Dispatch) => {
  dispatch({ type: APPLICATIONS_STATUS_CHANGE, payload: { applicationStatus } });
};
