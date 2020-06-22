import React, { useRef, useCallback, useState, useEffect } from 'react'

// Components
import { Page } from 'react-pdf';

// Libraries
import { useInView } from 'react-intersection-observer'

// props: pageNum, dataURLFormat, width, height
function LoadPage(props) {
    
    const ref = useRef()
    const [inViewRef, inView, entry] = useInView()
    const [oneSecondReached, setOneSecondReached] = useState(false);
    const [pageRendered, setPageRenderd] = useState(false);
    const [fabricRendered, setFabricRendered] = useState(false);

    const [pageLoaded, setPageLoaded] = useState(false);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);

    const [scale, setScale] = useState(1);

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
            // console.log(pageWidth, pageHeight)
            props.renderFabricCanvas(
                props.dataURLFormat,
                props.pageNum, 
                pageWidth, 
                pageHeight,
                props.socket,
                props.roomCode
            )
            setFabricRendered(true)
        }
    });

    function onPageLoadSuccess(page) {
        setPageWidth(page.view[2])
        setPageHeight(page.view[3])
        setPageLoaded(true)
    }

    function zoomIn(e) {
        e.preventDefault()
        setScale(1.5)
    }

    function zoomOut(e) {
        e.preventDefault()
        setScale(0.5)
    }

    return (<div 
                className='page-and-number-container' id={`container-${props.pageNum}`}
                >
                    <div 
                        className='page-wrapper' id={`wrapper-${props.pageNum}`} 
                        ref={setRefs}>
                    {
                        (oneSecondReached) 
                        ? 
                        (
                        <div className="father-of-two">
                        {/* PDF CANVAS */}
                        <Page 
                            scale={scale}
                            pageNumber={props.pageNum}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className={'lowest-canvas'}
                            onLoadSuccess={(page) => onPageLoadSuccess(page)}
                            onRenderSuccess={() => setPageRenderd(true)}
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
                        null
                    }
                    </div> 
                <p className='page-number'>{props.pageNum}</p>
                {
                    (props.pageNum === 3)
                    ?
                    (<div>
                    <button onClick={e => zoomIn(e)}>zoom in</button>
                    <button onClick={e => zoomOut(e)}>zoom out</button>
                    </div>)
                    :
                    null
                }
            </div>)
}

export default LoadPage;