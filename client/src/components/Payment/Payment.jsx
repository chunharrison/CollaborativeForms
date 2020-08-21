import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

import { connect } from 'react-redux';

import CardSection from './CardSection';

import errorImg from './error.png'
import successImg from './success.png'

const CheckoutForm = props => {
    const stripe = useStripe();
    const elements = useElements();

    const [activePlan, setActivePlan] = useState('prod_HqHsxFNVeKnvmm');
    const [priceId, setPriceId] = useState('price_1HGbIrLYbeGzRup8choFV77Z');
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
      if (activePlan === 'prod_HqHsxFNVeKnvmm') {
        setPriceId('price_1HGbIrLYbeGzRup8choFV77Z')
      } else if (activePlan === 'prod_HqKrFmF7YOt6D9') {
        setPriceId('price_1HGeBTLYbeGzRup80YS1RCCi')
      }
    }, [activePlan])

    useEffect(() => {
        localStorage.removeItem("latestInvoiceId");
        localStorage.removeItem("latestInvoicePaymentIntentStatus");

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

      axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-latest-invoice`, options).then((response) => {
        if (response.data !== '' && response.data.payment_intent.status !== "succeeded") {
          localStorage.setItem('latestInvoiceId', response.data.id);
          localStorage.setItem(
            'latestInvoicePaymentIntentStatus',
            response.data.payment_intent.status
          );
        } else {
          axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-subscription`, options).then((res) => {
            if (res.data.status === 'active') {
              props.history.push("/account-portal");
            }
          })
          .catch(error => {
            return error;
          })
        }
        setDataLoaded(true);
      })

      if (props.location.state) {
        setActivePlan(props.location.state.product.productId)
      }
    }, [])

    function createSubscription({ customerId, paymentMethodId, priceId }) {
        setLoading(true);
        return (
          axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/create-subscription`,
            {
              customerId: customerId,
              paymentMethodId: paymentMethodId,
              priceId: priceId,
            },
          )
          // If the card is declined, display an error to the user.
          .then((result) => {
            if (result.error) {
              // The card had an error when trying to attach it to a customer.
              throw result;
            }
            return result.data;
          })
          // Normalize the result to contain the object returned by Stripe.
          // Add the additional details we need.
          .then((result) => {
            return {
              paymentMethodId: paymentMethodId,
              priceId: priceId,
              subscription: result,
            };
          })
          // Some payment methods require a customer to be on session
          // to complete the payment process. Check the status of the
          // payment intent to handle these actions.
          .then(handlePaymentThatRequiresCustomerAction)
          // If attaching this card to a Customer object succeeds,
          // but attempts to charge the customer fail, you
          // get a requires_payment_method error.
          .then(handleRequiresPaymentMethod)
          // No more actions required. Provision your service for the user.
          .then(onSubscriptionComplete)
          .catch((error) => {
            // An error has happened. Display the failure to the user here.
            setLoading(false);
            setPaymentError('Your card was declined');
            setShowErrorModal(true);
          })
        );
    }

    function onSubscriptionComplete(result) {
        setLoading(false);
        // Payment was successful.
        if (result.subscription.status === 'active') {
            // Change your UI to show a success message to your customer.
            // Call your backend to grant access to your service based on
            // `result.subscription.items.data[0].price.product` the customer subscribed to.
            setShowSuccessModal(true);
            setTimeout(function() {
              props.history.push("/account-portal");
            }, 5000);
        }
    }

    function handlePaymentThatRequiresCustomerAction({
        subscription,
        invoice,
        priceId,
        paymentMethodId,
        isRetry,
      }) {
        if (subscription && subscription.status === 'active') {
          // Subscription is active, no customer actions required.
          return { subscription, priceId, paymentMethodId };
        }
        // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
        // If it's a retry, the payment intent will be on the invoice itself.
        let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;

        if (
          paymentIntent.status === 'requires_action' ||
          (isRetry === true && paymentIntent.status === 'requires_payment_method')
        ) {
          return stripe
            .confirmCardPayment(paymentIntent.client_secret, {
              payment_method: paymentMethodId,
            })
            .then((result) => {
              if (result.error) {
                // Start code flow to handle updating the payment details.
                // Display error message in your UI.
                // The card was declined (i.e. insufficient funds, card has expired, etc).
                throw result;
              } else {
                if (result.paymentIntent.status === 'succeeded') {
                  // Show a success message to your customer.
                  // There's a risk of the customer closing the window before the callback.
                  // We recommend setting up webhook endpoints later in this guide.
                    localStorage.removeItem("latestInvoiceId");
                    localStorage.removeItem("latestInvoicePaymentIntentStatus");
                    setShowSuccessModal(true);
                    setTimeout(function() {
                      props.history.push("/account-portal");
                    }, 5000);
                  return {
                    priceId: priceId,
                    subscription: subscription,
                    invoice: invoice,
                    paymentMethodId: paymentMethodId,
                  };
                }
              }
            })
            .catch((error) => {
              //displayError(error);
              setLoading(false);
              setPaymentError(error.error.message);
              setShowErrorModal(true);
            });
        } else {
          // No customer action needed.
          return { subscription, priceId, paymentMethodId };
        }
    }

    function handleRequiresPaymentMethod({
        subscription,
        paymentMethodId,
        priceId,
      }) {
        if (subscription.status === 'active') {
          // subscription is active, no customer actions required.
          return { subscription, priceId, paymentMethodId };
        } else if (
          subscription.latest_invoice.payment_intent.status ===
          'requires_payment_method'
        ) {
          // Using localStorage to manage the state of the retry here,
          // feel free to replace with what you prefer.
          // Store the latest invoice ID and status.
          localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
          localStorage.setItem(
            'latestInvoicePaymentIntentStatus',
            subscription.latest_invoice.payment_intent.status
          );
          throw { error: { message: 'Your card was declined.' } };
        } else {
          return { subscription, priceId, paymentMethodId };
        }
    }

    function retryInvoiceWithNewPaymentMethod({
        customerId,
        paymentMethodId,
        invoiceId,
        priceId
      }) {
        setLoading(true);
        return (
          axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retry-invoice`, {
              customerId: customerId,
              paymentMethodId: paymentMethodId,
              invoiceId: invoiceId,
            })
            // If the card is declined, display an error to the user.
            .then((result) => {
              if (result.error) {
                // The card had an error when trying to attach it to a customer.
                throw result;
              }
              return result.data;
            })
            // Normalize the result to contain the object returned by Stripe.
            // Add the additional details we need.
            .then((result) => {
              return {
                // Use the Stripe 'object' property on the
                // returned result to understand what object is returned.
                invoice: result,
                paymentMethodId: paymentMethodId,
                priceId: priceId,
                isRetry: true,
                
              };
            })
            // Some payment methods require a customer to be on session
            // to complete the payment process. Check the status of the
            // payment intent to handle these actions.
            .then(handlePaymentThatRequiresCustomerAction)
            // No more actions required. Provision your service for the user.
            .then(onSubscriptionComplete)
            .catch((error) => {
              setLoading(false);
              // An error has happened. Display the failure to the user here.
            })
        );
    }      

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
        
        // If a previous payment was attempted, get the latest invoice
        const latestInvoicePaymentIntentStatus = localStorage.getItem(
        'latestInvoicePaymentIntentStatus'
        );
        const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        });
        if (error) {
            console.log('[createPaymentMethod error]', error);
        } else {
        const paymentMethodId = paymentMethod.id;
        const customerId = props.auth.user.customerId;
        if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
            // Update the payment method and retry invoice payment
            const invoiceId = localStorage.getItem('latestInvoiceId');
            retryInvoiceWithNewPaymentMethod({
                customerId,
                paymentMethodId,
                invoiceId,
                priceId,
            });
        } else {
            // Create the subscription
            createSubscription({ customerId, paymentMethodId, priceId });
        }
        }
    };

    return (
        <div className='payment-container'>
          <p className='payment-logo' onClick={() => props.history.push("/account-portal")}>cosign</p>
          <div className='payment-plan-selection'>
            <div className='payment-plan-choice' style={{'border': `${activePlan === 'prod_HqHsxFNVeKnvmm' ? '1px solid #ea9d9d' : ''}`}}>
              <p className='payment-product-name'>Basic</p>
              <p className='payment-product-price' style={{'color' : `${activePlan === 'prod_HqHsxFNVeKnvmm' ? '#e76a6a' : ''}`}}>$4.99</p>
              <p className='payment-product-text'>Per month</p>
              <p className='payment-product-text'>Billed monthly</p>
              <button className='payment-product-button' disabled={activePlan === 'prod_HqHsxFNVeKnvmm'} style={{'backgroundColor' : `${activePlan === 'prod_HqHsxFNVeKnvmm' ? '#e76a6a' : ''}`}} onClick={() => setActivePlan('prod_HqHsxFNVeKnvmm')}>{activePlan !== 'prod_HqKrFmF7YOt6D9' ? 'Selected' : 'Select'}</button>
            </div>
            <div className='payment-plan-choice' style={{'border': `${activePlan === 'prod_HqKrFmF7YOt6D9' ? '1px solid #ea9d9d' : ''}`}}>
              <p className='payment-product-name'>Pro</p>
              <p className='payment-product-price' style={{'color' : `${activePlan === 'prod_HqKrFmF7YOt6D9' ? '#e76a6a' : ''}`}}>$9.99</p>
              <p className='payment-product-text'>Per month</p>
              <p className='payment-product-text'>Billed monthly</p>
              <button className='payment-product-button' disabled={activePlan === 'prod_HqKrFmF7YOt6D9'} style={{'backgroundColor' : `${activePlan === 'prod_HqKrFmF7YOt6D9' ? '#e76a6a' : ''}`}} onClick={() => setActivePlan('prod_HqKrFmF7YOt6D9')}>{activePlan !== 'prod_HqKrFmF7YOt6D9' ? 'Select' : 'Selected'}</button>
            </div>
          </div>
          <div className='payment-divider'></div>
          <form onSubmit={handleSubmit}>
          <p className='payment-form-header'>Enter your card details</p>
          <p className='payment-form-header'>Your subscription will start now</p>
          <p className='payment-form-subheader'>Total due now {activePlan === 'prod_HqHsxFNVeKnvmm' ? '$4.99' : '$9.99'}</p>
          <p className='payment-form-subheader'>Subscribing to {activePlan === 'prod_HqHsxFNVeKnvmm' ? 'Basic' : 'Pro'}</p>
            <CardSection />
            <button className='payment-subscribe-button' disabled={!stripe || !dataLoaded}>{loading ? <div className='payment-spinner'></div> : 'Subscribe'}</button>
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
                <p className='payment-error-text'>Your payment was successful! You will be redirected to your personal page.</p>
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
)(CheckoutForm);