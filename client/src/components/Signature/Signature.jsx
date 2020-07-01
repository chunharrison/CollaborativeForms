import React, {useRef} from "react";
import Popup from "reactjs-popup";
import SignaturePad from 'react-signature-canvas';
import signatureImg from './signature.png'

function Signature(props) {
  const sigCanvas = useRef({});
  const clear = () => sigCanvas.current.clear();
  const save = (e) => props.setURL(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'), e);

  return (
    <div id='signature-canvas-container'>
      <Popup contentStyle={{width: "700px", height:'250px', padding: "0px"}}
      modal 
      trigger={<button className='tool-large' id='signature-tool'><img src={signatureImg}></img></button>}
      closeOnDocumentClick={false}
      >
        {close => (
          <>
            <p className='text-popup'>Draw Signature</p>
            <SignaturePad ref={sigCanvas} id='signature-canvas' 
            canvasProps={{className: 'signature-canvas'}} />
            <div className='popup-button-container'>
              <button className='popup-button' onClick={close}>Close</button>
              <button className='popup-button' onClick={clear}>Clear</button>
              <button className='popup-button' onClick={(e) => {
                  save(e);
                  close();
              }}>Done</button>
            </div>
          </>
        )}
      </Popup>
      
    </div>
  );
}

export default Signature;