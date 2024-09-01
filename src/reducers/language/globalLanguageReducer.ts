import { SET_GLOBAL_LANGUAGE } from "../../types/commonTypes.ts";

const initialState = {
    language: '',
};

interface UpdateGlobalLanguageAction {
    type: typeof SET_GLOBAL_LANGUAGE;
    payload: string;
}

// const ROMANIAN_OPTIONS = ["Română", "Romanian"];
const ROMANIAN_OPTIONS = ["Romanian"];

const globalLanguageReducer = (state = initialState, action: UpdateGlobalLanguageAction) => {
    let languageName;

    switch (action.payload) {
        case "ro":
            languageName = ROMANIAN_OPTIONS[Math.floor(Math.random() * ROMANIAN_OPTIONS.length)];
            break;
        case 'en':
            languageName = 'English';
            break;
        default:
            languageName = action.payload; // Fallback to the original payload if no match
            break;
    }

    switch (action.type) {
        case SET_GLOBAL_LANGUAGE:
            return {
                ...state,
                language: languageName,
            };
        default:
            return state;
    }
};

export default globalLanguageReducer;
