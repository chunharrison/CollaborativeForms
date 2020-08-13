import { GET_ERRORS } from "./types"

export const setError = (error) => dispatch => {
    dispatch({
        type: GET_ERRORS,
        payload: error
    })
}