import React, { useRef, useCallback, useState, useEffect } from 'react';

import SinglePage from './Page/Page';

// Redux
import { connect } from 'react-redux';

// props: pageNum, dataURLFormat, width, height
const PageBrowser = (props) => {

    return (
        <div className='page-browser'>
            {[...Array(props.numPages).keys()].map((values, index) =>
                <SinglePage
                index={index}
                />
            )}
        </div>
    )
}

const mapStateToProps = state => ({
    numPages: state.doc.numPages,
})

export default connect(mapStateToProps, {
})(PageBrowser);