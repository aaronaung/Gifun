import React from 'react'
import { Router } from '@reach/router'
import PrivateRoute from './wrappers/PrivateRoute'
import Layout from './wrappers/Layout'
import Gifs from './components/Gifs'

const App = () => {
    return (
        <Layout>
            <Router>
                <PrivateRoute path="/app">
                    <PrivateRoute exact path="/my" component={Gifs} />
                    <PrivateRoute exact path="/" default={true} component={Gifs} />
                </PrivateRoute>
            </Router>
        </Layout>
    )
}
function PublicRoute(props) {
    return <div>{props.children}</div>
}

export default App
