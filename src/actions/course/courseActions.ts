import { AnyAction, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { COURSE_APPLICATION_SUCCESS } from "../../types/commonTypes.ts";

export const applyForCourse = (
  courseId: string,
  applicationStatus: number // Add application status here (0: Pending, 1: Accepted, 2: Declined)
): ThunkAction<void, {}, {}, AnyAction> => async (dispatch: Dispatch) => {
  dispatch({ type: COURSE_APPLICATION_SUCCESS, payload: { courseId, applicationStatus } });
};
