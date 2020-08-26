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
    GET_PRODUCT_GUEST_CAPACITY,

    SET_MAX_NUM_GUESTS,
    SET_DOWNLOAD_OPTION
} from '../actions/types'

const initialState = {
    userName: '',
    guestID: null,
    userSocket: null,
    roomCode: null,
    hostName: '',
    guests: [],
    guestObject: {},
    showInviteGuestsModal: false,
    showInviteGuestsAlert: false,
    showRoomSettingsWindow: false,
    invitationLink: '',
    hostID: '',

    // options
    numMaxGuests: 1,
    downloadOption: 'Both',
    guestCapacity: 1,
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_USER_NAME:
            return {
                ...state,
                userName: action.payload
            }

        case SET_GUEST_ID:
            return {
                ...state,
                guestID: action.payload
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
        
        case SET_HOST_NAME:
            return {
                ...state, 
                hostName: action.payload
            }

        case UPDATE_CURRENT_GUESTS:
            return {
                ...state,
                guests: action.payload
            }

        case UPDATE_CURRENT_GUEST_OBJECT:
            return {
                ...state, 
                guestObject: action.payload
            }

        case OPEN_INVITE_GUESTS_WINDOW:
            return {
                ...state,
                showInviteGuestsModal: action.payload
            }

        case CLOSE_INVITE_GUESTS_WINDOW:
            return {
                ...state,
                showInviteGuestsModal: action.payload
            }

        case SET_INVITATION_LINK:
            return {
                ...state,
                invitationLink: action.payload
            }

        case OPEN_INVITE_GUESTS_ALERT:
            return {
                ...state,
                showInviteGuestsAlert: action.payload
            }

        case CLOSE_INVITE_GUESTS_ALERT:
            return {
                ...state,
                showInviteGuestsAlert: action.payload
            }

        case OPEN_ROOM_SETTINGS_WINDOW:
            return {
                ...state,
                showRoomSettingsWindow: action.payload
            }

        case CLOSE_ROOM_SETTINGS_WINDOW:
            return {
                ...state,
                showRoomSettingsWindow: action.payload
            }

        case SET_ROOM_HOST_ID: 
            return {
                ...state,
                hostID: action.payload
            }

        case SET_MAX_NUM_GUESTS:
            return {
                ...state,
                numMaxGuests: action.payload
            }

        case SET_DOWNLOAD_OPTION:
            return {
                ...state,
                downloadOption: action.payload
            }

        case GET_PRODUCT_GUEST_CAPACITY:
            return {
                ...state,
                guestCapacity: action.payload
            }

        default:
            return state;
    }
}