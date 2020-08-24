import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

const PaymentCards = props => {

    const productCards = props.products.map((data, index) =>
    <div className='payment-plan-choice' style={{'border': `${props.activePlan === data.productId ? '1px solid #ea9d9d' : ''}`}}>
        <p className='payment-product-name'>{data.productName}</p>
        <p className='payment-product-price' style={{'color' : `${props.activePlan === data.productId ? '#e76a6a' : ''}`}}>${data.price}</p>
        <p className='payment-product-text'>Per month</p>
        <p className='payment-product-text'>Billed monthly</p>
        <button className='payment-product-button' disabled={props.activePlan === data.productId} style={{'backgroundColor' : `${props.activePlan === data.productId ? '#e76a6a' : ''}`}} onClick={() => {props.setActivePlan(data.productId); props.setPriceId(data.priceId); props.setCurrentProduct(data)}}>{props.activePlan === data.productId ? 'Selected' : 'Select'}</button>
    </div>
    )

    return (
          <div className='payment-plan-selection'>
            {productCards}
        </div>
    );
}

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(
    mapStateToProps,
)(PaymentCards);