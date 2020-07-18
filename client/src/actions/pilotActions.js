import axios from "axios";
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
} from './types'



// STATE //

export const setPMState = (PMState) => dispatch => {
    dispatch({
        type: SET_PM_STATE,
        payload: PMState
    })
}



// MODAL WINDOW //

export const openPMWaitWindow = () => dispatch => {
    dispatch({
        type: OPEN_PM_WAIT_WINDOW,
        payload: true
    })
}

export const closePMWaitWindow = () => dispatch => {
    dispatch({
        type: CLOSE_PM_WAIT_WINDOW,
        payload: false
    })
}

export const setPMWaitWindowTableRows = waitWindowTableRows => dispatch => {
    dispatch({
        type: SET_PM_WAIT_WINDOW_TABLE_ROWS,
        payload: waitWindowTableRows
    })
}


export const openPMConfirmWindow = () => dispatch => {
    dispatch({
        type: OPEN_PM_CONFIRM_WINDOW,
        payload: true
    })
}

export const closePMConfirmWindow = () => dispatch => {
    console.log('closePMConfirmWindow')
    dispatch({
        type: CLOSE_PM_CONFIRM_WINDOW,
        payload: false
    })
}



// REQUESTER //

export const setPMRequesterSocketID = requesterSocketID => dispatch => {
    dispatch({
        type: SET_PM_REQUESTER_SOCKET_ID,
        payload: requesterSocketID
    })
}