import React from "react";

// libraries
import { InView } from 'react-intersection-observer'
import { nanoid } from 'nanoid'
import axios from 'axios'

//images
import redCursor from './cursor.png';
import underline from './underline.png';
import typeIndicator from './type-indicator.png';
import circleEdit from './circle.png';
import pattern from './pattern.png';
import triangle from './triangle.png';
import rectangle from './rectangle.png';
import downArrow from './down-arrow.png';
import featureOne from './feature-one.png';
import rectangleOne from './rectangle-1.png';
import rectangleTwo from './rectangle-2.png';
import rectangleThree from './rectangle-3.png';
import tick from './tick.png';
import plus from './plus.png';

// redux
import { connect } from 'react-redux'

// components
import { logoutUser } from "../../actions/authActions";

// file 
import demoFile from './sample.pdf'

// css
import './LandingPage.css';

class LandingPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            typeBlink:false,

        }

        this.fadeInLeft = this.fadeInLeft.bind(this);
        this.fadeInRight = this.fadeInRight.bind(this);
        this.fadeInBottom = this.fadeInBottom.bind(this);
        this.fadeInBottomSlow = this.fadeInBottomSlow.bind(this);
    }

    componentDidMount() {
        let self = this;
        setInterval(function(){ 
           self.setState({typeBlink: !self.state.typeBlink}) 
        }, 600);
    }

    fadeInLeft(inView, entry ) {
        if (inView && !entry.target.classList.contains('fade-in-left')) {
            entry.target.classList.add("fade-in-left");
        }
        
    }

    fadeInRight(inView, entry ) {
        if (inView && !entry.target.classList.contains('fade-in-right')) {
            entry.target.classList.add("fade-in-right");
        }
        
    }

    fadeInBottom(inView, entry ) {
        if (inView && !entry.target.classList.contains('fade-in-bottom')) {
            entry.target.classList.add("fade-in-bottom");
        }
        
    }

    fadeInBottomSlow(inView, entry ) {
        if (inView && !entry.target.classList.contains('fade-in-bottom-slow')) {
            entry.target.classList.add("fade-in-bottom-slow");
        }
        
    }


    // login
    handleLogInClick = e => {
        e.preventDefault()

        this.props.history.push("/account")
    }

    handleLogOutClick = e => {
        e.preventDefault()

        this.props.logoutUser();
    }

    handleAccountPortalClick = e => {
        e.preventDefault()

        this.props.history.push("/account-portal")
    }

    handleSignUpClick = e => {
        e.preventDefault()

        localStorage.setItem('signup', true)
        this.props.history.push("/account")
    }

    handleDemoClick = e => {
        e.preventDefault()

        if (!this.props.auth.isAuthenticated) {
            this.props.history.push("/account")
        } else {
            const demoRoomCode = nanoid()
            
            axios.post(`/api/demo/create-demo-room`, {
                roomCode: demoRoomCode, 
                userId: this.props.auth.user.id, 
                userName: this.props.auth.user.name, 
                fileName: 'demo'
            }).then(res => {
                this.props.history.push({
                    pathname: `/demo`,
                    search: `?username=${this.props.auth.user.name}&roomCode=${demoRoomCode}`,
                    state: {id: this.props.auth.user.id},
                })
            })
        }
    }

    render() {
        let blink = this.state.typeBlink === true ? null : 'blink';

        return (
            <div className='grid-container'>
                <div className='nav'>
                    <div className='nav-left'>
                        <p className='nav-logo'>cosign</p>
                        <p className='nav-button'>Product</p>
                        <p className='nav-button'>Pricing</p>
                        <p className='nav-button' onClick={() => {this.props.history.push("/contact-us")}}>Contact us</p>
                        <p className='nav-button' onClick={e => {this.handleDemoClick(e)}}>Demo</p>
                    </div>
                    <div className='nav-right'>
                        {
                            this.props.auth.isAuthenticated
                            ?
                                <p className='nav-button' onClick={e => this.handleLogOutClick(e)}>Log out</p>
                            :
                                <p className='nav-button' onClick={e => this.handleLogInClick(e)}>Log in</p>
                        }
                        {
                            this.props.auth.isAuthenticated
                            ?
                                <p className='nav-register-button' onClick={e => this.handleAccountPortalClick(e)}>Account Portal</p>
                            :
                                <p className='nav-register-button' onClick={e => this.handleSignUpClick(e)}>Sign up</p>
                        }
                    </div>
                </div>
                <div className='welcome'>
                    <div className='header-container'>
                        <div className='real-cursor'>
                            <p className='header-real'>real</p>
                            <img src={redCursor} className='red-cursor'/>
                        </div>
                        <p className='header-time'>time</p>
                        <p className='header-pdf'>pdf</p>
                        <div className='signing-underline'>
                            <p className='header-signing'>signing</p>
                            <img src={underline} className='underline'/>
                        </div>
                    </div> 
                    <div className='header-container-2'>
                        <p className='header-and'>and</p>
                        <p className='header-collaboration'>collaboration</p>
                        <img src={typeIndicator} className={`type-indicator ${blink}`}/>
                    </div>
                    <p className='description'>Sign PDF documents real time with clients <br/> and team members alike with our online <br/> collaborative platform</p>
                    <img src={pattern} className='pattern'/>
                    <img src={circleEdit} className='circle-edit'/>
                    <img src={triangle} className='triangle'/>
                    <img src={rectangle} className='rectangle'/>
                    <div className='welcome-button-container'>
                        <p className='welcome-demo-button'>Try our demo</p>
                    </div>
                    <p className='learn-more'>Learn More</p>
                    <img src={downArrow} className='down-arrow'/>
                </div>
                <div className='feature'>
                    <InView as="div" className='feature-image-container' onChange={this.fadeInLeft}>
                        <img src={featureOne} className='feature-image'/>
                    </InView>
                    <InView as="div" className='feature-text' onChange={this.fadeInRight}>
                            <p className='feature-header'>Sign documents together.</p>
                            <p className='feature-description'>Be it clients, team members or anyone else. Our real time platform allows users to invite others and sign pdf documents together in real time, making sure <span>nothing is missed!</span></p>
                    </InView>
                </div>
                <div className='feature' style={{backgroundColor: '#f9f9f9'}}>
                    <InView as="div" className='feature-text' onChange={this.fadeInLeft}>
                            <p className='feature-header'>Navigate your guests.</p>
                            <p className='feature-description'>Our Pilot mode allows our users to be in full controll of the document, allowing them to navigate <span>everyone’s attention</span> to their desired page destination!</p>
                    </InView>
                    <InView as="div" className='feature-image-container' onChange={this.fadeInRight}>
                        <img src={featureOne} className='feature-image'/>
                    </InView>
                </div>
                <div className='feature'>
                    <InView as="div" className='feature-image-container' onChange={this.fadeInLeft}>
                        <img src={featureOne} className='feature-image'/>
                    </InView>
                    <InView as="div" className='feature-text' onChange={this.fadeInRight}>
                            <p className='feature-header'>Freedom of choice.</p>
                            <p className='feature-description'>The wide range of tools available to cosign users allow them to do even more with their pdf documents. From <span>drawing</span> and <span>creating shapes</span> to being <span>in control of who gets to move signatures</span>, specifying <span>download permissions</span> among their guests and many more.</p>
                    </InView>
                </div>
                <div className='try-demo'>
                    <img src={rectangleOne} className='rectangle-one'/>
                    <img src={rectangleTwo} className='rectangle-two'/>
                    <img src={rectangleThree} className='rectangle-three'/>
                    <p className='try-demo-header'>Try our free demo</p>
                    <p className='try-demo-description'>We recommend opening multiple windows in order to experience the real time strength of the app</p>
                    <p className='try-demo-button'>Demo</p>
                </div>
                <div className='join-us'>
                    <p className='join-us-header'>Join us today</p>
                    <p className='join-us-description'>Upgrade later</p>
                    <div className='pricing'>
                        <p className='choose-plan-header'>Choose your plan</p>
                        <div className='pricing-card-container'>
                            <InView as="div" className='pricing-card' onChange={this.fadeInBottom}>
                                <div className='pricing-card-small'>
                                    <p className='pricing-card-tier-small'>Jester</p>
                                    <div className='pricing-card-underline-small'></div>
                                    <div className='pricing-card-price-container'>
                                        <p className='pricing-card-price-currency-small'>$</p>
                                        <p className='pricing-card-price-value-small'>0</p>
                                        <p className='pricing-card-price-recurrence-small'>for a week</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick-small' src={tick} />
                                        <p className='pricing-card-perk-description-small'>host 1 document at a time</p>
                                    </div>
                                    <p className='pricing-card-button-small'>
                                        Choose
                                    </p>
                                </div>
                                
                            </InView>
                            <InView as="div" className='pricing-card' onChange={this.fadeInBottomSlow}>
                                <div className='pricing-card-large'>
                                    <p className='pricing-card-tier'>Peasant</p>
                                    <div className='pricing-card-underline'></div>
                                    <div className='pricing-card-price-container'>
                                        <p className='pricing-card-price-currency'>$</p>
                                        <p className='pricing-card-price-value'>5</p>
                                        <p className='pricing-card-price-recurrence'>monthly</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick' src={tick} />
                                        <p className='pricing-card-perk-description'>host 3 documents at a time</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick' src={tick} />
                                        <p className='pricing-card-perk-description'>get a lil lick from our 2 CEOs</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick' src={plus} />
                                        <p className='pricing-card-perk-description'>all jester features</p>
                                    </div>
                                    <p className='pricing-card-button-large'>
                                        Choose
                                    </p>
                                </div>
                            </InView>
                            <InView as="div" className='pricing-card' onChange={this.fadeInBottom}>
                                <div className='pricing-card-small'>
                                    <p className='pricing-card-tier-small'>Lancelot</p>
                                    <div className='pricing-card-underline-small'></div>
                                    <div className='pricing-card-price-container'>
                                        <p className='pricing-card-price-currency-small'>$</p>
                                        <p className='pricing-card-price-value-small'>10</p>
                                        <p className='pricing-card-price-recurrence-small'>monthly</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick-small' src={tick} />
                                        <p className='pricing-card-perk-description-small'>host unlimited documents at a time</p>
                                    </div>
                                    <div className='pricing-card-perk'>
                                        <img className='pricing-card-perk-tick-small' src={plus} />
                                        <p className='pricing-card-perk-description-small'>all previous features</p>
                                    </div>
                                    <p className='pricing-card-button-small'>
                                        Choose
                                    </p>
                                </div>
                            </InView>
                        </div>
                    </div>
                </div>
            </div> 
        );
    }
}


const mapStateToProps = state => ({
    // room
    auth: state.auth
})

export default connect(mapStateToProps, {
    logoutUser
})(LandingPage);