import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import docReducer from './docReducer'
import roomReducer from './roomReducer'
import toolReducer from './toolReducer'

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    room: roomReducer,
    doc: docReducer,
    tool: toolReducer,
});