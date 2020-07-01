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
        
    const Colors = ['rgb(240, 84, 35)', 'rgb(200, 33, 53)', 'rgb(34, 62, 127)', 'rgb(138, 43, 143)', 'rgb(16, 106, 55)', 'rgb(1, 169, 207)', 'rgb(230, 138, 185)', 'rgb(254, 207, 13)', 'rgb(239, 51, 66)', 'rgb(163, 207, 94)', 'rgb(12, 117, 103)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'];

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
                    <div class="slider-container">
                        <p className='slider-description'>Size</p>
                        <input type="range" min="1" max="100" value={props.drawBrushSize} onChange={setDrawBrushSize} step='1' class="slider" />
                        <p className='slider-value'>{props.drawBrushSize}</p>
                    </div>
                    <div class="slider-container">
                        <p className='slider-description'>Opacity</p>
                        <input type="range" min="1" max="100" value={props.drawOpacity} onChange={setDrawOpacity} step='1' class="slider" />
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