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

    SET_PM_WAIT_WINDOW_TABLE_ROWS,
} from './types'

export const activatePM = () => dispatch => {
    dispatch({
        type: PM_ACTIVATED,
        payload: true
    })
}

export const deactivatePM = () => dispatch => {
    dispatch({
        type: PM_DEACTIVATED,
        payload: false
    })
}

export const setPMIsDriver = (bool) => dispatch => {
    dispatch({
        type: SET_PM_IS_DRIVER,
        payload: bool
    })
}

export const setPMDriverName = (driverName) => dispatch => {
    dispatch({
        type: SET_PM_DRIVER_NAME,
        payload: driverName
    })
}

export const setPMButton = (pmButtomLabel, pmButtonVariant) => dispatch => {
    dispatch({
        type: SET_PM_BUTTON,
        payload: {
            pmButtomLabel,
            pmButtonVariant
        }
    })
}

export const updatePMNumAccepts = numAccepts => dispatch => {
    dispatch({
        type: UPDATE_PM_NUM_ACCEPTS,
        payload: numAccepts
    })
}


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

export const setPMRequesterInfo = (requesterUserName, requesterSocketID) => dispatch => {
    dispatch({
        type: SET_PM_REQUESTER_INFO,
        payload: {
            requesterUserName,
            requesterSocketID
        }
    })
}

export const setPMCurrNumGuests = (currNumGuests) => dispatch => {
    dispatch({
        type: SET_PM_CURR_NUM_GUESTS,
        payload: currNumGuests
    })
}

export const setPMWaitWindowTableRows = (waitWindowTableRows) => dispatch => {
    dispatch({
        type: SET_PM_WAIT_WINDOW_TABLE_ROWS,
        payload: waitWindowTableRows
    })
}