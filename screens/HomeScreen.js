import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		Button, Text, Left, Right, Body, Icon, Card, CardItem } from 'native-base';
import { StyleSheet, Platform, FlatList,
		Modal, Image, View } from 'react-native';

import * as firebase from 'firebase'

export default class Home extends React.Component {
	state = { currentUser: null }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
  }
	constructor(props) {
		    super(props);

		    this.state = {
		    	loading: true,
		    	modalVisible: false,
		    	posts: [],
		    	currKey: 0,
		    	currPhoto: '',
		    	currName: '',
		    	currLocation: '',
		    	currTime: 0
		    };
		}

		makeRemoteRequest = () => {
		    firebase.database().ref('posts').on('value', (snap) => {
		        var items = [];
		        this.getItems(snap, items);
		        // items = items.reverse();
	        	this.setState(
		            {posts: items}
		        );
		    });
		}

		getItems = (snap, items) => {
	        snap.forEach((child) => {
	            items.push({
	                key: child.key,
	                photo: child.val().photo,
	                name: child.val().name,
	                location: child.val().location,
	                time: child.val().time,
	            });
	        });
	    }

		componentDidMount() {
			this.makeRemoteRequest();
		}

	render() {
		const { currentUser } = this.state

		return (
			<Container>
				 <Modal
					animationType='fade'
					transparent={false}
					visible={this.state.modalVisible}
					onRequestClose={()=>this.setState({modalVisible:false})}
					>
						<Header>
							<Left>
								<Button transparent onPress={()=>this.setState({modalVisible:false})}>
									<Icon type='Entypo' name='chevron-left' />
								</Button>
							</Left>
							<Body>
								<Title>Post Details</Title>
							</Body>
							<Right />
						</Header>
						<Content>
							<Text>Name: {this.state.currName}</Text>
							<Text>Key: {this.state.currKey}</Text>
							<Text>Loc: {this.state.currLocation}</Text>
							<Text>Time: {this.state.currTime}</Text>
							<Text>Photo URL: {this.state.currPhoto}</Text>
							<Button onPress={()=>this.setState({modalVisible:false})}>
								<Text>Cancel</Text>
							</Button>
						</Content>
					</Modal>

				<Header>
					<Left>
						<Button transparent onPress={()=>this.props.navigation.openDrawer()}>
							<Icon type='Entypo' name='menu' />
						</Button>
					</Left>
					<Body>
						<Title>Home</Title>
					</Body>

					<Right>
						<Button transparent>
							<Icon type='Entypo' name='plus' />
						</Button>
					</Right>
				</Header>

				<Content>
					<FlatList
						data = {this.state.posts}

						renderItem={({item}) =>
							<Card>
								<CardItem button onPress={()=> this.setState({
											modalVisible:true,
											currKey: item.key,
											currPhoto: item.photo,
											currName: item.name,
											currLocation: item.location,
											currTime: item.time,
								})}>
								<Body>
									<Text>Loc: {item.location}</Text>
									<Text>Time: {item.time}</Text>
								</Body>
								</CardItem>
							</Card>
						}
					/>
				</Content>
			</Container>
		);
	}
}
