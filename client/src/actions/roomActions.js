import { SET_USER_SOCKET } from './types'

export const setUserSocket = userSocket => dispatch => {
    dispatch({
        type: SET_USER_SOCKET,
        payload: userSocket
    })
}