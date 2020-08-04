import React, { useState } from 'react';
//Libraries
import { connect } from 'react-redux';
// import PropTypes from "prop-types";

//components
import InfiniteDocumentScroll from './InfiniteDocumentScroll/InfiniteDocumentScroll';

import { logoutUser } from "../../actions/authActions";

//css
import './DocumentsPage.css';

const DocumentsPage = props => {

    const [infiniteMode, setInfiniteMode] = useState(false);

    function handleExpandOnClick() {
        setInfiniteMode(!infiniteMode)
    }

    return (
                <div className='documents-container'>
                    <div className={`documents-shared fade-in-bottom ${infiniteMode ? 'expanded' : ''}`}>
                        <div classname='documents-text-expand'>
                            <p className='documents-shared-text'>Shared Documents</p>
                            <div className='documents-expand-container' onClick={handleExpandOnClick}>
                                <div className={`documents-expand-vertical ${infiniteMode ? 'rotate-in' : 'rotate-out'}`}></div>
                                <div className={`documents-expand-horizontal`}></div>
                            </div>

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