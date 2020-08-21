import React, { useState, useEffect } from 'react';
//Libraries
import { connect } from 'react-redux';
// import PropTypes from "prop-types";

import { logoutUser } from "../../actions/authActions";

import DocumentsPage from '../DocumentsPage/DocumentsPage';
import AccountPage from '../AccountPage/AccountPage';
import HelpPage from '../HelpPage/HelpPage';

//Images
import accountsImg from './accounts.png';
import documentsImg from './documents.png';
import questionImg from './question.png';
import logoutImg from './logout.png'

const AccountPortal = props => {

    const [activeButton, setActiveButton] = useState('');

    function onLogoClick(e) {
        e.preventDefault()

        props.history.push("/")
    }

    useEffect(() => {
        if (props.location.state) {
            setActiveButton(props.location.state.page)
        } else if (localStorage.getItem('page')) {
            setActiveButton(localStorage.getItem('page'));
        } else {
            setActiveButton('documents');
        }

    }, [])

    return (
        <div className='account-portal'>
            <div className='account-portal-header'>
                <div className='account-portal-logout-container' onClick={() => props.logoutUser()}>
                    <img src={logoutImg} className='account-portal-logout-img'/>
                    <p className='account-portal-logout-text'>Log out</p>
                </div>
            </div>
            <div className='documents-page'>
                <div className='documents-nav'>
                        <p className='documents-nav-name'>
                            {props.auth.user.name}
                            <div className='documents-nav-name-underline'></div>
                        </p>
                        <div className={`documents-nav-button-container ${activeButton === 'account' ? 'documents-nav-active-button' : ''}`} 
                            onClick={() => setActiveButton('account')}>
                            <img className='documents-nav-button-img' src={accountsImg}/>
                            <p className='documents-nav-button'>Account</p>
                        </div>
                        <div className={`documents-nav-button-container ${activeButton === 'documents' ? 'documents-nav-active-button' : '' }`} 
                            onClick={() => setActiveButton('documents')}>
                            <img className='documents-nav-button-img' src={documentsImg}/>
                            <p className='documents-nav-button'>Documents</p>
                        </div>
                        <div className={`documents-nav-button-container ${activeButton === 'help' ? 'documents-nav-active-button' : '' }`} onClick={() => setActiveButton('help')}>
                            <img className='documents-nav-button-img' src={questionImg}/>
                            <p className='documents-nav-button'>Help</p>
                        </div>
                        <p className='account-portal-logo' onClick={e => onLogoClick(e)}>cosign</p>
                </div>
                <div className='documents-background'>
                    {activeButton === 'account' ? <AccountPage/> : null}
                    {activeButton === 'documents' ? <DocumentsPage/> : null}
                    {activeButton === 'help' ? <HelpPage/> : null}

                </div>

            </div>
        </div>
    );

}

// AccountPortal.propTypes = {
//     logoutUser: PropTypes.func.isRequired,
//     auth: PropTypes.object.isRequired
// };

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(AccountPortal);