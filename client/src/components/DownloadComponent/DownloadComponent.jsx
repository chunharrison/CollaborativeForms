import React, { Component } from 'react';
import axios from 'axios';
import PDFViewer from '../PDFViewer/PDFViewer'

export default class DisplayImage extends Component {
  state = { message: '' };

  formHandler = e => {
    e.preventDefault();
    this.setState({ message: 'Loading...' });
    const filename = document.querySelector('#filename').value;
    const generateGetUrl = 'http://localhost:5000/generate-get-url';
    const options = {
      params: {
        Key: filename,
        ContentType: 'application/pdf'
      },
      headers: {
        'Access-Control-Allow-Credentials' : true,
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET',
        'Access-Control-Allow-Headers':'application/pdf',
      },
    };
    axios.get(generateGetUrl, options).then(res => {
      const { data: getURL } = res;
      this.setState({ getURL });
      fetch(getURL)
      .then(response => response.blob()).then((blob) => {
        this.setState({blob})
      })
    });
  };

  handleImageLoaded = () => {
    this.setState({ message: 'Done' });
  };

  handleImageError = () => {
    this.setState({ message: 'Sorry, something went wrong. Please check if the remote file exists.' });
  };

  render() {
    const { getURL, message } = this.state;
    return (
      <React.Fragment>
        <h1>Retrieve PDF from S3 Bucket</h1>
        <form onSubmit={this.formHandler}>
          <label> Image name:</label>
          <input id='filename' />
          <p>
            <i>PDF must include extension .pdf</i>
          </p>
          <button>Load</button>
        </form>
        <p>{message}</p>
        <PDFViewer selectedFile={this.state.blob}/>
      </React.Fragment>
    );
  }
}