import { COURSE_APPLICATION_SUCCESS } from "../../types/commonTypes.ts";

interface CourseAppliedStatus {
  courseId: string;
  applicationStatus: number; // 0: Pending, 1: Accepted, 2: Declined
}

interface CourseApplicationAction {
  type: typeof COURSE_APPLICATION_SUCCESS;
  payload: {
    courseId: string;
    applicationStatus: number;
  };
}

type InitialStateType = CourseAppliedStatus[];

const initialState: InitialStateType = [];

const courseListReducer = (state = initialState, action: CourseApplicationAction): InitialStateType => {
  switch (action.type) {
    case COURSE_APPLICATION_SUCCESS:
      // Check if the course is already in the state
      const courseExists = state.some(course => course.courseId === action.payload.courseId);
      if (courseExists) {
        // Update the status for the existing course
        console.log("Course updating!!")
        return state.map(course =>
          course.courseId === action.payload.courseId
            ? { ...course, applicationStatus: action.payload.applicationStatus }
            : course
        );
      } else {
        // Add a new course to the state with the applicationStatus
        return [...state, { courseId: action.payload.courseId, applicationStatus: action.payload.applicationStatus }];
      }
    default:
      return state;
  }
};

export default courseListReducer;
