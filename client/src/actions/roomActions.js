import { 
    SET_USER_NAME,
    SET_USER_SOCKET,
    SET_ROOM_CODE,
    SET_HOST_NAME,
    UPDATE_CURRENT_GUESTS,
    OPEN_INVITE_GUESTS_WINDOW,
    CLOSE_INVITE_GUESTS_WINDOW,
    SET_INVITATION_LINK,
    OPEN_INVITE_GUESTS_ALERT,
    CLOSE_INVITE_GUESTS_ALERT
} from './types'


export const setUserName = userName => dispatch => {
    dispatch({
        type: SET_USER_NAME,
        payload: userName
    })
}

export const updateCurrentGuests = currentGuests => dispatch => {
    dispatch({
        type: UPDATE_CURRENT_GUESTS,
        payload: currentGuests
    })
}

export const setUserSocket = userSocket => dispatch => {
    dispatch({
        type: SET_USER_SOCKET,
        payload: userSocket
    })
}

export const setRoomCode = roomCode => dispatch => {
    dispatch({
        type: SET_ROOM_CODE,
        payload: roomCode
    })
}

export const setHostName = hostName => dispatch => {
    console.log('setHostName', hostName)
    dispatch({
        type: SET_HOST_NAME,
        payload: hostName
    })
}

export const openInviteGuestsWindow = () => dispatch => {
    dispatch({
        type: OPEN_INVITE_GUESTS_WINDOW,
        payload: true
    })
}

export const closeInviteGuestsWindow = () => dispatch => {
    dispatch({
        type: CLOSE_INVITE_GUESTS_WINDOW,
        payload: false
    })
}

export const openInviteGuestsAlert = () => dispatch => {
    dispatch({
        type: OPEN_INVITE_GUESTS_ALERT,
        payload: true
    })
}

export const closeInviteGuestsAlert = () => dispatch => {
    dispatch({
        type: CLOSE_INVITE_GUESTS_ALERT,
        payload: false
    })
}

export const setInvitationLink = link => dispatch => {
    dispatch({
        type: SET_INVITATION_LINK,
        payload: link
    })
}