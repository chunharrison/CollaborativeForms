import React, { Component } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
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
                        pageNumber={i}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className={(i-1).toString()}
                        scale={1.5}
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
        >
          { this.renderPages() }
        </Document>
      </div>
    );
  }
}

export default PDFViewer;
