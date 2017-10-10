import React from 'react';
import { Router,Scene } from 'react-native-router-flux';

import RegisterScreen from './src/screens/RegisterScreen'
import LoginCounselorContainer from './src/Containers/LoginCounselorContainer'
import InitialScreen from './src/screens/InitialScreen'
import LoginPresidentContainer from './src/Containers/LoginPresidentContainer'
import ProfileInfoScreen from './src/screens/ProfileInfoScreen'


export default class Routes extends React.Component {
  render() {
    return (
        <Router>
          <Scene key = 'root'>
            <Scene key = 'initialScreen' component = {InitialScreen} hideNavBar/>
            <Scene key = 'registerScreen' component = {RegisterScreen} hideNavBar/>
            <Scene key = 'loginCounselorScreen' component = {LoginCounselorContainer} hideNavBar/>
            <Scene key = 'loginPresidentScreen' component = {LoginPresidentContainer} hideNavBar/>
            <Scene key = 'profileInfoScreen' component = {ProfileInfoScreen} hideNavBar/>
            <Scene key = 'registerScreen' component = {RegisterScreen} hideNavBar/>
          </Scene>
        </Router>
    );
  }
}
