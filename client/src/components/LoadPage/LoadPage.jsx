import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { Page } from 'react-pdf';
 
function LoadPage(props) {
    
    const ref = useRef()
    const [inViewRef, inView] = useInView({ 
        triggerOnce: true 
    })
    const [oneSecondReached, setOneSecondReached] = useState(false);

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

    let timeOut;
    useEffect(() => {
        clearTimeout(timeOut)
        timeOut = setTimeout(() => setOneSecondReached(true), 1000)
    });

    return (<div 
        className='page-and-number-container'
        style={{
            "width": Math.max(props.width, 595) ,
            "minHeight": Math.max(props.height, 842) 
        }}
        ref={setRefs}>
        <div key={props.pageID+1}>
            {inView && oneSecondReached ? (
                <Page 
                    scale={1.5}
                    pageNumber={props.pageID}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className={(props.pageID-1).toString()}
                />
            ) : null }
        </div>
        <p className='page-number'>{props.pageID + 1}</p>
    </div>)
}

export default LoadPage;