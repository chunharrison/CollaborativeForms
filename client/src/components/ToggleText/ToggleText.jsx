import React, { useState } from 'react';

import TextOptions from '../TextOptions/TextOptions'

//redux
import { connect } from 'react-redux';
import { setToolMode } from '../../actions/toolActions';

import toggleImg from './text.png';

const ToggleText = (props) => {

    const [dropdown, setDropdown] = useState(0);


    function toggleText() {
        if (props.toolMode !== 'text') {
            setDropdown(true)
        } else {
            setDropdown(!dropdown);
        }

        props.setToolMode('text');
    }

    return (
    <div className='dropdown'>
        <div className='tool-large' id='text-tool' onClick={toggleText} style={{'backgroundColor': `${props.toolMode === 'text' ? 'rgb(209, 209, 209)' : ''}`}}>
            <img src={toggleImg}/>
        </div>
        {dropdown && props.toolMode === 'text' ? <TextOptions/> : null}
    </div> 
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
})(ToggleText);