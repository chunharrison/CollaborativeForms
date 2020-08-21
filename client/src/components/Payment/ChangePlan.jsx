import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

import { connect } from 'react-redux';

import errorImg from './error.png'
import successImg from './success.png'

const ChangePlan = props => {
    const history = useHistory();
    const stripe = useStripe();
    const elements = useElements();
    const activePlan = props.location.state ? props.location.state.newProduct.productId : null;
    const priceId = props.location.state ? props.location.state.newProduct.priceId : null;
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [expiry, setExpiry] = useState(null);
    const [card, setCard] = useState(null);

    if (!props.location.state) {
        props.history.push('/account-portal')
    }

    useEffect(() => {
        getCustomerPaymentMethod();
        getExpiry();
    }, [])

    const handleSubmit = async (event) => {
        setLoading(true);
        event.preventDefault();
            return axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/update-subscription`,
            {
                customerId: props.auth.user.customerId,
                priceId: priceId,
            },
            )
        .then(response => {
            setLoading(false);
            setShowSuccessModal(true);
            setTimeout(function() {
                history.push('/account-portal', {page: 'account'});
            }, 5000);
        })
        .catch(error => {
            setShowErrorModal(true);
            setLoading(false);
            setPaymentError('Something went wrong! Please try again later.');
        });
    };

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

    async function getExpiry() {
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
        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-expiry`, options).then((response) => {
            let expiryDate = new Date(response.data * 1000)
            let convertedDate = expiryDate.getDate() + '/' + (expiryDate.getMonth() + 1) + '/' + expiryDate.getFullYear()
            setExpiry(convertedDate);
        })
        .catch(error => {
            console.log(error);
        })
    }

    return (
        !expiry || !card ? <div className='account-spinner'></div> : 
                
        <div className='payment-container'>
            <p className='payment-logo' onClick={() => props.history.push("/account-portal")}>cosign</p>
            <div className='payment-plan-selection'>
                <div className='payment-plan-choice' style={{'border': `${activePlan === 'prod_HqHsxFNVeKnvmm' ? '1px solid #ea9d9d' : ''}`}}>
                    <p className='payment-product-plan-header'>Current Plan</p>
                    <p className='payment-product-name'>{props.location.state.oldProduct.name}</p>
                    <p className='payment-product-price' style={{'color' : `${activePlan === 'prod_HqHsxFNVeKnvmm' ? '#e76a6a' : ''}`}}>${props.location.state.oldProduct.metadata.price}</p>
                    <p className='payment-product-text'>Per month</p>
                    <p className='payment-product-text'>Billed monthly</p>
                </div>
                <div className='payment-arrow'></div>
                <div className='payment-plan-new-choice' style={{'border': `1px solid #ea9d9d`}}>
                    <p className='payment-product-new-plan-header'>New Plan</p>
                    <p className='payment-product-new-name'>{props.location.state.newProduct.productName}</p>
                    <p className='payment-product-new-price'>${props.location.state.newProduct.price}</p>
                    <p className='payment-product-new-text'>Per month</p>
                    <p className='payment-product-new-text'>Billed monthly</p>
                </div>
            </div>
            <div className='payment-divider'></div>
            <form onSubmit={handleSubmit}>
                <div className='payment-details-container'>
                    <div className='payment-details'>
                        <p className='payment-form-header'>Your new plan starts today</p>
                        <p className='payment-form-subheader'>Starting {expiry}, you’ll be charged ${props.location.state.newProduct.price}/month + tax.</p>
                        <p className='payment-form-subheader'>If applicable, we’ll apply the remainder of this month’s bill to your new plan. Your new billing date is the day that credit runs out.</p>
                    </div>
                    <div className='payment-details'>
                        <p className='payment-form-header'>Payment</p>
                        <p className='payment-form-card'>{card.brand.toUpperCase()} ending in {card.last4}</p>
                    <p className='payment-form-subheader'>Expires {card.exp_month}/{card.exp_year}</p>

                    </div>
                </div>
                <button className='payment-subscribe-button' disabled={!stripe}>{loading ? <div className='payment-spinner'></div> : 'Change Plan'}</button>
            </form>
            <Modal className='account-modal-dialog' show={showErrorModal} onHide={() => setShowErrorModal(false)} size="m">
                <Modal.Body className='payment-modal-body'>
                    <img src={errorImg} className='payment-error-img'/>
                    <p className='payment-error-header'>Ooops!</p>
                    <p className='payment-error-text'>{paymentError}</p>
                </Modal.Body>
            </Modal>
            <Modal className='account-modal-dialog' show={showSuccessModal} onHide={() => props.history.push("/account-portal")} size="m">
                <Modal.Body className='payment-modal-body'>
                    <img src={successImg} className='payment-success-img'/>
                    <p className='payment-error-header'>Congrats!</p>
                    <p className='payment-error-text'>Your plan has been changed! You will be redirected to your personal page.</p>
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
)(ChangePlan);