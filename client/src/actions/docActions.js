import { SET_CURRENT_DOC, SET_PAGE_DIMENSIONS } from './types'


export const setCurrentDoc = currentDoc => dispatch => {
    dispatch({
        type: SET_CURRENT_DOC,
        payload: currentDoc
    })
}

export const setPageDimensions = newPageDimensions => dispatch => {
    dispatch({
        type: SET_PAGE_DIMENSIONS,
        payload: newPageDimensions
    })
}

