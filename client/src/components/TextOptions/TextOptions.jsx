import React from 'react';
import darkCheck from './dark-check.png'
import './textoptions.css';

import { connect } from 'react-redux';
import { setTextColor,
        setTextOpacity,
        setTextFontSize,
} from '../../actions/toolActions';

const TextOptions = props => {

    //Text functions
    function setTextFontSize(e) {
        props.setTextFontSize(e.target.value)
    }

    function setTextOpacity(e) {
        props.setTextOpacity(e.target.value)
    }

    function setTextColor(e) {
        props.setTextColor(e.target.style.backgroundColor);
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
                                    <div className='Color-block' style={{'backgroundColor': Color}} onClick={setTextColor}>
                                        {props.textColor === Color ? <img className='dark-check' src={darkCheck}></img> : null}
                                    </div>
                                )
                    }
                </div>
                <div className='sliders-container'>
                    <div className="slider-container">
                        <p className='slider-description'>Font Size</p>
                        <input type="range" min="1" max="100" value={props.textFontSize} onChange={setTextFontSize} step='1' className="slider" />                        
                        <p className='slider-value'>{props.textFontSize}</p>
                    </div>
                    <div className="slider-container">
                        <p className='slider-description'>Opacity</p>
                        <input type="range" min="1" max="100" value={props.textOpacity} onChange={setTextOpacity} step='1' className="slider" />
                        <p className='slider-value'>{props.textOpacity}%</p>
                    </div>
                </div>
            </div>
        </div>
    )

}

const mapStateToProps = state => ({
    textColor: state.tool.textColor,
    textOpacity: state.tool.textOpacity,
    textFontSize: state.tool.textFontSize,
})

export default connect(mapStateToProps, {
    setTextColor,
    setTextOpacity,
    setTextFontSize,
})(TextOptions);