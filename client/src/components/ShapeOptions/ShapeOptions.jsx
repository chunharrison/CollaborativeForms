import React from 'react';

import { connect } from 'react-redux';
import { setShapeFocus, setShapeBorderColor, setShapeFillColor, setShapeBorderThickness, setShapeOpacity } from '../../actions/toolActions';


import darkCheck from './dark-check.png'
import './shapeoptions.css';

const ShapeOptions = props => {

    function toggleBorder() {
        props.setShapeFocus('border');
    }

    function toggleFill() {
        props.setShapeFocus('fill');
    }

    function setColor(e) {
        if (props.shapeFocus === 'fill') {
            setShapeFillColor(e);
        } else {
            setShapeBorderColor(e);
        }
    }

    //shape functions
    function setShapeBorderThickness(e) {
        props.setShapeBorderThickness(e.target.value);
    }

    function setShapeOpacity(e) {
        props.setShapeOpacity(e.target.value);
    }

    function setShapeFillColor(e) {
        props.setShapeFillColor(e.target.style.backgroundColor);
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }

    function setShapeBorderColor(e) {
        props.setShapeBorderColor(e.target.style.backgroundColor);
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }

        
    const Colors = ['rgb(240, 84, 35)', 'rgb(200, 33, 53)', 'rgb(34, 62, 127)', 'rgb(138, 43, 143)', 'rgb(16, 106, 55)', 'rgb(1, 169, 207)', 'rgb(230, 138, 185)', 'rgb(254, 207, 13)', 'rgb(239, 51, 66)', 'rgb(163, 207, 94)', 'rgb(12, 117, 103)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'];
    let fillRadius = props.shapeFocus === 'fill' ? 15 : 0;
    let borderRadius = props.shapeFocus === 'border' ? 15 : 0;
    let selectedColor = props.shapeFocus === 'fill' ? props.shapeFillColor : props.shapeBorderColor;

    return (
        <div className='options-container'>           
            <div className='shape-options'>
                <div className='border-fill-select'>
                    <p>{props.shapeFocus === 'fill' ? 'Fill Color' : 'Border Color'}</p>
                    <div className='border-fill-button-container'>
                        <button className='border-fill-button border-button'  style={{border: `3px solid ${props.shapeBorderColor}`, borderRadius: `${borderRadius}px`}} onClick={toggleBorder}/>
                        <button className='border-fill-button fill-button' style={{backgroundColor: `${props.shapeFillColor}`, borderRadius: `${fillRadius}px`}} onClick={toggleFill}/>
                    </div>
                </div>
                <div className='Color-grid'>
                    {Colors.map((Color, index) =>
                                    <div className='Color-block' style={{'backgroundColor': Color}} onClick={setColor}>
                                        {selectedColor === Color ? <img className='dark-check' src={darkCheck}></img> : null}
                                    </div>
                                )
                    }
                </div>
                <div className='sliders-container'>
                    <div class="slider-container">
                        <p className='slider-description'>Thickness</p>
                        <input type="range" min="1" max="20" value={props.shapeBorderThickness} onChange={setShapeBorderThickness} step='1' class="slider" />
                        <p className='slider-value'>{props.shapeBorderThickness}</p>
                    </div>
                    <div class="slider-container">
                        <p className='slider-description'>Opacity</p>
                        <input type="range" min="1" max="100" value={props.shapeOpacity} onChange={setShapeOpacity} step='1' class="slider" />
                        <p className='slider-value'>{props.shapeOpacity}%</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    shapeFocus: state.tool.shapeFocus,
    shapeFillColor: state.tool.shapeFillColor,
    shapeBorderColor: state.tool.shapeBorderColor,
    shapeOpacity: state.tool.shapeOpacity,
    shapeBorderThickness: state.tool.shapeBorderThickness,
})

export default connect(mapStateToProps, {
    setShapeFocus,
    setShapeBorderColor,
    setShapeFillColor,
    setShapeBorderThickness,
    setShapeOpacity,
})(ShapeOptions);