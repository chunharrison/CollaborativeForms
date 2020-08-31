import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
//Libraries
import { connect } from 'react-redux';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

import { logoutUser } from "../../actions/authActions";

//css
import './AccountPage.css';

const AccountPage = props => {
    const history = useHistory();
    const [password, setPassword] = useState(null);
    const [confirmedPassword, setConfirmedPassword] = useState(null);
    const [oldPassword, setOldPassword] = useState(null);
    const [edit, setEdit] = useState(false);
    const [message, setMessage] = useState(false);
    const [card, setCard] = useState(null);
    const [userProduct, setUserProduct] = useState(null);
    const [products, setProducts] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);

    async function getSubscription() {
        let options = {
            params: {
                customerId: props.auth.user.customerId
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
                'Authorization': localStorage.getItem("jwtToken")
            },
        };
        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-subscription`, options).then((response) => {
            if (response.data === '') {
                setSubscription('none')
            } else {
                setSubscription(response.data);
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    async function getUserProduct() {
        let options = {
            params: {
                customerId: props.auth.user.customerId
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
                'Authorization': localStorage.getItem("jwtToken")
            },
        };
        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/products/retrieve-user-product`, options).then((response) => {
            setUserProduct(response.data);
        })
        .catch(error => {
            console.log(error);
        })
    }

    async function getProducts() {
        let options = {
            params: {
                customerId: props.auth.user.customerId
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
                'Authorization': localStorage.getItem("jwtToken")
            },
        };
        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/products/retrieve-products`, options).then((response) => {
          setProducts(response.data);
        })
        .catch(error => {
            console.log(error);
        })
    }

    function getCustomerPaymentMethod(paymentMethodId) {
        return axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-customer-payment-method`,
        {
            customerId: props.auth.user.customerId,
        },
        )
        .then((response) => {
            setCard(response.data.card) ;
        });
    }

    function cancelSubscription() {
        setUserProduct(null);
        setProducts(null);
        setSubscription(null);
        setShowCancelModal(false);
        axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/cancel-subscription`,
            {
              customerId: props.auth.user.customerId,
            },
          )
        .then((response) => {
            setSubscription(response.data);
            getUserProduct();
            getProducts();    
        })
        .catch(error => {
            console.log(error);
        })
    };
      

    function submitPassword() {
        axios
            .post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/change-password`,
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

    useEffect(() => {
        localStorage.setItem('page', 'account');
        getUserProduct();
        getProducts();
        getSubscription();
        getCustomerPaymentMethod();
    }, [])

    let availableProducts = null;

    if (products && userProduct) {
        availableProducts = products.map(function(item, i){
            return  item.productName === userProduct.name && subscription && subscription.status === 'active' ? null : 
                    <div className='available-plan-container'>
                        <div className='available-plan'>
                            <div className='available-plan-color'>
                                <p className='plan-name'>{item.productName}</p>
                            </div>
                            <p className='current-plan-description'>Save {item.docCount} documents at a time on your profile</p>
                            <p className='current-plan-description'>Host {item.guestCount} guests at a time on a document</p>
                            <button className='plan-button' onClick={() => {userProduct === 'free' || (subscription && (subscription.status === 'canceled' || subscription.status === 'incomplete')) ? history.push('/payment', {product: item}) : history.push('/payment/change', {newProduct: item, oldProduct: userProduct})}}>
                                Select
                            </button>
                        </div>
                    </div>
          })
    }

    let currentPlan = null;

    if (userProduct && subscription && subscription.status !== 'active') {
        currentPlan = <div className='current-plan-container'>
        <p className='current-plan-header'>Current Plan</p>
        <div className='current-plan'>
            <div className='current-plan-color'>
                <p className='plan-name'>Free</p>
            </div>
            <p className='current-plan-description'>Save 1 document at a time on your profile</p>
            <p className='current-plan-description'>Host 1 guest at a time</p>
        </div>
        </div>

    } else if (userProduct && subscription && subscription.status === 'active' && card) {
        currentPlan = <div className='current-plan-container'>
                            <p className='current-plan-header'>Current Plan</p>
                            <div className='current-plan'>
                                <div className='current-plan-color'>
                                    <p className='plan-name'>{userProduct ? userProduct.name : ''}</p>
                                </div>
                                <div className='account-payment-container'>
                                    <button className='current-plan-button' onClick={() => setShowCancelModal(true)}>
                                        Cancel
                                    </button>
                                    <div className='account-payment-details'>
                                        <p className='payment-form-header'>Payment</p>
                                        <p className='payment-form-card'>{card.brand.toUpperCase()} ending in {card.last4}</p>
                                        <p className='payment-form-subheader'>Expires {card.exp_month}/{card.exp_year}</p>                            
                                    </div>    
                                    <p className='account-payment-update-button' onClick={() => history.push('/payment/update-payment')}>Update</p>
                                </div>
                            </div>
                        </div>
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
                <div className={`account-password-container`}>
                    <p className='account-information-text'>Password</p>
                                         
                    <div className={`account-placeholder-container`}>
                        <div className='account-button-container'>
                            <p className='account-edit-button' onClick={() => setEdit(!edit)}>{edit === false ? 'Change': 'Cancel'}</p>
                        </div>   
                    </div>
                </div>
                {edit === false ?
                null
                :
                <div className={`account-input-container`}>
                    <input placeholder='Old Password' className='account-input fade-in' type="password" onChange={(e) => setOldPassword(e.target.value)}
                    value={oldPassword}/>
                    <input placeholder='New Password' className='account-input fade-in' type="password" onChange={(e) => setPassword(e.target.value)}
                    value={password}/>
                    <input placeholder='New Password' className='account-input fade-in' type="password" onChange={(e) => setConfirmedPassword(e.target.value)}
                    value={confirmedPassword}/>
                </div>} 
                {edit ?                         
                <p className='account-submit-button fade-in' onClick={() => submitPassword()}>Save Password</p>
                : 
                null}
            </div>
            <div className='account-plan'>
                <p className='account-subheader'>Available Plans</p>
                {!products || !userProduct || !subscription ? <div className='account-spinner'></div> : 
                <div>
                    {currentPlan}
                    {availableProducts}
                </div>}
            </div>
            <Modal className='account-modal-dialog' show={showCancelModal} onHide={() => setShowCancelModal(false)} size="m">
                <Modal.Body className='payment-modal-body'>
                    <p className='payment-cancel-header'>Are you sure you want to cancel your current plan?</p>
                    <div>
                        <button className='cancel-plan-button-no' onClick={() => setShowCancelModal(false)}>
                            No
                        </button>
                        <button className='cancel-plan-button-yes' onClick={() => cancelSubscription()}>
                            Yes
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
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