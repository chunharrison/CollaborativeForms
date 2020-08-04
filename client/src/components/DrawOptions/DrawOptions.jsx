import React from 'react';

import { connect } from 'react-redux';
import { setDrawOpacity, setDrawBrushSize, setDrawColor } from '../../actions/toolActions';


import darkCheck from './dark-check.png'
import './drawoptions.css';

const DrawOptions = props => {

    function setDrawBrushSize(e) {
        props.setDrawBrushSize(e.target.value);
    }

    function setDrawOpacity(e) {
        props.setDrawOpacity(e.target.value);
    }

    function setDrawColor(e) {
        props.setDrawColor(e.target.style.backgroundColor)
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }
        
    const Colors = ['rgb(233, 43, 45)', 'rgb(229, 129, 0)', 'rgb(247, 235, 69)', 'rgb(64, 225, 25)', 'rgb(0, 229, 207)', 'rgb(0, 65, 229)', 'rgb(145, 0, 229)', 'rgb(250, 82, 226)', 
                    'rgb(237, 85, 87)', 'rgb(234, 154, 51)', 'rgb(248, 239, 106)', 'rgb(102, 231, 71)', 'rgb(51, 234, 216)', 'rgb(51, 103, 234)', 'rgb(167, 51, 234)', 'rgb(251, 116, 231)', 
                    'rgb(244, 149, 150)', 'rgb(242, 192, 127)', 'rgb(251, 245, 162)', 'rgb(159, 240, 140)', 'rgb(127, 242, 231)', 'rgb(127, 160, 242)', 'rgb(200, 127, 242)', 'rgb(252, 168, 240)', 
                    'rgb(0, 0, 0)', 'rgb(51, 51, 51)', 'rgb(127, 127, 127)', 'rgb(204, 204, 204)', 'rgb(255, 255, 255)'];
    return (
        <div className='options-container'>           
            <div className='freedraw-options'>
                <div className='Color-grid'>
                    {Colors.map((Color, index) =>
                                    <div className='Color-block' style={{'backgroundColor': Color}} onClick={setDrawColor}>
                                        {props.drawColor === Color ? <img className='dark-check' src={darkCheck}></img> : null}
                                    </div>
                                )
                    }
                </div>
                <div className='sliders-container'>
                    <div className="slider-container">
                        <p className='slider-description'>Size</p>
                        <input type="range" min="1" max="100" value={props.drawBrushSize} onChange={setDrawBrushSize} step='1' className="slider" />
                        <p className='slider-value'>{props.drawBrushSize}</p>
                    </div>
                    <div className="slider-container">
                        <p className='slider-description'>Opacity</p>
                        <input type="range" min="1" max="100" value={props.drawOpacity} onChange={setDrawOpacity} step='1' className="slider" />
                        <p className='slider-value'>{props.drawOpacity}%</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    drawColor: state.tool.drawColor,
    drawOpacity: state.tool.drawOpacity,
    drawBrushSize: state.tool.drawBrushSize,
})

export default connect(mapStateToProps, {
    setDrawOpacity,
    setDrawColor,
    setDrawBrushSize,
})(DrawOptions);