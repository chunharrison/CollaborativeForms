import { 
    SET_USER_NAME,
    SET_USER_SOCKET,
    SET_ROOM_CODE,
    UPDATE_CURRENT_USERS
} from './types'


export const setUserName = userName => dispatch => {
    dispatch({
        type: SET_USER_NAME,
        payload: userName
    })
}

export const updateCurrentUsers = currentUsers => dispatch => {
    dispatch({
        type: UPDATE_CURRENT_USERS,
        payload: currentUsers
    })
}

export const setUserSocket = userSocket => dispatch => {
    dispatch({
        type: SET_USER_SOCKET,
        payload: userSocket
    })
}

export const setRoomCode = roomCode => dispatch => {
    console.log('setRoomCode', roomCode)
    dispatch({
        type: SET_ROOM_CODE,
        payload: roomCode
    })
}