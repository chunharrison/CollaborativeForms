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

        
    const Colors = ['rgb(233, 43, 45)', 'rgb(229, 129, 0)', 'rgb(247, 235, 69)', 'rgb(64, 225, 25)', 'rgb(0, 229, 207)', 'rgb(0, 65, 229)', 'rgb(145, 0, 229)', 'rgb(250, 82, 226)', 
    'rgb(237, 85, 87)', 'rgb(234, 154, 51)', 'rgb(248, 239, 106)', 'rgb(102, 231, 71)', 'rgb(51, 234, 216)', 'rgb(51, 103, 234)', 'rgb(167, 51, 234)', 'rgb(251, 116, 231)', 
    'rgb(244, 149, 150)', 'rgb(242, 192, 127)', 'rgb(251, 245, 162)', 'rgb(159, 240, 140)', 'rgb(127, 242, 231)', 'rgb(127, 160, 242)', 'rgb(200, 127, 242)', 'rgb(252, 168, 240)', 
    'rgb(0, 0, 0)', 'rgb(51, 51, 51)', 'rgb(127, 127, 127)', 'rgb(204, 204, 204)', 'rgb(255, 255, 255)'];
    let fillRadius = props.shapeFocus === 'fill' ? '2px solid black' : '';
    let borderRadius = props.shapeFocus === 'border' ? '2px solid black' : '';
    let selectedColor = props.shapeFocus === 'fill' ? props.shapeFillColor : props.shapeBorderColor;

    return (
        <div className='options-container'>           
            <div className='shape-options'>
                <div className='border-fill-select'>
                    <p className='border-fill-text'>{props.shapeFocus === 'fill' ? 'Fill Color' : 'Border Color'}</p>
                    <div className='border-fill-button-container'>
                        <div className='border-button-container' style={{borderBottom: `${borderRadius}`}} onClick={toggleBorder}>
                            <button className='border-fill-button border-button'  style={{border: `3px solid ${props.shapeBorderColor}`}} onClick={toggleBorder}/>
                        </div>
                        <div className='fill-button-container' style={{borderBottom: `${fillRadius}`}}>
                            <button className='border-fill-button fill-button' style={{backgroundColor: `${props.shapeFillColor}`}} onClick={toggleFill}/>
                        </div>
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
                    <div className="slider-container">
                        <p className='slider-description'>Thickness</p>
                        <input type="range" min="1" max="20" value={props.shapeBorderThickness} onChange={setShapeBorderThickness} step='1' className="slider" />                    
                        <p className='slider-value'>{props.shapeBorderThickness}</p>
                    </div>
                    <div className="slider-container">
                        <p className='slider-description'>Opacity</p>
                        <input type="range" min="1" max="100" value={props.shapeOpacity} onChange={setShapeOpacity} step='1' className="slider" />
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