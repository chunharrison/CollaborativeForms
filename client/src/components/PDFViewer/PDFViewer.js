import React, { Component } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Spinner from 'react-bootstrap/Spinner';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
 
class PDFViewer extends Component {
  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
  }

  state = {
    numPages: null,
    pageNumber: 1,
  }
 
  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }
  
  renderPages = (renderFive) => {
    let pagesList = []
    let pagesToRender;

    if (renderFive !== null) {
      pagesToRender = 5;
    } else {
      pagesToRender = this.state.numPages;
    }
    
    for (let i = 1; i <= pagesToRender; i++) {
      pagesList.push( <div key={i}>
                        <Page 
                          scale={1.5}
                          pageNumber={i}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className={(i-1).toString()}
                        />
                      </div>)
      
    }

    return pagesList
  }

  render() {

    let output
    if (this.state.numPages <= 50) {
      output = <Document
          file={this.props.selectedFile}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={ (ref) => { this.wrapperRef = ref; } }
          loading={<Spinner animation="border" variant="primary"/>}
        >
          { this.renderPages(this.props.renderFive) }
        </Document>
    } else {
      output = <h3 className="too-large-pdf">You can't upload a PDF document that has more than 50 pages.</h3>
    }
    
    return (
      <div>
        {output}
      </div>
    );
  }
}

export default PDFViewer;
