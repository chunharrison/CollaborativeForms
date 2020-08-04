import React from 'react';

//reduc
import { connect } from 'react-redux';
import { setToolMode } from '../../actions/toolActions';

import toggleImg from './select-cursor.png';

const ToggleSelect = (props) => {

    function toggleSelect() {
        props.setToolMode('select');
    }

    return (
    <div className='tool' id='select-tool' onClick={toggleSelect} style={{'backgroundColor': `${props.toolMode === 'select' ? 'rgb(209, 209, 209)' : ''}`}}>
        <img src={toggleImg}/>
    </div>
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
})(ToggleSelect);