import React, { useState } from 'react'

// Components
import { Document } from 'react-pdf'; // open source
import LoadPage from '../LoadPage/LoadPage'

// Libraries
import { useInView } from 'react-intersection-observer'

// Redux
import { connect } from 'react-redux';
import { setNumPages, setPageDimensions } from '../../../actions/docActions';
import { setIsDown, setClientX, setClientY } from '../../../actions/toolActions';


const LoadDoc = (props) => {

    // TODO: chagne this to something else (HARRISON)
    const [pagesArray, setPagesArray] = useState([]);

    function onMouseDown(e) {
        props.setIsDown(true);
        props.setClientX(e.clientX);
        props.setClientY(e.clientY);
    }

    function onMouseUp(e) {
        props.setIsDown(false);
    }

    function onMouseMove(e) {
        if (props.isDown) {
            if (props.toolMode === 'pan') {
                e.preventDefault();
                props.canvasContainerRef.current.scrollLeft = props.canvasContainerRef.current.scrollLeft + (props.clientX - e.clientX);
                props.canvasContainerRef.current.scrollTop = props.canvasContainerRef.current.scrollTop + (props.clientY - e.clientY);
            }
            props.setClientX(e.clientX);
            props.setClientY(e.clientY);    
        }
    }
    
    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    function onDocumentLoadSuccess(pdf) {
        props.setNumPages(pdf.numPages)

        const pagesArray = Array.from(Array(pdf.numPages), (_, i) => i + 1) // [1, 2, ..., pdf.numPages]
        setPagesArray(pagesArray)

        let dimensionsArray = new Array(pdf.numPages)
        props.setPageDimensions(dimensionsArray)
    }

    const documentLoader = <div style={{ height: '500px' }}>
        <div class="loader-wrapper">
            <span class="circle circle-1"></span>
            <span class="circle circle-2"></span>
            <span class="circle circle-3"></span>
            <span class="circle circle-4"></span>
            <span class="circle circle-5"></span>
            <span class="circle circle-6"></span>
        </div>
    </div>

    return (<Document
        file={props.currentDoc}
        onLoadSuccess={(pdf) => onDocumentLoadSuccess(pdf)}
        loading={documentLoader}>  
            <div id='canvas-container' 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            ref={props.canvasContainerRef}>
                {/* Render the pages of the PDF */}
                {
                    pagesArray.map((pageNum, i) => {
                        return <LoadPage pageNum={pageNum} />
                    })
                }
            </div>
    </Document>)
}


const mapStateToProps = state => ({
    currentDoc: state.doc.currentDoc,
    canvasContainerRef: state.doc.canvasContainerRef,
    isDown: state.tool.isDown,
    clientX: state.tool.clientX,
    clientY: state.tool.clientY,
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setNumPages,
    setPageDimensions,
    setIsDown,
    setClientX,
    setClientY, 
})(LoadDoc);