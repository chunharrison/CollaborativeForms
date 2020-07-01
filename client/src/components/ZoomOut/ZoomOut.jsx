import React from 'react';

import { connect } from 'react-redux';
import { setCurrentZoom } from '../../actions/toolActions';

import zoomImg from './zoom-out.png';

const ZoomOut = (props) => {

    function zoomOut() {
        if (props.currentZoom >= 0.4) {
            let newZoom = props.currentZoom - 0.2
            props.setCurrentZoom(newZoom)
            for (let pageNum = 1; pageNum <= props.numPages; pageNum++) {
                if (document.getElementById(pageNum.toString())) {
                    let fabricElement = document.getElementById(pageNum.toString()).fabric
                    fabricElement.setZoom(newZoom);
                    fabricElement.setWidth(props.pageDimensions[pageNum-1].width * newZoom);
                    fabricElement.setHeight(props.pageDimensions[pageNum-1].height * newZoom);
                }
            }
        }
    }

    return (
    <div className='tool' id='zoomout-tool' onClick={zoomOut}>
        <img src={zoomImg}/>
    </div>
    );
}

const mapStateToProps = state => ({
    currentZoom: state.tool.currentZoom,
    pageDimensions: state.doc.pageDimensions,
    numPages: state.doc.numPages,
})

export default connect(mapStateToProps, {
    setCurrentZoom,
})(ZoomOut);