import React from 'react';

import toggleImg from './select-cursor.png';

function ToggleSelect(props) {

    return (
    <div className='tool' onClick={props.toggleSelect}>
        <img src={toggleImg}/>
    </div>
    );
}

export default ToggleSelect;