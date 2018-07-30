import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		Button, Text, Left, Right, Body, Icon, Card, CardItem,
		Textarea, Fab, Spinner, Toast } from 'native-base';
import { FlatList, Modal, Image, View, Dimensions, TouchableOpacity,
		Platform, Linking } from 'react-native';
import { Marker, Callout } from 'react-native-maps';

import * as firebase from 'firebase'
import MapView from 'react-native-maps';

export default class Home extends React.Component {

	constructor(props) {
	    super(props);

	    this.state = {
	    	postModal: false,

	    	region: null,

	    	posts: [],
	    	refreshing: true,

	    	latitude: 200,	//out of bounds of valid latitude
	    	longitude: 200,	//out of bounds of valid longitude

	    	currServerTime: null,
	    	currUser: null,
	    	currKey: 0,
	    	currPhoto: '',
	    	currName: '',
	    	currLocation: '',
	    	currDateTime: new Date(),
	    	currEndTime: new Date(),
	    	currRemarks: '',
	    	currComments: [],
	    	currNewComment: '',
	    };
	}

	makeRemoteRequest = () => {
      	firebase.database().ref('posts').once('value').then((snap) => {
	        var items = [];
	        this.getItems(snap, items);
        	this.setState({
        		posts: items
	        });
	    });
	}

	getItems = (snap, items) => {
        snap.forEach((child) => {
        	if (this.state.currServerTime < child.val().end_datetime) {
	            items.push({
	                key: child.key,
	                photo: child.val().photo,
	                name: child.val().name,
	                location: child.val().location,
	                end_datetime: new Date(child.val().end_datetime),
	                datetime: new Date(child.val().datetime),
	                remarks: child.val().remarks
            	});
            }
        });
    }

    getComments = (key) => {
    	firebase.database().ref('comments/' + key).on('value', (snap) => {
	        var items = [];

	        snap.forEach((child) => {
	        	items.push({
	        		key:child.key,
	        		user: child.val().user,
	        		message: child.val().message,
	        		datetime: new Date(child.val().datetime)
	        	})
	        });

        	this.setState({
        		currComments: items
	        });
	    });
    }

    submitComment = () => {
    	firebase.database().ref('comments/' + this.state.currKey).push({
    		user: this.state.currUser.email,
    		message: this.state.currNewComment,
    		datetime: firebase.database.ServerValue.TIMESTAMP
    	});
    }

