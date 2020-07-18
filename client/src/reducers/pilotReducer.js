import { 
    // state
    SET_PM_STATE,

    // modal window
    OPEN_PM_WAIT_WINDOW,
    CLOSE_PM_WAIT_WINDOW,
    SET_PM_WAIT_WINDOW_TABLE_ROWS,
    OPEN_PM_CONFIRM_WINDOW,
    CLOSE_PM_CONFIRM_WINDOW,

    // requester
    SET_PM_REQUESTER_SOCKET_ID
} from '../actions/types'

const initialState = {
    pmActivated: false,

    pmShowWaitWindow: false,
    pmWaitWindowTableRows: [],
    pmShowConfirmWindow: false,

    pmRequesterSocketID: null,
}

export default function(state = initialState, action) {
    switch(action.type) {

        // STATE // 
        case SET_PM_STATE:
            return {
                ...state,
                pmActivated: action.payload
            }



        // MODAL WINDOW
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

        case SET_PM_WAIT_WINDOW_TABLE_ROWS:
            console.log('SET_PM_WAIT_WINDOW_TABLE_ROWS', action.payload )
            return {
                ...state,
                pmWaitWindowTableRows: action.payload
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



        // REQUESTER // 
        case SET_PM_REQUESTER_SOCKET_ID:
            return {
                ...state,
                pmRequesterSocketID: action.payload
            }

        default:
            return state;
            
    }
}