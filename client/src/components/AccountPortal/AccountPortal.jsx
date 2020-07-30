import React, { useState } from 'react';
//Libraries
import { connect } from 'react-redux';
import PropTypes from "prop-types";

import { logoutUser } from "../../actions/authActions";

import DocumentsPage from '../DocumentsPage/DocumentsPage';
import AccountPage from '../AccountPage/AccountPage';
import HelpPage from '../HelpPage/HelpPage';

//Images
import accountsImg from './accounts.png';
import documentsImg from './documents.png';
import questionImg from './question.png';


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
                    <div className={`documents-nav-button-container ${activeButton === 'help' ? 'documents-nav-active-button' : '' }`} onClick={() => setActiveButton('help')}>
                        <img className='documents-nav-button-img' src={questionImg}/>
                        <p className='documents-nav-button'>HELP</p>
                    </div>
                    <p className='account-portal-logo'>cosign</p>
            </div>
            <div className='documents-background'>
                {activeButton === 'account' ? <AccountPage/> : null}
                {activeButton === 'documents' ? <DocumentsPage/> : null}
                {activeButton === 'help' ? <HelpPage/> : null}

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