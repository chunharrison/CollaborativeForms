import React, { useState } from 'react';

import ShapeOptions from '../ShapeOptions/ShapeOptions'

//redux
import { connect } from 'react-redux';
import { setToolMode, } from '../../actions/toolActions';

import toggleImg from './shape.png';

const ToggleShape = (props) => {

    const [dropdown, setDropdown] = useState(0);


    function toggleShape() {
        if (props.toolMode !== 'shape') {
            setDropdown(true)
        } else {
            setDropdown(!dropdown);
        }

        props.setToolMode('shape');
    }

    return (
    <div className='dropdown'>
        <div className='tool-large' id='shape-tool' onClick={toggleShape} style={{'backgroundColor': `${props.toolMode === 'shape' ? 'rgb(209, 209, 209)' : ''}`}}>
            <img src={toggleImg}/>
        </div>
        {dropdown && props.toolMode === 'shape' ? <ShapeOptions/> : null}
    </div> 
    );
}

const mapStateToProps = state => ({
    toolMode: state.tool.toolMode,
})

export default connect(mapStateToProps, {
    setToolMode,
})(ToggleShape);