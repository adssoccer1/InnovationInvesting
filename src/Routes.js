  
import React from 'react'
import { Route, HashRouter, Switch } from 'react-router-dom'

import App from './App'
import Privacy from './Privacy'

const Routes = () => {
    return (
        <HashRouter>
            <Switch>
                <Route exact path='/' render={ () => <App /> } />
                <Route exact path='/privacy' render={ () => <Privacy /> } />
                <Route render={ () => <App /> } />
            </Switch>
        </HashRouter>
    )
}

export default Routes