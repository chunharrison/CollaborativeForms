import React, { Component } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactDOM from "react-dom";

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
                      />)
    }
    return pagesList
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    let canvases = this.wrapperRef.getElementsByClassName('react-pdf__Page__canvas')
    console.log(canvases)
    console.log(canvases.length) // length -> 0
    console.log(canvases.item(0)) // element -> null
    console.log(canvases[0]) // element -> undefined
    for (let i = 0; i < 4; i++) {
    }
  }

  render() {
    const { pageNumber, numPages } = this.state;
 
    return (
      <div>
        <Document
          file="./documents/sample.pdf"
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
