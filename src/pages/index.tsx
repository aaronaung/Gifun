import React from 'react'
import SEO from '../seo'
import { handleLogin } from '../app/services/auth'
import { navigate } from 'gatsby'
import { LandingPage } from '../../landing'

const Landing = () => {
    const handleSubmit = React.useCallback(() => {
        handleLogin(user => navigate(`/app`))
    }, [])

    // return (
    //     <div>
    //         <SEO title="Home" keywords={[`gatsby`, `application`, `react`, `blockstack`]} />
    //         <button onClick={handleSubmit}> LOGIN </button>
    //     </div>
    // )
    return <LandingPage></LandingPage>
}

export default Landing
