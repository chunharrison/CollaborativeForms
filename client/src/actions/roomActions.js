import axios from 'axios'

import { 
    SET_USER_NAME,
    SET_GUEST_ID,
    SET_USER_SOCKET,
    SET_ROOM_CODE,
    SET_HOST_NAME,
    UPDATE_CURRENT_GUESTS,
    UPDATE_CURRENT_GUEST_OBJECT,
    OPEN_INVITE_GUESTS_WINDOW,
    CLOSE_INVITE_GUESTS_WINDOW,
    SET_INVITATION_LINK,
    OPEN_INVITE_GUESTS_ALERT,
    CLOSE_INVITE_GUESTS_ALERT,
    OPEN_ROOM_SETTINGS_WINDOW,
    CLOSE_ROOM_SETTINGS_WINDOW,
    SET_ROOM_HOST_ID,

    SET_MAX_NUM_GUESTS,
    SET_DOWNLOAD_OPTION
} from './types'


export const setUserName = userName => dispatch => {
    dispatch({
        type: SET_USER_NAME,
        payload: userName
    })
}

export const setGuestID = guestID => dispatch => {
    dispatch({
        type: SET_GUEST_ID,
        payload: guestID
    })
}

export const updateCurrentGuests = currentGuests => dispatch => {
    dispatch({
        type: UPDATE_CURRENT_GUESTS,
        payload: currentGuests
    })
}

export const updateCurrentGuestObject = guestObject => dispatch => {
    dispatch({
        type: UPDATE_CURRENT_GUEST_OBJECT,
        payload: guestObject
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

export const openRoomSettingsWindow = () => dispatch => {
    dispatch({
        type: OPEN_ROOM_SETTINGS_WINDOW,
        payload: true
    })
}

export const closeRoomSettingsWindow = () => dispatch => {
    dispatch({
        type: CLOSE_ROOM_SETTINGS_WINDOW,
        payload: false
    })
}

export const setMaxNumGuests = options => dispatch => {
    axios.post('/api/room/set-num-max-guests', options)
        .then(res => {
            dispatch({
                type: SET_MAX_NUM_GUESTS,
                payload: res.numMaxGuests
            })
        })
}

export const setRoomHostID = hostID => dispatch => {
    dispatch({
        type: SET_ROOM_HOST_ID,
        payload: hostID
    })
}

export const getRoomCapacity = roomCode => dispatch => {
    const options = {
        params: {
            roomCode: roomCode
        },
        headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': '*',
        },
    };

    axios.get('/api/room/get-num-max-guests', options)
        .then(res => {
            dispatch({
                type: SET_MAX_NUM_GUESTS,
                payload: res.data.numMaxGuests
            })
        }
    )
}

export const getDownloadOption = roomCode => dispatch => {
    const options = {
        params: {
            roomCode: roomCode
        },
        headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': '*',
        },
    };

    axios.get('/api/room/get-download-option', options)
        .then(res => {
            dispatch({
                type: SET_DOWNLOAD_OPTION,
                payload: res.data.downloadOption
            })
        }
    )
}

export const updateDownloadOption = newDownloadOption => dispatch => {
    dispatch({
        type: SET_DOWNLOAD_OPTION,
        payload: newDownloadOption
    })
}