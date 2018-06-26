import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title, Button, Text, Left, Right, Body, Icon } from 'native-base';
import { ListView } from 'react-native';

import { StyleSheet, Platform, Image, View } from 'react-native'

import * as firebase from 'firebase'

export default class Home extends React.Component {
	state = { currentUser: null }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
  }

	render() {
		const { currentUser } = this.state

		return (
			<Container>
				<Header>
					<Left>
						<Button transparent onPress={()=>this.props.navigation.openDrawer()}>
							<Icon name='menu' />
						</Button>
					</Left>
					<Body>
						<Title>Home</Title>
					</Body>
					<Right />
				</Header>

				<Content>

				</Content>

				<Button block>
					<Text>Create Buffet Post</Text>
				</Button>
			</Container>
		);
	}
}
