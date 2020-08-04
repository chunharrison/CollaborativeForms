import React, { useState } from 'react';

import DrawOptions from '../DrawOptions/DrawOptions';

//redux
import { connect } from 'react-redux';
import { setToolMode, setPrevToolMode } from '../../actions/toolActions';

import toggleImg from './draw.png';

const ToggleDraw = (props) => {

    const [dropdown, setDropdown] = useState(false);


    function toggleDraw() {
        if (props.toolMode !== 'draw') {
            setDropdown(true)
        } else {
            setDropdown(!dropdown);
        }

        props.setToolMode('draw');
    }

    return (
    <div className='dropdown'>
        <div className='tool-large' id='draw-tool' onClick={toggleDraw} style={{'backgroundColor': `${props.toolMode === 'draw' ? 'rgb(209, 209, 209)' : ''}`}}>
            <img src={toggleImg}/>
        </div>
        {dropdown && props.toolMode === 'draw' ? <DrawOptions/> : null}
    </div> 
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
})(ToggleDraw);