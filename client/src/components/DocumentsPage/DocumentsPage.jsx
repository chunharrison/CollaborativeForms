import React, { useState } from 'react';
//Libraries
import { connect } from 'react-redux';
import PropTypes from "prop-types";

//components
import InfiniteDocumentScroll from './InfiniteDocumentScroll/InfiniteDocumentScroll';

import { logoutUser } from "../../actions/authActions";

//Images
import accountsImg from './accounts.png';
import documentsImg from './documents.png';
import settingsImg from './settings.png';

//css
import './DocumentsPage.css';

const DocumentsPage = props => {

    const [infiniteMode, setInfiniteMode] = useState(false);

    function handleExpandOnClick() {
        setInfiniteMode(!infiniteMode)
    }

    return (
        <div className='documents-page'>
            <div className='documents-nav'>
                    <p className='documents-nav-name'>
                        {props.auth.user.name}
                        <div className='documents-nav-name-underline'></div>
                    </p>
                    <div className='documents-nav-button-container'>
                        <img className='documents-nav-button-img' src={accountsImg}/>
                        <p className='documents-nav-button'>ACCOUNT</p>
                    </div>
                    <div className='documents-nav-button-container documents-nav-active-button'>
                        <img className='documents-nav-button-img' src={documentsImg}/>
                        <p className='documents-nav-button'>DOCUMENTS</p>
                    </div>
                    <div className='documents-nav-button-container'>
                        <img className='documents-nav-button-img' src={settingsImg}/>
                        <p className='documents-nav-button'>SETTINGS</p>
                    </div>
            </div>
            <div className='documents-background'>
                <div className='documents-container'>
                    <div className={`documents-shared fade-in-bottom ${infiniteMode ? 'expanded' : ''}`}>
                        <p className='documents-shared-text'>Shared Documents</p>
                        <div className='documents-line-expand' onClick={handleExpandOnClick}>
                            <div className='documents-line'></div>
                            <div className='documents-expand-container'>
                                <div className={`documents-expand-vertical ${infiniteMode ? 'rotate-in' : 'rotate-out'}`}></div>
                            <div className={`documents-expand-horizontal`}></div>
                            </div>
                        </div>
                        <InfiniteDocumentScroll
                        infiniteMode={infiniteMode}/>
                    </div>
                    <div className={`documents-recently-viewed ${infiniteMode ? 'fade-out-bottom' : 'fade-in-bottom'}`}>
                        <p className='documents-recently-viewed-text'>Recently Viewed</p>
                        <div className='documents-line-expand'>
                            <div className='documents-line'></div>
                            <div className='documents-expand-container'>
                            </div>
                        </div>
                        <div className='documents-shared-files'>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

DocumentsPage.propTypes = {
        logoutUser: PropTypes.func.isRequired,
        auth: PropTypes.object.isRequired
  };

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(DocumentsPage);