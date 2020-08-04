import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import docReducer from './docReducer'
import roomReducer from './roomReducer'
import toolReducer from './toolReducer'
import pilotReducer from './pilotReducer'

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    room: roomReducer,
    doc: docReducer,
    tool: toolReducer,
    pilot: pilotReducer
});