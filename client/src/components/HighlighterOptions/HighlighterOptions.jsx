import React from 'react';
import darkCheck from './dark-check.png'
import './highlighteroptions.css';

class HighlighterOptions extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            borderFill: 'fill',
        }

        this.toggleBorder = this.toggleBorder.bind(this);
        this.toggleFill = this.toggleFill.bind(this);
        this.updateColor = this.updateColor.bind(this);

    }

    toggleBorder() {
        this.setState({borderFill: 'border'});
    }

    toggleFill() {
        this.setState({borderFill: 'fill'});
    }

    updateColor(e) {
        if (this.state.borderFill === 'fill') {
            this.props.updateHighlighterFillColor(e);
        } else {
            this.props.updateHighlighterBorderColor(e);
        }
    }

    render() {
        
        const Colors = ['rgb(240, 84, 35)', 'rgb(200, 33, 53)', 'rgb(34, 62, 127)', 'rgb(138, 43, 143)', 'rgb(16, 106, 55)', 'rgb(1, 169, 207)', 'rgb(230, 138, 185)', 'rgb(254, 207, 13)', 'rgb(239, 51, 66)', 'rgb(163, 207, 94)', 'rgb(12, 117, 103)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'];
        let fillRadius = this.state.borderFill === 'fill' ? 15 : 0;
        let borderRadius = this.state.borderFill === 'border' ? 15 : 0;
        let selectedColor = this.state.borderFill === 'fill' ? this.props.highlighterFillColor : this.props.highlighterBorderColor;

        return (
            <div className='options-container'>           
                <div className='highlighter-options'>
                    <div className='border-fill-select'>
                        <p>{this.state.borderFill === 'fill' ? 'Fill Color' : 'Border Color'}</p>
                        <div className='border-fill-button-container'>
                            <button className='border-fill-button border-button'  style={{border: `3px solid ${this.props.highlighterBorderColor}`, borderRadius: `${borderRadius}px`}} onClick={this.toggleBorder}/>
                            <button className='border-fill-button fill-button' style={{backgroundColor: `${this.props.highlighterFillColor}`, borderRadius: `${fillRadius}px`}} onClick={this.toggleFill}/>
                        </div>
                    </div>
                    <div className='Color-grid'>
                        {Colors.map((Color, index) =>
                                        <div className='Color-block' style={{'backgroundColor': Color}} onClick={this.updateColor}>
                                            {selectedColor === Color ? <img className='dark-check' src={darkCheck}></img> : null}
                                        </div>
                                    )
                        }
                    </div>
                    <div className='sliders-container'>
                        <div class="slider-container">
                            <p className='slider-description'>Thickness</p>
                            <input type="range" min="1" max="20" value={this.props.highlighterBorderThickness} onChange={this.props.updateHighlighterBorderThickness} step='1' class="slider" />
                            <p className='slider-value'>{this.props.highlighterBorderThickness}</p>
                        </div>
                        <div class="slider-container">
                            <p className='slider-description'>Opacity</p>
                            <input type="range" min="1" max="100" value={this.props.highlighterOpacity} onChange={this.props.updateHighlighterOpacity} step='1' class="slider" />
                            <p className='slider-value'>{this.props.highlighterOpacity}%</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HighlighterOptions