import React, { useEffect } from 'react'

import {connect} from 'react-redux'
import queryString from 'query-string';

import { setJwtToken } from '../../actions/authActions'

const LoginCallback = props => {
    useEffect(() => {
        if (!props.auth.isAuthenticated) {
            const token = '' + queryString.parse(props.location.search).token
            if (token === '') console.log("WARNNINGNGNINGG")
            props.setJwtToken(token)
        }
        props.history.push('/account-portal')
    },[])

    return(
        <div className="loader-wrapper">
            <span className="circle circle-1"></span>
            <span className="circle circle-2"></span>
            <span className="circle circle-3"></span>
            <span className="circle circle-4"></span>
            <span className="circle circle-5"></span>
            <span className="circle circle-6"></span>
        </div>)
}

const mapStateToProps = state => ({
    // auth
    auth: state.auth,
})

export default connect(mapStateToProps, {
    setJwtToken
})(LoginCallback)