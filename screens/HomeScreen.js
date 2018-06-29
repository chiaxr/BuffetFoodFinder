import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		 Button, Text, Left, Right, Body, Icon, Card, CardItem } from 'native-base';
import { FlatList, Modal, Image, View, Dimensions, TouchableOpacity } from 'react-native';

import * as firebase from 'firebase'

export default class Home extends Component {
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
						<Image
							source={{uri: this.state.currPhoto}}
							style={{height: 300, width: Dimensions.get('window').width, flex:1}}
						/>
						<View style={{
				        	flexDirection: 'column',
				        	padding: 20,
				        }}>
							<Text>Name: {this.state.currName}</Text>
							<Text>Key: {this.state.currKey}</Text>
							<Text>Loc: {this.state.currLocation}</Text>
							<Text>Time: {this.state.currTime}</Text>
						</View>
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
							<TouchableOpacity onPress={()=> this.setState({
											modalVisible:true,
											currKey: item.key,
											currPhoto: item.photo,
											currName: item.name,
											currLocation: item.location,
											currTime: item.time,
								})}
							>
							<Card>
								<CardItem cardBody>
									<Image
										source={{uri: item.photo}}
										style={{height: 200, width: Dimensions.get('window').width, flex:1}}
									/>
								</CardItem>
								<CardItem>
									<Body>
										<Text>Loc: {item.location}</Text>
										<Text>Time: {item.time}</Text>
									</Body>
								</CardItem>
							</Card>
							</TouchableOpacity>
						}
					/>
				</Content>
			</Container>
		);
	}
}