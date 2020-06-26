import { SET_USER_SOCKET } from '../actions/types'

const initialState = {
    userSocket: null
}

export default function(state = initialState, action) {
    switch(action.type) {

        case SET_USER_SOCKET:
            return {
                ...state,
                userSocket: action.payload
            }
        
        default:
            return state;
            
    }
}