import axios from "axios";

import {
    GET_ERRORS
} from "./types"

export const sendMessage = (emailData) => dispatch => {
    axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/emails/send-message`, emailData)
        .then(res => {
            return res;
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        });
}

export const sendErrors = (err) => dispatch => {
    dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    })
}

export const bugReport = (emailData) => dispatch => {
    axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/emails/bug-report`, emailData)
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    });
}
