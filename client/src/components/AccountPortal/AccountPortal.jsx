import React, { useState } from 'react';
//Libraries
import { connect } from 'react-redux';
import PropTypes from "prop-types";

import { logoutUser } from "../../actions/authActions";

import DocumentsPage from '../DocumentsPage/DocumentsPage';
import AccountPage from '../AccountPage/AccountPage';

//Images
import accountsImg from './accounts.png';
import documentsImg from './documents.png';
import settingsImg from './settings.png';


const AccountPortal = props => {

    const [activeButton, setActiveButton] = useState('documents');

    return (
        <div className='documents-page'>
            <div className='documents-nav'>
                    <p className='documents-nav-name'>
                        {props.auth.user.name}
                        <div className='documents-nav-name-underline'></div>
                    </p>
                    <div className={`documents-nav-button-container ${activeButton === 'account' ? 'documents-nav-active-button' : ''}`} onClick={() => setActiveButton('account')}>
                        <img className='documents-nav-button-img' src={accountsImg}/>
                        <p className='documents-nav-button'>ACCOUNT</p>
                    </div>
                    <div className={`documents-nav-button-container ${activeButton === 'documents' ? 'documents-nav-active-button' : '' }`} onClick={() => setActiveButton('documents')}>
                        <img className='documents-nav-button-img' src={documentsImg}/>
                        <p className='documents-nav-button'>DOCUMENTS</p>
                    </div>
                    <div className={`documents-nav-button-container ${activeButton === 'settings' ? 'documents-nav-active-button' : '' }`} onClick={() => setActiveButton('settings')}>
                        <img className='documents-nav-button-img' src={settingsImg}/>
                        <p className='documents-nav-button'>SETTINGS</p>
                    </div>
            </div>
            <div className='documents-background'>
                {activeButton === 'account' ? <AccountPage/> : null}
                {activeButton === 'documents' ? <DocumentsPage/> : null}

            </div>
        </div>
    );

}

AccountPortal.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(AccountPortal);