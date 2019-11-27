import React from 'react'
import { checkIsSignedIn } from '../services/auth'
import { navigate } from 'gatsby'

type Props = {
    component: any
    exact?: boolean
    location?: any
    path: string
    default?: boolean
}

function PrivateRoute(props: Props) {
    const [checking, setChecking] = React.useState(false)
    const [signedIn, setSignedIn] = React.useState(false)

    const { location } = props
    const Component = props.component

    React.useEffect(() => {
        checkIsSignedIn().then(signedIn => {
            if (location.pathname !== `/`) {
                if (!signedIn) {
                    // If the user is not logged in, redirect to the login page.
                    navigate(`/`)
                    return null
                } else {
                    if (location.search && location.search.startsWith('?authResponse=')) {
                        navigate(`/app`)
                    }
                }
            }
            setSignedIn(signedIn)
            setChecking(false)
        })
    }, [location.pathname, location.search])

    if (checking) {
        return <>...</>
    } else {
        return signedIn ? <Component {...props} /> : null
    }
}

export default PrivateRoute
