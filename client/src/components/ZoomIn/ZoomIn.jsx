import React from 'react';

import zoomImg from './zoom-in.png';

function ZoomIn(props) {

    return (
    <div className='tool' onClick={props.zoomIn}>
        <img src={zoomImg}/>
    </div>
    );
}

export default ZoomIn;