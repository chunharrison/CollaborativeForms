import React, { useState, useEffect } from 'react';
//Libraries
import { connect } from 'react-redux';
import axios from 'axios';

import { logoutUser } from "../../actions/authActions";

//css
import './AccountPage.css';

const AccountPage = props => {
    const [password, setPassword] = useState(null);
    const [confirmedPassword, setConfirmedPassword] = useState(null);
    const [oldPassword, setOldPassword] = useState(null);
    const [email, setEmail] = useState('');
    const [edit, setEdit] = useState(false);
    const [message, setMessage] = useState(false);
    
    function submitPassword() {
        axios
            .post(
            '/api/users/change-password',
            {
                userId: props.auth.user.id, 
                password: password,
                password2: confirmedPassword,
                oldPassword: oldPassword,
            }
            )
            .then(res => 
                setEdit(false))
            .catch(function(error) {
                if (error.response) {
                    if (error.response.data.password) {
                        setMessage(error.response.data.password);

                    } else if ( error.response.data.password2) {
                        setMessage(error.response.data.password2);
                    } else {
                        setMessage(error.response.data);                    
                    }            
                }
            })
        }

    return (
        <div className='account-container fade-in-bottom'>
            <div className='account-profile'>
                <p className='account-subheader'>Profile</p>
                <div className='account-username-container'>
                    <p className='account-information-text'>Username</p>
                    <p>{props.auth.user.name}</p>
                </div>
                <div className='account-email-container'>
                    <p className='account-information-text'>Email</p>
                    <p>{props.auth.user.email}</p>
                </div>
                <div className='account-password-container'>
                    <p className='account-information-text'>Password</p>
                                         
                    <div className={`account-placeholder-container ${edit ? 'account-expanded' : ''}`}>
                        {edit === false ?
                        <p className='account-password-placeholder'></p>
                        :
                        <div className={`account-input-container ${edit ? 'account-expanded' : ''}`}>
                            <input placeholder='Old Password...' className='account-input fade-in' type="password" onChange={(e) => setOldPassword(e.target.value)}
                            value={oldPassword}/>
                            <input placeholder='New Password...' className='account-input fade-in' type="password" onChange={(e) => setPassword(e.target.value)}
                            value={password}/>
                            <input placeholder='New Password...' className='account-input fade-in' type="password" onChange={(e) => setConfirmedPassword(e.target.value)}
                            value={confirmedPassword}/>
                        </div>} 
                        <div className='account-button-container'>
                            <p className='account-edit-button' onClick={() => setEdit(!edit)}>{edit === false ? 'EDIT': 'CANCEL'}</p>
                            {edit ?                         
                            <p className='account-submit-button fade-in' onClick={() => submitPassword()}>SUBMIT</p>
                            : 
                            null}
                        </div>   
                    </div>
                    
                </div>
            </div>
            <div className='account-plan'>
                <p className='account-subheader'>Your Plan</p>
            </div>
        </div>
    );

}

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(AccountPage);