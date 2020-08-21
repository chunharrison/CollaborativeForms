import React from 'react'

import checkmark from './checkmark.png'
import './SubscriptionPlans.css'

const SubscriptionPlans = props => {
    return(<div className="payment-page-container">
        <p className='product-logo-subscriptions-page'>cosign</p>
        <div className="background-strip"></div>
        <div className="subscription-cards">
            <div class="subscription-row">
                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Free
                        </h1>
                        <p className="subscription-about">
                            Free.
                        </p>
                        {/* <hr/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">Free</p>
                        </div>


                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>3 person per room limit</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Free for 7 days</p>
                            </div>
                        </div>

                        <p className='subscription-button'>Use for Free</p>
                    </div>
                </div>



                <div id="column-basic-plan" class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Basic
                        </h1>
                        <p id="about-basic" className="subscription-about">
                            Basic Use.
                        </p>
                        {/* <hr id="hr-basic"/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">$5</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 5 documents at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>5 person per room limit</p>
                            </div>
                        </div>

                        <p className='subscription-button'>Subscribe to Basic</p>
                    </div>
                </div>
                
                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Pro
                        </h1>
                        <p id="about-pro" className="subscription-about">
                            Pro gamers.
                        </p>
                        {/* <hr id="hr-pro"/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">$10</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 10 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>10 person per room limit</p>
                            </div>
                        </div>

                        <p className='subscription-button'>Subscribe to Pro</p>
                    </div>
                </div>
            </div>
        </div>
        {/* <div class="subscription-card">
            <div class="card-components subscription-details">
                <h1>Free</h1>
            </div>
            <div class="card-components vl"></div>
            <div class="card-components subscription-details">
                <h1>Basic</h1>
            </div>
            <div class="card-components vl"></div>
            <div class="card-components subscription-details">
                <h1>Pro</h1>
            </div>
        </div> */}
    </div>)
}

export default SubscriptionPlans