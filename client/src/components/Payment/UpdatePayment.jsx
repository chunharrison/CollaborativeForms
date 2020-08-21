import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

import { connect } from 'react-redux';

import CardSection from './CardSection';

import errorImg from './error.png'
import successImg from './success.png'
import { loadStripe } from '@stripe/stripe-js';

const UpdatePayment = props => {
    const stripe = useStripe();
    const elements = useElements();
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleSubmit = async (event) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();
        setPaymentError(null);
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement);
        
        const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        });
        if (error) {
            console.log('[createPaymentMethod error]', error);
        } else {
            setLoading(true);
            const paymentMethodId = paymentMethod.id;
            const customerId = props.auth.user.customerId;
            
            axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/update-customer-payment-method`,
                {
                customerId: customerId,
                paymentMethodId: paymentMethodId,
                },
            )
            // If the card is declined, display an error to the user.
            .then((result) => {
                if (result.error) {
                    // The card had an error when trying to attach it to a customer.
                    setLoading(false);
                    history.push('/account-portal', {page: 'account'});
                    throw result;
                } else {
                    setLoading(false);
                    setShowSuccessModal(true);
                    setTimeout(function() {
                        props.history.push("/account-portal");
                    }, 5000);                
                }
            })
            .catch(error => {
                setPaymentError('Something went wrong! Please try again later.');
                setShowErrorModal(true);
            })
        }
        
    };

    return (
        <div className='payment-container'>
            <p className='payment-logo' onClick={() => props.history.push("/account-portal")}>cosign</p>
            <form onSubmit={handleSubmit}>
                <CardSection />
                <button className='payment-subscribe-button' disabled={!stripe }>{loading ? <div className='payment-spinner'></div> : 'Update'}</button>
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
                    <p className='payment-error-text'>Your payment details have been updated. You will be redirected to your personal page.</p>
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
)(UpdatePayment);