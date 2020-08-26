import React from 'react'

import tick from './tick.png'
import close from './close.png'
import './SubscriptionPlans.css'

const SubscriptionPlans = props => {

    function onClickFreeButton(e) {
        e.preventDefault()

        props.history.push('/account-portal')
    }

    function onClickButton(e) {
        e.preventDefault()

        props.history.push('/payment')
    }

    return(<div className="payment-page-container">
        <p className='product-logo-subscriptions-page'>cosign</p>
        <div className="background-strip"></div>
        <div className="subscription-cards">
            <div class="subscription-row">
                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Trial
                        </h1>
                        <p className="subscription-about">
                            Try us out!
                        </p>
                        {/* <hr/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">Free</p>
                        </div>


                        <div className="subscription-perks-container">
                        <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Host <b clasName="perk-accent">1</b> guest per room limit</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Save <b clasName="perk-accent">1</b> document at a time in user profile</p>
                                <p></p>
                            </div>
                            <div className="subscription-perk">
                                <img className="close-mark" src={close}/>
                                <p>Change documents anytime: every <b clasName="perk-accent">48</b> hours</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="close-mark" src={close}/>
                                <p>Pilot Mode</p>
                            </div>
                        </div>

                        <p onClick={e => onClickFreeButton(e)} className='subscription-button'>Use for Free</p>
                    </div>
                </div>



                <div id="column-basic-plan" class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Personal
                        </h1>
                        <p id="about-basic" className="subscription-about">
                            Going over study notes with friends.
                        </p>
                        
                        <div className="subscription-price-container">
                            <p className="subscription-price">$3.49</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                        <div className="subscription-perk">
                            <img className="tick-mark" src={tick}/>
                                <p>Host <b clasName="perk-accent">2</b> guests per room limit</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Save <b clasName="perk-accent">10</b> documents at a time in user profile</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="close-mark" src={close}/>
                                <p>Change documents anytime: every <b clasName="perk-accent">24</b> hours</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="close-mark" src={close}/>
                                <p>Pilot Mode</p>
                            </div>
                        </div>

                        <p onClick={e => onClickButton(e)} className='subscription-button'>Subscribe to Personal</p>
                    </div>
                </div>
                
                <div class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Pro
                        </h1>
                        <p id="about-pro" className="subscription-about">
                            Signing documents with clients.
                        </p>
                        {/* <hr id="hr-pro"/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">$8.99</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Host <b clasName="perk-accent">5</b> guests per room limit</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Save <b clasName="perk-accent">25</b> document at a time in user profile</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Change documents anytime</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Pilot Mode</p>
                            </div>
                        </div>

                        <p onClick={e => onClickButton(e)} className='subscription-button'>Subscribe to Pro</p>
                    </div>
                </div>

                <div id="column-business-plan" class="subscription-column">
                    <div class="subscription-card">
                        <h1 className="subscription-title">
                            Business
                        </h1>
                        <p className="subscription-about">
                            Have Business meetings remotely.
                        </p>
                        {/* <hr id="hr-pro"/> */}
                        <div className="subscription-price-container">
                            <p className="subscription-price">$14.99</p>
                            <p className="payment-frequency">/monthly</p>
                        </div>

                        <div className="subscription-perks-container">
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Host <b clasName="perk-accent">10</b> guests per room limit</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Save <b clasName="perk-accent">50</b> document at a time in user profile</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Change documents anytime</p>
                            </div>
                            <div className="subscription-perk">
                                <img className="tick-mark" src={tick}/>
                                <p>Pilot Mode</p>
                            </div>
                        </div>

                        <p onClick={e => onClickButton(e)} className='subscription-button'>Subscribe to Business</p>
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