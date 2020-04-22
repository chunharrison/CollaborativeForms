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
  
  renderPages = () => {
    let pagesList = []

    for (let i = 1; i <= this.state.numPages; i++) {
      pagesList.push(<Page 
                        scale={1.5}
                        pageNumber={i}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className={(i-1).toString()}
                      />)
      
    }

    return pagesList
  }

  render() {
    
    return (
      <div>
        <Document
          file={this.props.selectedFile}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={ (ref) => { this.wrapperRef = ref; } }
          loading={<Spinner animation="border" variant="primary" />}
        >
          { this.renderPages() }
        </Document>
      </div>
    );
  }
}

export default PDFViewer;
