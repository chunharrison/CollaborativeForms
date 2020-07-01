import React from 'react';
import { useState, useEffect } from 'react';

//redux
import { connect } from 'react-redux';
import { setToolMode, setPrevToolMode } from '../../actions/toolActions';

import toggleImg from './pan-cursor.png';

const TogglePan = (props) => {
    function togglePan() {
        props.setToolMode('pan');
    }

    return (
    <div className='tool' id='pan-tool' onClick={togglePan} style={{'backgroundColor': `${props.toolMode === 'pan' ? 'rgb(209, 209, 209)' : ''}`}}>
        <img src={toggleImg}/>
    </div>
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
    prevToolMode: state.tool.prevToolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
    setPrevToolMode
})(TogglePan);