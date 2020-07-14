import { 
    PM_ACTIVATED,
    PM_DEACTIVATED,
    SET_PM_IS_DRIVER,
    SET_PM_DRIVER_NAME,
    SET_PM_BUTTON,
    UPDATE_PM_NUM_ACCEPTS,

    OPEN_PM_WAIT_WINDOW,
    CLOSE_PM_WAIT_WINDOW,
    OPEN_PM_CONFIRM_WINDOW,
    CLOSE_PM_CONFIRM_WINDOW,
    SET_PM_REQUESTER_INFO,
    SET_PM_CURR_NUM_GUESTS,

    SET_PM_WAIT_WINDOW_TABLE_ROWS
} from '../actions/types'

const initialState = {
    pmActivated: false,
    pmIsDriver: false,
    pmDriverName: '',
    pmButtonLabel: 'Activate',
    pmButtonVariant: 'info',
    pmNumAccepts: 0,

    pmShowWaitWindow: false,
    pmWaitWindowTableRows: [],
    pmShowConfirmWindow: false,

    pmRequesterUsername: '',
    pmRequesterSocketID: null,
    pmCurrNumGuests: 0,
}

export default function(state = initialState, action) {
    switch(action.type) {

        case PM_ACTIVATED:
            return {
                ...state,
                pmActivated: action.payload
            }

        case PM_DEACTIVATED:
            return {
                ...state,
                pmActivated: action.payload
            }

        case SET_PM_IS_DRIVER:
            return {
                ...state,
                pmIsDriver: action.payload
            }

        case SET_PM_DRIVER_NAME:
            return {
                ...state,
                pmDriverName: action.payload
            }

        case SET_PM_BUTTON:
            return {
                ...state,
                pmButtomLabel: action.payload.pmButtomLabel,
                pmButtonVariant: action.payload.pmButtonVariant
            }

        case UPDATE_PM_NUM_ACCEPTS:
            return {
                ...state,
                numAccepts: action.payload
            }


        case OPEN_PM_CONFIRM_WINDOW:
            return {
                ...state,
                pmShowConfirmWindow: action.payload 
            }

        case CLOSE_PM_CONFIRM_WINDOW:
            return {
                ...state,
                pmShowConfirmWindow: action.payload 
            }
        
        case OPEN_PM_WAIT_WINDOW:
            return {
                ...state,
                pmShowWaitWindow: action.payload 
            }

        case CLOSE_PM_WAIT_WINDOW:
            return {
                ...state,
                pmShowWaitWindow: action.payload 
            }

        case SET_PM_REQUESTER_INFO:
            return {
                ...state,
                pmRequesterUsername: action.payload.requesterUserName,
                pmRequesterSocketID: action.payload.requesterSocketID
            }

        case SET_PM_CURR_NUM_GUESTS:
            return {
                ...state,
                pmCurrNumGuests: action.payload
            }

        case SET_PM_WAIT_WINDOW_TABLE_ROWS:
            return {
                ...state,
                pmWaitWindowTableRows: action.payload
            }

        default:
            return state;
            
    }
}