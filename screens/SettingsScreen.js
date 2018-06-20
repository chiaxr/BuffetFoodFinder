import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon } from 'native-base';

export default class Settings extends Component {
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
						<Title>Settings</Title>
					</Body>
					<Right />
				</Header>
			</Container>
		);
	}
}