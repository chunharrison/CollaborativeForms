function updateSubscription(priceId, subscriptionId) {
    return fetch(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/update-subscription`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId,
        newPriceId: priceId,
      }),
    })
      .then(response => {
        return response.json();
      })
      .then(response => {
        return response;
      });
}

function retrieveUpcomingInvoice(
    customerId,
    subscriptionId,
    newPriceId,
    trialEndDate
  ) {
    return fetch(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/payments/retrieve-upcoming-invoice`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        subscriptionId: subscriptionId,
        newPriceId: newPriceId,
      }),
    })
      .then(response => {
        return response.json();
      })
      .then(invoice => {
        return invoice;
      });
}  