    handleRefresh = () => {
    	this.setState({refreshing:true});

    	// Get current user
		const user = firebase.auth().currentUser;
		this.setState({
			currUser:user,
		});

		// Get server time
		firebase.database().ref("/.info/serverTimeOffset").on('value', (offset) => {
			var offsetVal = offset.val() || 0;
			var serverTime = Date.now() + offsetVal;
			this.setState({currServerTime: serverTime});
		});

		// Get user location
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					refreshing: false
				});
	    	},
			(error) => console.log(error),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		).then( () => {
			this.makeRemoteRequest();
		});
    }

	componentDidMount() {
		this.handleRefresh();
	}

	render() {
		return (
			<Container>
				<Modal
				animationType='fade'
				transparent={false}
				visible={this.state.postModal}
				onRequestClose={()=>this.setState({
					currKey: 0,
			    	currPhoto: '',
			    	currName: '',
			    	currLocation: '',
			    	currRemarks: '',
			    	currComments: [],
			    	currNewComment: '',
					postModal:false
				})}>
					<Header>
						<Left>
							<Button transparent onPress={()=>this.setState({postModal:false})}>
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
							<Text
								style={{fontSize: 20}}
								onPress={() => {
								let maps_url = 'https://www.google.com/maps/search/?api=1&query=' +
												this.state.currLocation.latitude + ',' +
												this.state.currLocation.longitude + '&query_place_id=' +
												this.state.currLocation.google_id;
								Linking.openURL(maps_url);
							}}>
								{this.state.currLocation.name}
							</Text>
							<Text></Text>

							<Text style={{fontWeight: 'bold'}}>Address:</Text>
							<Text onPress={() => {
								let maps_url = 'https://www.google.com/maps/search/?api=1&query=' +
												this.state.currLocation.latitude + ',' +
												this.state.currLocation.longitude + '&query_place_id=' +
												this.state.currLocation.google_id;
								Linking.openURL(maps_url);
							}}>
								{this.state.currLocation.address}
							</Text>
							<Text></Text>

							<Text style={{fontWeight: 'bold'}}>End DateTime:</Text>
							<Text>{this.state.currEndTime.toLocaleString()}</Text>
							<Text></Text>

							<Text style={{fontWeight: 'bold'}}>Remarks:</Text>
							<Text>{this.state.currRemarks}</Text>
							<Text></Text>

							<Text>Posted by: {this.state.currName}</Text>
							<Text>Post DateTime: {this.state.currDateTime.toLocaleString()}</Text>
							<Text></Text>

							<Text style={{fontWeight: 'bold'}}>Comments:</Text>
							<Text></Text>
							<FlatList
								data = {this.state.currComments}

								renderItem={({item}) =>
									<Card transparent>
										<CardItem cardBody>
											<Text style={{ fontWeight: '500' }}>   {item.user}:</Text>
										</CardItem>
										<CardItem>
											<Text>{item.message}</Text>
										</CardItem>
										<CardItem cardBody>
											<Text style={{ fontSize: 14 }}>   {item.datetime.toLocaleString()}</Text>
										</CardItem>
									</Card>
								}
							/>

							<Text></Text>
							<Textarea
			            		rowSpan={4}
			            		bordered placeholder="Leave a comment here!"
			            		value={this.state.currNewComment}
			            		onChangeText={(text) => this.setState({currNewComment:text})}
			            	/>
							<Button onPress={() => {
								if (this.state.currNewComment !== '') {
									this.submitComment();
									this.setState({currNewComment:''});
									// Toast.show({
									// 	type: 'success',
									// 	text: 'Comment submitted',
									// 	duration: 2500,
									// 	buttonText: 'OK'
									// });
								}
							}}>
								<Text>Add comment</Text>
							</Button>
						</View>
					</Content>
				</Modal>

				<Header
					style={{backgroundColor: "#567a8d"}}>
					<Left>
						<Button transparent onPress={()=>this.props.navigation.openDrawer()}>
							<Icon type='Entypo' name='menu' style={{ color: 'white'}}/>
						</Button>
					</Left>
					<Body>
						<Title>Nearby</Title>
					</Body>
					<Right>
						<Button transparent onPress={()=> {
							this.handleRefresh();
						}}>
							<Icon type='Entypo' name='cw' style={{ color: 'white'}}/>
						</Button>
					</Right>
				</Header>

				<Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
				{ this.state.refreshing ? (
					<Spinner color='blue' />
				) : (
					<View style={{width : Dimensions.get('window').width, height : Dimensions.get('window').height, flex: 1}}>
						<MapView
						    initialRegion={{
						      latitude: this.state.latitude,
						      longitude: this.state.longitude,
						      latitudeDelta: 0.009043,
						      longitudeDelta: 0.002465,
						    }}

						    showsUserLocation={true}
						    onPress={() => console.log("click")}

						    style={{
								left: 0,
								right: 0,
								top: 0,
								bottom: 0,
								position: 'absolute'
							}}
						>
						{this.state.posts.map(marker => (
						    <Marker
						    	coordinate={{
						    		latitude: marker.location.latitude,
						    		longitude: marker.location.longitude
						    	}}
						    	onPress={()=> {
						    		this.setState({
										postModal:true,
										currKey: marker.key,
										currPhoto: marker.photo,
										currName: marker.name,
										currLocation: marker.location,
										currEndTime: marker.end_datetime,
										currDateTime: marker.datetime,
										currRemarks: marker.remarks
									});

									this.getComments(marker.key);
						    	}}
						    />
						 ))}
						</MapView>
					</View>
				)
				}
				</Content>
			</Container>
			
		);
	}
}
