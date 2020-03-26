import React, {useRef} from "react";
import Popup from "reactjs-popup";
import SignaturePad from 'react-signature-canvas';

function Signature(props) {
  const sigCanvas = useRef({});
  const clear = () => sigCanvas.current.clear();
  const save = () => props.setURL(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));

  return (
    <div id='signature-canvas-container'>
      <Popup
      modal 
      trigger={<button>Open Signature Pad</button>}
      closeOnDocumentClick={false}
      >
        {close => (
          <>
            <SignaturePad ref={sigCanvas} id='signature-canvas' 
            canvasProps={{className: 'signature-canvas'}} />
            <button onClick={close}>Close</button>
            <button onClick={clear}>Clear</button>
            <button onClick={() => {
                save();
                close();
            }}>Done</button>
          </>
        )}
      </Popup>
    </div>
  );
}

export default Signature;