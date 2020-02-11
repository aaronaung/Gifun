import React from 'react'
import { Router } from '@reach/router'
import PrivateRoute from './wrappers/PrivateRoute'
import Layout from './wrappers/Layout'
import Gifs from './components/Gifs'
import CreateGifs from './components/CreateGifs'
import NotFound from '../pages/404'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import { Provider as ReduxProvider } from 'react-redux'
import store from './redux/root.store'
import { CameraProvider } from './contexts/CameraContext.tsx'
import { SnackbarProvider } from './contexts/SnackbarContext'
import { red, green, yellow, blue, grey } from '@material-ui/core/colors'
import { TabProvider } from './contexts/TabContext'
import Betfame from './components/Betfame'

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    colors: {
        danger: red[500],
        success: green[400],
        warning: yellow[800],
        info: blue[500],
        default: grey[300],
    },
    overrides: {
        MuiSvgIcon: {
            root: {
                transition: 'color ease 0.5s',
            },
        },
    },
})

const App = () => {
    return (
        <ReduxProvider store={store}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <TabProvider>
                        <CameraProvider>
                            <Layout>
                                <Router>
                                    <PrivateRoute path="/app" component={Gifs} />
                                    <PublicRoute path="/app/create" component={CreateGifs} />
                                    <PrivateRoute path="/" default={true} component={NotFound} />
                                </Router>
                            </Layout>
                        </CameraProvider>
                    </TabProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </ReduxProvider>
    )
}
function PublicRoute(props) {
    let Component = props.component
    return <Component></Component>
}

export default App
