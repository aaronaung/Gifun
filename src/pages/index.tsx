import React from 'react'
import SEO from '../seo'

class LandingPage extends React.Component {
    render() {
        return (
            <div>
                <SEO title="Home" keywords={[`gatsby`, `application`, `react`, `blockstack`]} />
                <button> LOGIN </button>
            </div>
        )
    }
}

export default LandingPage
