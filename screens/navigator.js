import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Root } from 'native-base';
import HomeScreen from './HomeScreen'
import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated','Setting a timer for a long period of time, i.e. multiple minutes'])

import * as firebase from 'firebase'

import { StyleSheet, Text, TextInput, View } from 'react-native'
import { createStackNavigator, createDrawerNavigator, createSwitchNavigator } from 'react-navigation'
import SignUp from './SignUp'
import Login from './Login'

export const AppStackNavigator = createSwitchNavigator(
  {
    Home: { screen: HomeScreen },
    SignIn: { screen: Login },
		Register: { screen: SignUp },
  },
  {
    index: 0,
    initialRouteName: 'SignIn',
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false
    }
  }
)
