import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon } from 'native-base';

export default class Settings extends Component {
	render() {
		return (
			<Container>
				<Header
					style={{backgroundColor: "#567a8d"}}>
					<Left>
						<Button transparent onPress={()=>this.props.navigation.openDrawer()}>
                <Icon name='menu' style={{ color: 'white'}}/>
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
