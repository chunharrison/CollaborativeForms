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
    SET_TEXT_FONT_SIZE,
    ADD_HIGHLIGHT,
    ADD_COMMENT,
    ADD_PAGE_HIGHLIGHT,
    DELETE_HIGHLIGHT,
    SET_PANEL_MODE } from '../actions/types'

import { omit } from 'lodash';

const initialState = {
    //zoom
    currentZoom: 1,
    pagesZooms: [],

    //panel
    panelToggle: false,
    panelMode: 'page',

    //general
    toolMode: 'select',
    prevToolMode:'select',
    isDown: false,
    clientX: 0,
    clientY: 0,
    scrollX:0,
    scrollY:0,

    //shape
    shape: null,
    shapeBorderThickness: 1,
    shapeOpacity: 100,
    shapeBorderColor: 'rgb(0, 0, 0)',
    shapeFillColor: 'rgb(0, 0, 0)',
    shapeFocus: 'fill',

    //draw
    drawOpacity: 100,
    drawColor: 'rgb(0, 0, 0)',
    drawBrushSize: 1,

    //text
    textColor: 'rgb(0, 0, 0)',
    textOpacity: 100,
    textFontSize: 12,

    //highlighter
    highlightDict: {},
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_CURRENT_ZOOM:
            return {
                ...state,
                currentZoom: action.payload
            }
        case UPDATE_PAGES_ZOOMS:
            return {
                ...state,
                pagesZooms: action.payload
            }
        
        case SET_PANEL_TOGGLE:
            return {
                ...state,
                panelToggle: action.payload
            }
        case SET_TOOL_MODE:
            return {
                ...state,
                toolMode: action.payload
            }
        case SET_PREV_TOOL_MODE:
            return {
                ...state,
                prevToolMode: action.payload
            }
        case SET_IS_DOWN:
            return {
                ...state,
                isDown: action.payload
            }
        case SET_CLIENT_X:
            return {
                ...state,
                clientX: action.payload
            }
        case SET_CLIENT_Y:
            return {
                ...state,
                clientY: action.payload
            }
        case SET_SHAPE:
            return {
                ...state,
                shape: action.payload
            }
    
        case SET_SHAPE_BORDER_THICKNESS:
            return {
                ...state,
                shapeBorderThickness: action.payload
            }
        case SET_SHAPE_OPACITY:
            return {
                ...state,
                shapeOpacity: action.payload
            }
        case SET_SHAPE_BORDER_COLOR:
            return {
                ...state,
                shapeBorderColor: action.payload
            }
        case SET_SHAPE_FILL_COLOR:
            return {
                ...state,
                shapeFillColor: action.payload
            }
        case SET_SHAPE_FOCUS:
            return {
                ...state,
                shapeFocus: action.payload
            }
        case SET_DRAW_OPACITY:
            return {
                ...state,
                drawOpacity: action.payload
            }
        case SET_DRAW_BRUSH_SIZE:
            return {
                ...state,
                drawBrushSize: action.payload
            }
        case SET_DRAW_COLOR:
            return {
                ...state,
                drawColor: action.payload
            }
        case SET_TEXT_COLOR:
            return {
                ...state,
                textColor: action.payload
            }
        case SET_TEXT_OPACITY:
            return {
                ...state,
                textOpacity: action.payload
            }
        case SET_TEXT_FONT_SIZE:
            return {
                ...state,
                textFontSize: action.payload
            }
        case ADD_HIGHLIGHT:
            return {
                ...state,
                highlightDict: {
                  ...state.highlightDict, [action.payload.key]: {
                      ...state.highlightDict[action.payload.key], [action.payload.id]: [action.payload.values, action.payload.text, '']
                    }
                }
            }
        case ADD_COMMENT:
            return {
                ...state,
                highlightDict: {
                    ...state.highlightDict, [action.payload.key]: {
                        ...state.highlightDict[action.payload.key], [action.payload.id]: [action.payload.values, action.payload.text, action.payload.comment]
                    }
                }
            }
        case ADD_PAGE_HIGHLIGHT:
            return {
                ...state,
                highlightDict: {
                    ...state.highlightDict, [action.payload.key]: action.payload.values
                }
            }
 
        case DELETE_HIGHLIGHT:
            return {
                ...state,
                highlightDict: {
                    ...state.highlightDict, [action.payload.key]: omit(state.highlightDict[action.payload.key], action.payload.id)
                }
            }

        case SET_PANEL_MODE:
            return {
                ...state,
                panelMode: action.payload
            }
    
            
        default:
            return state;
    }
}