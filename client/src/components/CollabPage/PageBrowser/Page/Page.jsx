import React, { useRef, useCallback, useState, useEffect } from 'react';

// Redux
import { connect } from 'react-redux';

// props: pageNum, dataURLFormat, width, height
const SinglePage = (props) => {

    const [pagePicture, setPagePicture] = useState('');
    const [width, setWidth] = useState(150);
    const [height, setHeight] = useState(200);

    useEffect(() => {
        if (typeof document.getElementsByClassName(`pdf-${props.index + 1}`)[0] !== 'undefined') {
            setTimeout(function(){ setPagePicture(document.getElementsByClassName(`pdf-${props.index + 1}`)[0].firstChild.toDataURL('image/jpeg', 0.3)); }, 500);
            if (props.pageDimensions[props.index].width < props.pageDimensions[props.index].height) {
                setHeight(200);
                setWidth(props.pageDimensions[props.index].width / props.pageDimensions[props.index].height * 200);
            } else {
                setWidth(200);
                setHeight(props.pageDimensions[props.index].height / props.pageDimensions[props.index].width * 200);
            }
        }

    }, [props.pageDimensionsChange === (props.index + 1)])

    function scrollToPage(e) {
        let element = document.getElementById(`container-${e.target.id.split('-')[1]}`);
        element.scrollIntoView();
    }

    return (
        <div className='browser-page-and-number-container' key={`browser-page-${props.index}`}>
            <div id={`browser-${props.index + 1}`} style={{ 'minHeight': height, 'width': width, 'backgroundColor': 'white', 'backgroundSize': 'cover', 'backgroundImage': `url(${pagePicture})`}} onClick={(e) => scrollToPage(e)}>
            </div>
            <p className='browser-page-number'>{props.index + 1}</p>
        </div>
    )
}

const mapStateToProps = state => ({
    pageDimensions: state.doc.pageDimensions,
    pageDimensionsChange: state.doc.pageDimensionsChange,
    numPages: state.doc.numPages,
})

export default connect(mapStateToProps, {
})(SinglePage);