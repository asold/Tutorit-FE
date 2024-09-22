import { APPLICATIONS_STATUS_CHANGE } from "../../types/commonTypes.ts";

const initialState = {
    applicationStatus: 0,
};

/**
 * Reducer for handling changes to the application status.
 * The application status is one of:
 *  0 - Pending
 *  1 - Accepted
 *  2 - Declined
 * @param {Object} state - The current state of the application status.
 * @param {Object} action - The action that triggered the reducer.
 * @returns {Object} The new state of the application status.
 */
export const changeApplicationStatusReducer = (state = initialState, action: { type: string, payload: { applicationStatus: number } }) => {
    switch (action.type) {
        case APPLICATIONS_STATUS_CHANGE:
            // Use the spread operator to preserve the other parts of the state (if there are any)
            // and update the applicationStatus with the new value from the action's payload.
            return {
                ...state,
                applicationStatus: action.payload.applicationStatus,
            };
        default:
            // If the action type is not recognized, return the current state unchanged.
            return state;
    }
};

export default changeApplicationStatusReducer;
