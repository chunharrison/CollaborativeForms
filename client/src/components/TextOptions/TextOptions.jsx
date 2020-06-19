import React from 'react';
import darkCheck from './dark-check.png'
import './textoptions.css';

class FreedrawOptions extends React.Component {
    constructor(props) {
        super(props)

    }

    render() {
        
        const Colors = ['rgb(240, 84, 35)', 'rgb(200, 33, 53)', 'rgb(34, 62, 127)', 'rgb(138, 43, 143)', 'rgb(16, 106, 55)', 'rgb(1, 169, 207)', 'rgb(230, 138, 185)', 'rgb(254, 207, 13)', 'rgb(239, 51, 66)', 'rgb(163, 207, 94)', 'rgb(12, 117, 103)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'];

        return (
            <div className='options-container'>           
                <div className='freedraw-options'>
                    <div className='Color-grid'>
                        {Colors.map((Color, index) =>
                                        <div className='Color-block' style={{'backgroundColor': Color}} onClick={this.props.updateTextColor}>
                                            {this.props.textColor === Color ? <img className='dark-check' src={darkCheck}></img> : null}
                                        </div>
                                    )
                        }
                    </div>
                    <div className='sliders-container'>
                        <div class="slider-container">
                            <p className='slider-description'>Font Size</p>
                            <input type="range" min="1" max="100" value={this.props.textFontSize} onChange={this.props.updateTextFontSize} step='1' class="slider" />
                            <p className='slider-value'>{this.props.textFontSize}</p>
                        </div>
                        <div class="slider-container">
                            <p className='slider-description'>Opacity</p>
                            <input type="range" min="1" max="100" value={this.props.textOpacity} onChange={this.props.updateTextOpacity} step='1' class="slider" />
                            <p className='slider-value'>{this.props.textOpacity}%</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FreedrawOptions