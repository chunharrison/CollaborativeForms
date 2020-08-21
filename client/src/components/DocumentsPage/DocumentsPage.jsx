import React, { useState, useEffect } from 'react';
//Libraries
import { connect } from 'react-redux';
// import PropTypes from "prop-types";

import { useMediaQuery } from 'react-responsive'

//components
import InfiniteDocumentScroll from './InfiniteDocumentScroll/InfiniteDocumentScroll';

import { logoutUser } from "../../actions/authActions";

//css
import './DocumentsPage.css';

const DocumentsPage = props => {

    const [infiniteMode, setInfiniteMode] = useState(true);

    function handleExpandOnClick() {
        setInfiniteMode(!infiniteMode)
    }

    useEffect(() => {
        localStorage.setItem('page', 'documents');
    }, [])

    return (
        <div className='documents-container'>
            <div className={`documents-shared fade-in-bottom ${infiniteMode ? 'expanded' : ''}`}>
                <div className='documents-text-expand'>
                    <p className='documents-shared-text'>Shared Documents</p>
                </div>
                <InfiniteDocumentScroll
                infiniteMode={infiniteMode}/>
            </div>
        </div>
    );

}

// DocumentsPage.propTypes = {
//         logoutUser: PropTypes.func.isRequired,
//         auth: PropTypes.object.isRequired
//   };

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(DocumentsPage);