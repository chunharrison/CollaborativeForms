import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

import PaymentCards from  './PaymentCards';

import { connect } from 'react-redux';

import CardSection from './CardSection';

import errorImg from './error.png'
import successImg from './success.png'

const CheckoutForm = props => {
    const stripe = useStripe();
    const elements = useElements();

    const [activePlan, setActivePlan] = useState('');
    const [priceId, setPriceId] = useState('');
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [currentProduct, setCurrentProduct] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);

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
              return props.history.push("/account-portal");
            }

            axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/products/retrieve-products`, options)
            .then((response) => {

              function compare( a, b ) {
                if ( a.price < b.price ){
                  return -1;
                }
                if ( a.price > b.price ){
                  return 1;
                }
                return 0;
              }
              setProducts(response.data.sort( compare ))
              if (!props.location.state || !props.location.state.product) {
                setActivePlan(response.data.sort(compare)[0].productId);
                setPriceId(response.data.sort(compare)[0].priceId);
                setCurrentProduct(response.data.sort(compare)[0]);
              }
              setDataLoaded(true);
            })
          })
          .catch(error => {
            return error;
          })
        }
      })

      if (props.location.state) {
        setActivePlan(props.location.state.product.productId);
        setPriceId(props.location.state.product.priceId);
        setCurrentProduct(props.location.state.product);
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

    console.log(priceId);

    return (
        !dataLoaded ? <div className='account-spinner'></div> :
        <div className='payment-container'>
          <p className='payment-logo' onClick={() => props.history.push("/account-portal")}>cosign</p>
          <div className='payment-plan-selection'>
            <PaymentCards
            products={products}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            setPriceId={setPriceId}
            setCurrentProduct={setCurrentProduct}
            />
          </div>
          <div className='payment-divider'></div>
          <form className='payment-form' onSubmit={handleSubmit}>
          <p className='payment-form-header'>Enter your card details</p>
          <p className='payment-form-header'>Your subscription will start now</p>
          <p className='payment-form-subheader'>Total due now ${currentProduct.price}</p>
          <p className='payment-form-subheader'>Subscribing to {currentProduct.productName}</p>
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