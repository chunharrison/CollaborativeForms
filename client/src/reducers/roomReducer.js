import { 
    SET_USER_NAME,
    SET_USER_SOCKET,
    SET_ROOM_CODE,
    UPDATE_CURRENT_USERS
} from '../actions/types'

const initialState = {
    userName: '',
    userSocket: null,
    roomCode: null,
    currentUsers: [],
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_USER_NAME:
            return {
                ...state,
                userName: action.payload
            }

        case SET_USER_SOCKET:
            return {
                ...state,
                userSocket: action.payload
            }

        case SET_ROOM_CODE:
            return {
                ...state,
                roomCode: action.payload
            }
        
        case UPDATE_CURRENT_USERS:
            return {
                ...state,
                currentUsers: action.payload
            }

        default:
            return state;
            
    }
}