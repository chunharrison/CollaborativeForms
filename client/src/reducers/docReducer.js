import { SET_CURRENT_DOC, SET_PAGE_DIMENSIONS } from '../actions/types'

const initialState = {
    currentDoc: null,
    numPages: 0,   // number of pages the document have
    pagesArray: [],  // array of page numbers in an ascending order
    pageDimensions: []
}

export default function(state = initialState, action) {
    switch(action.type) {

        case SET_CURRENT_DOC:
            return {
                ...state,
                currentDoc: action.payload
            }

        case SET_PAGE_DIMENSIONS:
            return {
                ...state,
                pageDimensions: action.payload
            }
        
        default:
            return state;
    }
}