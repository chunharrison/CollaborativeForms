import React, { useEffect } from 'react'

import {connect} from 'react-redux'
import queryString from 'query-string';

import { setJwtToken } from '../../actions/authActions'

const GoogleLoginCallback = props => {
    useEffect(() => {
        if (!props.auth.isAuthenticated) {
            const token = '' + queryString.parse(props.location.search).token
            if (token === '') console.log("WARNNINGNGNINGG")
            props.setJwtToken(token)
        }
        props.history.push('/account-portal')
    },[])

    return(<div>a yes</div>)
}

const mapStateToProps = state => ({
    // auth
    auth: state.auth,
})

export default connect(mapStateToProps, {
    setJwtToken
})(GoogleLoginCallback)