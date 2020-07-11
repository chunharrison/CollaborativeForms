import { SET_CURRENT_ZOOM, 
    UPDATE_PAGES_ZOOMS,
    SET_PANEL_TOGGLE, 
    SET_TOOL_MODE, 
    SET_PREV_TOOL_MODE, 
    SET_IS_DOWN, 
    SET_CLIENT_X, 
    SET_CLIENT_Y,
    SET_SHAPE, 
    SET_SHAPE_BORDER_THICKNESS, 
    SET_SHAPE_BORDER_COLOR, 
    SET_SHAPE_FILL_COLOR, 
    SET_SHAPE_OPACITY,
    SET_SHAPE_FOCUS,
    SET_DRAW_OPACITY,
    SET_DRAW_BRUSH_SIZE,
    SET_DRAW_COLOR,
    SET_TEXT_COLOR,
    SET_TEXT_OPACITY,
    SET_TEXT_FONT_SIZE, } from './types'

export const setCurrentZoom = newZoom => dispatch => {
    dispatch({
        type: SET_CURRENT_ZOOM,
        payload: newZoom
    })
}

export const setPagesZooms = newPagesZooms => dispatch => {
    dispatch({
        type: UPDATE_PAGES_ZOOMS,
        payload: newPagesZooms
    })
}


export const setPanelToggle = panelToggle => dispatch => {
    dispatch({
        type: SET_PANEL_TOGGLE,
        payload: panelToggle
    })
}

export const setToolMode = toolMode => dispatch => {
    dispatch({
        type: SET_TOOL_MODE,
        payload: toolMode
    })
    return Promise.resolve();
}

export const setPrevToolMode = prevToolMode => dispatch => {
    dispatch({
        type: SET_PREV_TOOL_MODE,
        payload: prevToolMode
    })
    return Promise.resolve();
}

export const setIsDown = isDown => dispatch => {
    dispatch({
        type: SET_IS_DOWN,
        payload: isDown
    })
}

export const setClientX = clientX => dispatch => {
    dispatch({
        type: SET_CLIENT_X,
        payload: clientX
    })
}

export const setClientY = clientY => dispatch => {
    dispatch({
        type: SET_CLIENT_Y,
        payload: clientY
    })
}

export const setShapeBorderThickness = shapeBorderThickness => dispatch => {
    dispatch({
        type: SET_SHAPE_BORDER_THICKNESS,
        payload: shapeBorderThickness
    })
}

export const setShapeBorderColor = shapeBorderColor => dispatch => {
    dispatch({
        type: SET_SHAPE_BORDER_COLOR,
        payload: shapeBorderColor
    })
}

export const setShapeOpacity = shapeOpacity => dispatch => {
    dispatch({
        type: SET_SHAPE_OPACITY,
        payload: shapeOpacity
    })
}

export const setShapeFillColor = shapeFillColor => dispatch => {
    dispatch({
        type: SET_SHAPE_FILL_COLOR,
        payload: shapeFillColor
    })
}

export const setShapeFocus = shapeFocus => dispatch => {
    dispatch({
        type: SET_SHAPE_FOCUS,
        payload: shapeFocus
    })
}

export const setShape = shape => dispatch => {
    dispatch({
        type: SET_SHAPE,
        payload: shape
    })
}

export const setDrawOpacity = drawOpacity => dispatch => {
    dispatch({
        type: SET_DRAW_OPACITY,
        payload: drawOpacity
    })
}

export const setDrawBrushSize = drawOpacity => dispatch => {
    dispatch({
        type: SET_DRAW_BRUSH_SIZE,
        payload: drawOpacity
    })
}

export const setDrawColor = drawColor => dispatch => {
    dispatch({
        type: SET_DRAW_COLOR,
        payload: drawColor
    })
}

export const setTextColor = textColor => dispatch => {
    dispatch({
        type: SET_TEXT_COLOR,
        payload: textColor
    })
}

export const setTextOpacity = textOpacity => dispatch => {
    dispatch({
        type: SET_TEXT_OPACITY,
        payload: textOpacity
    })
}

export const setTextFontSize = textFontSize => dispatch => {
    dispatch({
        type: SET_TEXT_FONT_SIZE,
        payload: textFontSize
    })
}