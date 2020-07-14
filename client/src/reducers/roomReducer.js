import { 
    SET_USER_NAME,
    SET_GUEST_ID,
    SET_USER_SOCKET,
    SET_ROOM_CODE,
    SET_HOST_NAME,
    UPDATE_CURRENT_GUESTS,
    OPEN_INVITE_GUESTS_WINDOW,
    CLOSE_INVITE_GUESTS_WINDOW,
    SET_INVITATION_LINK,
    OPEN_INVITE_GUESTS_ALERT,
    CLOSE_INVITE_GUESTS_ALERT
} from '../actions/types'

const initialState = {
    userName: '',
    guestID: null,
    userSocket: null,
    roomCode: null,
    hostName: '',
    guests: [],
    showInviteGuestsModal: false,
    showInviteGuestsAlert: false,
    invitationLink: ''
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

        default:
            return state;
            
    }
}