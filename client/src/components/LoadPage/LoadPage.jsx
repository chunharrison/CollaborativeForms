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

        if (pageRendered && !fabricRendered) {
            props.renderFabricCanvas(
                props.dataURLFormat,
                props.pageNum, 
                props.width, 
                props.height,
                props.socket,
                props.roomCode
            )
            setFabricRendered(true)
        }
    });

    return (<div 
                className='page-and-number-container' id={`container-${props.pageNum}`}
                style= {{
                    width:(props.width !== 0 ? props.width : 595),
                    minHeight:(props.height !== 0 ? props.height : 842)
                }}>
                <div 
                    className='page-wrapper' 
                    style={{
                        width:(props.width !== 0 ? props.width : 595),
                        minHeight:(props.height !== 0 ? props.height : 842)
                    }}
                    ref={setRefs}>
                    {(oneSecondReached) ? (
                        <Page 
                            scale={1.5}
                            pageNumber={props.pageNum}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className={props.pageNum.toString()}
                            onRenderSuccess={() => setPageRenderd(true)}
                        />
                        
                    ) : null }
                </div>
                <p className='page-number'>{props.pageNum}</p>
            </div>)
}

export default LoadPage;