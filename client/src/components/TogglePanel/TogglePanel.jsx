import React from 'react';

//redux
import { connect } from 'react-redux';
import { setPanelToggle } from '../../actions/toolActions';

import toggleImg from './toggle-panel.png';

const TogglePanel = (props) => {
    function togglePanel() {
        props.setPanelToggle(!props.panelToggle);
    }

    return (
    <div id='panel-tool' className='tool' onClick={togglePanel} style={{'backgroundColor': `${props.panelToggle ? 'rgb(209, 209, 209)' : ''}`}}>
        <img src={toggleImg}/>
    </div>
    );
}

const mapStateToProps = state => ({
    panelToggle: state.tool.panelToggle,
})

export default connect(mapStateToProps, {
    setPanelToggle,
})(TogglePanel);