import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Root } from 'native-base';
import HomeScreen from './screens/HomeScreen'
import MyPostsScreen from './screens/MyPostsScreen'
import SettingsScreen from './screens/SettingsScreen'
import ProfileScreen from './screens/ProfileScreen'
import MapScreen from './screens/MapScreen'

import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated','Setting a timer for a long period of time, i.e. multiple minutes'])
console.disableYellowBox = true

import * as firebase from 'firebase'

import { StyleSheet, Text, TextInput, View } from 'react-native'
import { createStackNavigator, createDrawerNavigator } from 'react-navigation'
import SignUp from './screens/SignUp'
import Login from './screens/Login'

import {AppStackNavigator} from './screens/navigator'

const firebaseConfig = {
	apiKey: "AIzaSyDt6LI3R70kjM2hT3bUFdHvHmjB7IU____",
	authDomain: "buffetfoodfinder.firebaseapp.com",
	databaseURL: "https://buffetfoodfinder.firebaseio.com",
	projectId: "buffetfoodfinder",
	storageBucket: "buffetfoodfinder.appspot.com",
	messagingSenderId: "17482956183"
};
firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {

	render() {
		return (
			<Root>
				<Drawer />
			</Root>
		);
	}
}

export const Drawer = createDrawerNavigator(
	{
		Home: { screen: AppStackNavigator },
		Nearby: { screen: MapScreen },
		Profile: { screen: ProfileScreen },
		MyPost: { screen: MyPostsScreen },
		Settings: { screen: SettingsScreen},
	},
	{
		initialRouteName: 'Home',
		contentOptions: {
			activeTintColor: 'blue'
		},
	}
);
