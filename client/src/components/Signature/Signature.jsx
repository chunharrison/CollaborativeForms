import React, {useRef, useState} from "react";
import SignaturePad from 'react-signature-canvas';
import signatureImg from './signature.png'

import { connect } from 'react-redux';
import { setToolMode, setPrevToolMode } from '../../actions/toolActions';

const Signature = props => {
  const sigCanvas = useRef({});
  const clear = () => sigCanvas.current.clear();
  const save = (e) => props.setURL(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'), e);
  const [popup, setPopup] = useState(false);

  function toggleSignature(e) {
    setPopup(!popup);
    props.setToolMode('signature');
    props.setPrevToolMode('select');
  }

  return (
    <div id='signature-canvas-container'>
      <button className='tool-large' id='signature-tool' onClick={toggleSignature}>
        <img src={signatureImg}></img>
      </button>
      { popup ?
        <div className='popup-overlay' >
          <div className='signature-popup'>
            <p className='text-popup'>Draw Signature</p>
            <SignaturePad ref={sigCanvas} id='signature-canvas' 
            canvasProps={{className: 'signature-canvas'}} />
            <div className='popup-button-container'>
              <button className='popup-button' onClick={toggleSignature}>Close</button>
              <button className='popup-button' onClick={clear}>Clear</button>
              <button className='popup-button' onClick={(e) => {
                  save(e);
                  toggleSignature();
              }}>Create</button>
            </div>  
          </div>
        </div>
      : null}      
    </div>
  );
}

const mapStateToProps = state => ({
  toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
  setToolMode,
  setPrevToolMode,
})(Signature);