import React, { useRef } from 'react';

// Components
import PDFViewer from '../PDFViewer/PDFViewer';
import LoadPage from '../LoadPage/LoadPage';

// Libraries
import { Document, Page } from 'react-pdf';
import { InView, useInView } from 'react-intersection-observer';

// PDF document (for dev)
import PDF from '../docs/sample.pdf';

class CollabPageNew extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Document info
            numPages: 0,
            width: 0,
            originalWidth: 0,
            height: 0,
            originalHeight: 0
        }

        this.inViewElements = null;

        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.onPageLoadSuccess = this.onPageLoadSuccess.bind(this);
        // this.createInViewElements = this.createInViewElements(this);
    }
    
    
    /* ################################################################################################################
    ################################################## Class Methods ##################################################
    ################################################################################################################ */

    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    onDocumentLoadSuccess = (pdf) => {
        this.setState({
            numPages: pdf.numPages
        }) 
    }

    // procs when the first page is successfully loaded by the Page component from react-pdf
    // retrieves the (scaled and orignal) width, height and store them in state
    onPageLoadSuccess = (page) => {
        this.setState({
            width: page.width,
            originalWidth: page.originalWidth,
            height: page.height,
            originalHeight: page.originalHeight
        })
    }

    // generates InView elements (with wrapper) for each pages for the document after the first page loads
    // this is so that the pages do not render all at once only when the page is in view of the browser window
    createInViewElements = (numPages, width, height) => {
        // const { width, height } = this.state
        let InViewElementList = [];

        for (let pageID = 1; pageID < numPages; pageID++) {

            InViewElementList.push(
                <LoadPage
                    pageID={pageID}
                    width={width}
                    height={height}
                />
            )
        }

        console.log(InViewElementList)
        return InViewElementList;
    }

    /* ################################################################################################################
    ################################################################################################################ */

    componentDidUpdate(prevProps, prevState) {
        // if (prevState.numPages !== this.state.numPages && this.state.numPages !== 0) {
        //     console.log('in componentDidUpdate', this.state.numPages)
        //     this.inViewElements = this.createInViewElements(this.state.numPages);
        //     console.log(this.inViewElements)
        // }
    }

    render() {
        // State Variables 
        const { numPages, width, height } = this.state;

        // Main document element
        var inViewElement = <p></p>
        if (numPages !== 0) {
            this.inViewElements = this.createInViewElements(numPages, width, height);
            // console.log(inViewElement)
        }


        return (
            <Document
                file={PDF}
                onLoadSuccess={(pdf) => this.onDocumentLoadSuccess(pdf)}
            >
                <div className='body-container'>
                    {/* <div id='browser-canvas-container'>
                        {pageBrowser}
                    </div> */}
                    <div id='canvas-container'>
                        {/* just render the first page to get width and height data */}
                        <div className='page-and-number-container'>
                            <div key={1}>
                                <Page 
                                    scale={1.5}
                                    pageNumber={1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className={'0'}
                                    onLoadSuccess={(page) => this.onPageLoadSuccess(page)}
                                />
                            </div>
                        </div>
                        {/* rest of the pages are to be loaded if they are in view */}
                        {this.inViewElements}
                    </div>
                </div>
            </Document>
            // <PDFViewer selectedFile={PDF}></PDFViewer>
        )
    }
}

export default CollabPageNew