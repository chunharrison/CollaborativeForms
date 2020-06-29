import React from 'react';

import toggleImg from './toggle-panel.png';

function TogglePanel(props) {

    return (
    <div className='tool' onClick={props.togglePanel}>
        <img src={toggleImg}/>
    </div>
    );
}

export default TogglePanel;