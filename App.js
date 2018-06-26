import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon } from 'native-base';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation'
import HomeScreen from './screens/HomeScreen'
import MyPostsScreen from './screens/MyPostsScreen'
import SettingsScreen from './screens/SettingsScreen'

import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])

import * as firebase from 'firebase'

import { StyleSheet, Platform, Image, Text, View } from 'react-native'
import { createSwitchNavigator } from 'react-navigation'
import Loading from './screens/Loading'
import SignUp from './screens/SignUp'
import Login from './screens/Login'
import { DrawerItems, SafeAreaView } from 'react-navigation';

const firebaseConfig = {
	apiKey: "AIzaSyDt6LI3R70kjM2hT3bUFdHvHmjB7IUj9hA",
	authDomain: "buffetfoodfinder.firebaseapp.com",
	databaseURL: "https://buffetfoodfinder.firebaseio.com",
	projectId: "buffetfoodfinder",
	storageBucket: "buffetfoodfinder.appspot.com",
	messagingSenderId: "17482956183"
};
firebase.initializeApp(firebaseConfig);

export default class App extends Component {
	render() {
		return (
			// <AppDrawerNavigator />
			<AppSwitchNavigator />
		);
	}
}

const AppSwitchNavigator = createSwitchNavigator(
  {
    Loading,
    SignUp,
    Login,
		HomeScreen
  },
  {
    initialRouteName: 'Loading'
  }
)
