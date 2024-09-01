import { COURSE_APPLICATION_SUCCESS } from "../../types/commonTypes.ts";

interface CourseAppliedStatus {
    courseId: string;
    applied: boolean;
}

interface CourseApplicationAction {
    type: typeof COURSE_APPLICATION_SUCCESS;
    payload: string; // Assuming payload is the courseId
}

type InitialStateType = CourseAppliedStatus[];

const initialState: InitialStateType = [];

const courseListReducer = (state = initialState, action: CourseApplicationAction): InitialStateType => {
    switch (action.type) {
        case COURSE_APPLICATION_SUCCESS:
            // Check if the course is already in the state
            const courseExists = state.some(course => course.courseId === action.payload);
            if (courseExists) {
                return state.map(course =>
                    course.courseId === action.payload
                        ? { ...course, applied: true }
                        : course
                );
            } else {
                // Add new course to the state with applied = true
                return [...state, { courseId: action.payload, applied: true }];
            }
        default:
            return state;
    }
};

export default courseListReducer;
