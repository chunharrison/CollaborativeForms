import React, { useRef, useCallback, useState, useEffect } from 'react'

// Components
import { Page } from 'react-pdf';

// Libraries
import { useInView } from 'react-intersection-observer'

// Redux
import { connect } from 'react-redux'
import { 
    setPageDimensions,
 } from '../../../actions/docActions'

import {
    setPagesZooms
} from '../../../actions/toolActions'
import { set } from 'lodash';

// props: pageNum, dataURLFormat, width, height
const LoadPage = (props) => {
    
    // page inview
    const ref = useRef()
    const [inViewRef, inView, entry] = useInView({
        threshold: 0,
        triggerOnce: false,
    })
    const [oneSecondReached, setOneSecondReached] = useState(false);

    // pages
    const [pageLoaded, setPageLoaded] = useState(false); // page loaded -> callback with page info
    const [pageRendered, setPageRenderd] = useState(false); // page rendered on the website
    const [fabricRendered, setFabricRendered] = useState(false);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const [pagesZooms, setPagesZooms] = useState(props.pagesZooms)

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
        // clear the timeout so when the person leaves the pages before 1s
        if (entry) {
            // props.currentZoom !== props.pagesZooms[props.pageNum - 1]
            // console.log(props.pageNum, inView, entry)
            if (inView) {
                console.log(props.pageNum, inView, entry)
                // console.log(props.pageNum, props.pagesZooms)
                // console.log(props.pagesZooms)
                // console.log(props.currentZoom, props.pagesZooms[props.pageNum - 1])
                var pagesZoomsTemp = props.pagesZooms
                // console.log('pagesZoomsTemp BEFORE', pagesZoomsTemp)
                pagesZoomsTemp[props.pageNum - 1] = props.currentZoom
                // console.log('pagesZoomsTemp AFTER', pagesZoomsTemp)
                props.setPagesZooms(pagesZoomsTemp)
            }

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
            
            // console.log(props.renderFabricCanvas, typeof props.renderFabricCanvas)
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
        props.setPageDimensions(newPageDimensions)
        setPageLoaded(true)
    }

    return (<div className='page-and-number-container' id={`container-${props.pageNum}`}>

                {
                        (oneSecondReached) 
                    ? 
                        (<div className="father-of-two">
                            {/* PDF CANVAS */}
                            <Page 
                                scale={props.pagesZooms[props.pageNum - 1]}
                                pageNumber={props.pageNum}
                                // renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={'lowest-canvas'}
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
    setPagesZooms
})(LoadPage);