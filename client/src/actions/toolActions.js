import { SET_CURRENT_ZOOM } from './types'

export const setCurrentZoom = newZoom => dispatch => {
    dispatch({
        type: SET_CURRENT_ZOOM,
        payload: newZoom
    })
}