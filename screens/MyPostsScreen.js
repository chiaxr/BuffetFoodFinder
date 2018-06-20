import React, { Component } from 'react';
import { Text, Flatlist } from 'react-native'
import { Container, Header, Title, Button, Left, Right, Body, Icon } from 'native-base';

export default class MyPosts extends Component {
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
						<Title>My Posts</Title>
					</Body>
					<Right />
				</Header>
			</Container>
		);
	}
}