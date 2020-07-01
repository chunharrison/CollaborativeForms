import { 
    SET_CURRENT_DOC, 
    SET_CANVAS_CONTAINER_REF,
    SET_NUM_PAGES, 
    SET_RENDERFABRICCANVAS_FUNC,
    SET_PAGE_DIMENSIONS,
} from '../actions/types'

const initialState = {
    currentDoc: null,
    canvasContainerRef: null,
    numPages: 0,   // number of pages the document have
    // pagesArray: [],  // array of page numbers in an ascending order
    renderFabricCanvas: null,
    pageDimensions: []
}

export default function(state = initialState, action) {
    switch(action.type) {

        case SET_CURRENT_DOC:
            return {
                ...state,
                currentDoc: action.payload
            }

        case SET_CANVAS_CONTAINER_REF:
            return {
                ...state,
                canvasContainerRef: action.payload
            }

        case SET_NUM_PAGES:
            return {
                ...state,
                numPages: action.payload
            }

        case SET_RENDERFABRICCANVAS_FUNC:
            return {
                ...state,
                renderFabricCanvas: action.payload
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