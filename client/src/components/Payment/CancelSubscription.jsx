import React, { useState } from 'react';

function CancelSubscription(props) {
  const handleClick = (evt) => {
    evt.preventDefault();
    return fetch(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/cancel-subscription`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((cancelSubscriptionResponse) => {
        // Display to the user that the subscription has been cancelled.
      });
  };

  return (
    <button handleClick={handleClick} type="submit">
      Cancel subscription
    </button>
  );
}

export default CancelSubscription;