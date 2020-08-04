import React, { useState } from 'react';

//redux
import { connect } from 'react-redux';
import { setToolMode, setPrevToolMode } from '../../actions/toolActions';

import highlighterImg from './highlighter.png';

const ToggleHighlighter = (props) => {

    function toggleHighlighter() {
        props.setToolMode('highlighter');
    }

    return (
    <div className='dropdown'>
        <div className='tool-large' id='highlighter-tool' onClick={toggleHighlighter} style={{'backgroundColor': `${props.toolMode === 'highlighter' ? 'rgb(209, 209, 209)' : ''}`}}>
            <img src={highlighterImg}/>
        </div>
    </div> 
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
})(ToggleHighlighter);