import React, { useRef, useCallback, useState, useEffect } from 'react'

// Components
import Highlighter from '../../Highlighter/Highlighter';
import { Page } from 'react-pdf';
import nanoid from 'nanoid';

// Libraries
import { useInView } from 'react-intersection-observer';

// Redux
import { connect } from 'react-redux';
import { 
    setPageDimensions,
    setPageDimensionsChange,
 } from '../../../actions/docActions';

import {
    setPagesZooms,
    addComment,
} from '../../../actions/toolActions';
import { set } from 'lodash';

// props: pageNum, dataURLFormat, width, height
const LoadPage = (props) => {
    
    // page inview
    const ref = useRef()
    const [inViewRef, inView, entry] = useInView()
    const [oneSecondReached, setOneSecondReached] = useState(false);

    // pages
    const [pageLoaded, setPageLoaded] = useState(false); // page loaded -> callback with page info
    const [pageRendered, setPageRenderd] = useState(false); // page rendered on the website
    const [fabricRendered, setFabricRendered] = useState(false);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const [pagesZooms, setPagesZooms] = useState(props.pagesZooms)
    const [thisPageZoom, setThisPageZoom] = useState(1)

    // Use `useCallback` so we don't recreate the function on each render - Could result in infinite loop
    const setRefs = useCallback(
        (node) => {
            // Ref's from useRef needs to have the node assigned to `current`
            ref.current = node
            // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
            inViewRef(node)
        },
        [inViewRef],
    )

    // timeout for the 1 second delay
    // this is for when a user scrolls down the document quickly enough 
    // that it is unneccary to render the pages
    useEffect(() => {

        // props.currentZoom !== props.pagesZooms[props.pageNum - 1]
        if (inView && props.currentZoom !== thisPageZoom) {
            setThisPageZoom(props.currentZoom)
        }


        // clear the timeout so when the person leaves the pages before 1s
        if (entry) {
            entry.target.dataset.visible = inView;

            if (inView && !entry.target.firstChild) {
                setTimeout(() => {
                    if (entry.target.dataset.visible === 'true') {
                        setOneSecondReached(true)
                    }
                }, 1000)
            }
        }


        if (pageLoaded && pageRendered && !fabricRendered) {
            
            props.renderFabricCanvas(
                props.pageNum,
                pageWidth,
                pageHeight,

            )

            setFabricRendered(true)
        }
    });


    function onPageLoadSuccess(page) {
        setPageWidth(page.view[2])
        setPageHeight(page.view[3])
        let newPageDimensions = props.pageDimensions
        newPageDimensions[props.pageNum - 1] = { 'width': page.view[2],  'height': page.view[3]}
        props.setPageDimensions(newPageDimensions);
        props.setPageDimensionsChange(props.pageNum);
        setPageLoaded(true)
    }

    return (<div className='page-and-number-container' id={`container-${props.pageNum}`}>

                {
                        (oneSecondReached) 
                    ? 
                        (<div className="father-of-two" ref={setRefs} >
                            {/* HIGHLIGHT LAYER */}
                            <Highlighter
                                pageNum={props.pageNum}
                            />
                            {/* PDF CANVAS */}
                            <Page 
                                scale={thisPageZoom}
                                pageNumber={props.pageNum}
                                // renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={`lowest-canvas pdf-${props.pageNum}`}
                            />

                            {/* FABRIC CANVAS */}
                            <Page 
                                scale={1}
                                pageNumber={props.pageNum}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={props.pageNum.toString()}
                                onLoadSuccess={(page) => onPageLoadSuccess(page)}
                                onRenderSuccess={() => setPageRenderd(true)}
                            />
                        </div>) 
                    : 
                        <div 
                            className='page-wrapper' id={`wrapper-${props.pageNum}`} 
                            ref={setRefs} />
                }
                <p className='page-number'>{props.pageNum}</p>

            </div>)
}

const mapStateToProps = state => ({
    // room
    userSocket: state.room.userSocket,

    // doc
    renderFabricCanvas: state.doc.renderFabricCanvas,
    numPages: state.doc.numPages,
    pageDimensions: state.doc.pageDimensions,

    // tools
    currentZoom: state.tool.currentZoom,
    pagesZooms: state.tool.pagesZooms,
})

export default connect(mapStateToProps, {
    setPageDimensions,
    setPagesZooms,
    addComment,
    setPageDimensionsChange
})(LoadPage);