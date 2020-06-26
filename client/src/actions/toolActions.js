import { SET_ZOOM } from './types'

export const setZoom = newZoom => dispatch => {
    dispatch({
        type: SET_ZOOM,
        payload: newZoom
    })
}