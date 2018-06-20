import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title, Button, Text, Left, Right, Body, Icon } from 'native-base';
import { ListView } from 'react-native';

import * as firebase from 'firebase'

export default class Home extends Component {
	render() {
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
					<Text>Add Item</Text>
				</Button>
			</Container>
		);
	}
}