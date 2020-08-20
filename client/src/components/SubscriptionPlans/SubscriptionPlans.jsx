import React from 'react'

import checkmark from './checkmark.png'
import './SubscriptionPlans.css'

const SubscriptionPlans = props => {
    return(<div className="payment-page-container">
        <div className="background-strip"></div>
        <div className="subscription-cards">
            <div class="subscription-row">
                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Free
                        </h1>
                        <p className="subscription-about">
                            Free trial for people who want to try the product before purchasing.
                        </p>
                        <hr/>
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
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                        </div>
                    </div>
                </div>



                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Basic
                        </h1>
                        <p id="about-basic" className="subscription-about">
                            Basic Use.
                        </p>
                        <hr id="hr-basic"/>
                        <div className="subscription-price-container">
                            <p className="subscription-price">$5</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                        </div>
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
                        <hr id="hr-pro"/>
                        <div className="subscription-price-container">
                            <p className="subscription-price">$10</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                            <div className="subscription-perk">
                                <img src={checkmark}/>
                                <p>Host 1 document at a time</p>
                            </div>
                        </div>
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