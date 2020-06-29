import React from 'react';

import zoomImg from './zoom-out.png';

function ZoomOut(props) {

    return (
    <div className='tool' onClick={props.zoomOut}>
        <img src={zoomImg}/>
    </div>
    );
}

export default ZoomOut;