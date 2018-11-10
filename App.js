import React from 'react'
import { StyleSheet, Platform, Image, Text, View } from 'react-native'

import { SwitchNavigator } from 'react-navigation'
// import the different screens
import Loading from './screens/Auth/Loading'
import SignUp from './screens/Auth/SignUp'
import Login from './screens/Auth/Login'
import Main from './screens/Auth/Main'
// create our app's navigation stack
const App = SwitchNavigator(
    {
        Loading,
        SignUp,
        Login,
        Main
    },
    {
        initialRouteName: 'Loading'
    }
)
export default App