import React from 'react';

import toggleImg from './pan-cursor.png';

function TogglePan(props) {

    return (
    <div className='tool' onClick={props.togglePan}>
        <img src={toggleImg}/>
    </div>
    );
}

export default TogglePan;