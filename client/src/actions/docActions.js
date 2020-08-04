import { 
    SET_CURRENT_DOC, 
    SET_CANVAS_CONTAINER_REF,
    // SET_PAGES_ARRAY, 
    SET_RENDERFABRICCANVAS_FUNC,
    SET_NUM_PAGES,
    SET_PAGE_DIMENSIONS,
    SET_PAGE_DIMENSIONS_CHANGE 
} from './types'


export const setCurrentDoc = currentDoc => dispatch => {
    dispatch({
        type: SET_CURRENT_DOC,
        payload: currentDoc
    })
}

export const setCanvasContainerRef = ref => dispatch => {
    dispatch({
        type: SET_CANVAS_CONTAINER_REF,
        payload: ref
    })
}

export const setNumPages = numPages => dispatch => {
    dispatch({
        type: SET_NUM_PAGES,
        payload: numPages
    })
}

// export const setPagesArray = pagesArray => dispatch => {
//     dispatch({
//         type: SET_PAGES_ARRAY,
//         payload: pagesArray
//     })
// }

export const setRenderFabricCanvasFunc = renderFabricCanvas => dispatch => {
    dispatch({
        type: SET_RENDERFABRICCANVAS_FUNC,
        payload: renderFabricCanvas
    })
}

export const setPageDimensions = newPageDimensions => dispatch => {
    dispatch({
        type: SET_PAGE_DIMENSIONS,
        payload: newPageDimensions
    })
}

export const setPageDimensionsChange = newPageDimensions => dispatch => {
    dispatch({
        type: SET_PAGE_DIMENSIONS_CHANGE,
        payload: newPageDimensions
    })
}

