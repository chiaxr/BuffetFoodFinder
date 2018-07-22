import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		Button, Text, Left, Right, Body, Icon, Card, CardItem,
		Form, Item, Label, Input, Textarea } from 'native-base';
import { FlatList, Modal, Image, View, Dimensions, TouchableOpacity,
		Platform, Linking } from 'react-native';

import ImagePicker from 'react-native-image-crop-picker'
import RNFetchBlob from 'rn-fetch-blob'
import RNGooglePlacePicker from 'react-native-google-place-picker'
import DateTimePicker from 'react-native-modal-datetime-picker'

import * as firebase from 'firebase'

export default class Home extends React.Component {
	constructor(props) {
	    super(props);

	    this.state = {
	    	addModal: false,
	    	postModal: false,
	    	DateTimePickerModal: false,

	    	posts: [],
	    	refreshing: false,

	    	currServerTime: null,
	    	currUser: null,
	    	currKey: 0,
	    	currPhoto: '',
	    	currName: '',
	    	currLocation: '',
	    	currDateTime: new Date(),
	    	currEndTime: new Date(),
	    	currRemarks: '',
	    	currComments: null,
	    	currNewComment: '',

	    	addLocation: null,
	    	addEndTime: 0,
	    	addPhotoPath: '',
	    	addPhotoURL: '',
	    	addPhotoMime:'',
	    	addRemarks: ''
	    };
	}

	submitPost () {
		const Blob = RNFetchBlob.polyfill.Blob
	    const fs = RNFetchBlob.fs
	    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
	    window.Blob = Blob

	    let datetime = new Date()
	    const imagePath = this.state.addPhotoPath
	    const sessionID = datetime.getTime();
		let imageName = this.state.currUser + '_' + sessionID
	    let uploadBlob = null

		const imageRef = firebase.storage().ref('cardImages').child(`${imageName}`)
	    let mime = this.state.addPhotoMime
	    let loc = this.state.addLocation
	    let remarks = this.state.addRemarks
	    let endtime = this.state.addEndTime
	    fs.readFile(imagePath, 'base64')
	        .then((data) => {
	          	return Blob.build(data, { type: `${mime};BASE64` })
	      	})
	        .then((blob) => {
		        uploadBlob = blob
		        return imageRef.put(blob, { contentType: mime })
	        })
	        .then(() => {
		        uploadBlob.close()
		        return imageRef.getDownloadURL()
	        })
			.then((url) => {
				firebase.database().ref('posts').push({
					name: this.state.currUser,
					location: loc,
					photo: url,
					end_datetime: endtime,
					datetime: firebase.database.ServerValue.TIMESTAMP,
					remarks: remarks
				})
	        })
	        .catch((error) => {
	          	console.log(error)
	        })
	}

	getRemainingTime (endMs) {
		let diffMs = endMs - this.state.currServerTime;
		console.log(this.state.currServerTime);
		let diffHrs = Math.floor((diffMs % 86400000) / 3600000);
		let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
		return diffHrs + " hrs " + diffMins + " mins";
	}

	makeRemoteRequest = () => {
		firebase.database().ref("/.info/serverTimeOffset").on('value', (offset) => {
			var offsetVal = offset.val() || 0;
			var serverTime = Date.now() + offsetVal;
			this.setState({currServerTime: serverTime});
		});

	    firebase.database().ref('posts').on('value',(snap) => {
	        var items = [];
	        this.getItems(snap, items);
	        items = items.reverse();
        	this.setState({
        		posts: items,
        		refreshing: false,
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

    handleRefresh = () => {
    	this.setState({refreshing:true});
    }

	componentDidMount() {
		const user = firebase.auth().currentUser;
		this.setState({
			currUser:user.email,
		});
		this.makeRemoteRequest();
	}

	render() {
		return (
			<Container>
				<DateTimePicker
        			isVisible={this.state.DateTimePickerModal}
        			mode='time'
        			is24Hour={false}
        			onConfirm= {(time) => {
        				this.setState({addEndTime:time.valueOf()});
        				this.setState({DateTimePickerModal:false});
        			}}
        			onCancel={() => this.setState({DateTimePickerModal:false})}
			    />
			    
				<Modal
				animationType='slide'
				transparent={false}
				visible={this.state.addModal}
				onRequestClose={()=>this.setState({
					addLocation:null,
					addEndTime: '',
					addPhotoPath: '',
			    	addPhotoURL: '',
			    	addPhotoMime:'',
			    	addRemarks: '',
					addModal:false
					})}
				>
					<Header>
						<Left>
							<Button transparent onPress={()=>this.setState({addModal:false})}>
								<Icon type='Entypo' name='chevron-left' />
							</Button>
						</Left>
						<Body>
							<Title>Add new post</Title>
						</Body>
						<Right />
					</Header>
					<Content>
						<Form>
			            	<Label>Location</Label>
			            	<Text></Text>
			            	{this.state.addLocation &&
			            		<Text>{this.state.addLocation.name}</Text>
			            	}
			            	<Button onPress={() => {
			            		RNGooglePlacePicker.show((response) => {
									if (response.didCancel) {
										console.log('User cancelled GooglePlacePicker');
									}
									else if (response.error) {
								 		console.log('GooglePlacePicker Error: ', response.error);
									}
									else {
										this.setState({addLocation: response});
									}
								})
			            	}}>
			            		<Text>Select Location</Text>
			            	</Button>
			            	<Text></Text>

			            	<Label>Photo</Label>
			            	<Text></Text>
			            	<Button onPress={() => {
			            		ImagePicker.openPicker({
									compressImageQuality: 0.8,
									mediaType: 'photo'
								}).then(image => {
									let path = image.path
									let mime = image.mime
									this.setState({
										addPhotoPath:path,
										addPhotoMime:mime
									})
								});
							}}>
			            		<Text>Select Photo</Text>
			            	</Button>
			            	{this.state.addPhotoPath !== '' &&
			            		<Text>Image selected</Text>
			            	}
			            	<Text></Text>

			            	<Label>End-Time</Label>
			            	<Text></Text>
			            	<Button onPress={() => {
			            		this.setState({DateTimePickerModal:true})
			            	}}>
			            		<Text>Select end-time</Text>
			            	</Button>
			            	
			            	<Text></Text>

			            	<Label>Remarks</Label>
			            	<Textarea
			            		rowSpan={5}
			            		bordered placeholder="Any additional details e.g. room no, floor, landmarks"
			            		value={this.state.addRemarks}
			            		onChangeText={(text) => this.setState({addRemarks:text})}
			            	/>
						</Form>

						<Button full onPress={()=> {
							this.submitPost();

							this.setState({
								addLocation: null,
								addEndTime: '',
								addPhotoPath: '',
						    	addPhotoURL: '',
						    	addPhotoMime:'',
						    	addRemarks: '',
								addModal:false
							});
						}}>
							<Text>Submit</Text>
						</Button>
					</Content>
				</Modal>

				<Modal
				animationType='fade'
				transparent={false}
				visible={this.state.postModal}
				onRequestClose={()=>this.setState({postModal:false})}
				>
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
							<Text onPress={() => {
								let maps_url = 'https://www.google.com/maps/search/?api=1&query=' +
												this.state.currLocation.latitude + ',' +
												this.state.currLocation.longitude + '&query_place_id=' +
												this.state.currLocation.google_id;		
								Linking.openURL(maps_url);
							}}>
								Location: {this.state.currLocation.name}
							</Text>
							<Text onPress={() => {
								let maps_url = 'https://www.google.com/maps/search/?api=1&query=' +
												this.state.currLocation.latitude + ',' +
												this.state.currLocation.longitude + '&query_place_id=' +
												this.state.currLocation.google_id;		
								Linking.openURL(maps_url);
							}}>
								Address: {this.state.currLocation.address}
							</Text>
							<Text></Text>

							<Text>End DateTime: {this.state.currEndTime.toLocaleString()}</Text>
							<Text></Text>

							<Text>Remarks:</Text>
							<Text>{this.state.currRemarks}</Text>
							<Text></Text>

							<Text>Posted by: {this.state.currName}</Text>
							<Text>Post DateTime: {this.state.currDateTime.toLocaleString()}</Text>
							<Text></Text>

							<Text>Comments:</Text>
							<Text></Text>

							<Textarea
			            		rowSpan={2}
			            		bordered placeholder="Leave a comment here!"
			            		value={this.state.currNewComment}
			            		onChangeText={(text) => this.setState({currNewComment:text})}
			            	/>
							<Button>
								<Text>Add comment</Text>
							</Button>
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
						<Button transparent onPress={()=>this.setState({
								addLocation:null,
								addEndTime: '',
								addPhotoPath: '',
						    	addPhotoURL: '',
						    	addPhotoMime:'',
						    	addRemarks: '',
								addModal:true
						})}>
							<Icon type='Entypo' name='plus' />
						</Button>
					</Right>
				</Header>
				
				<Content>
					<FlatList
						data = {this.state.posts}

						refreshing = {this.state.refreshing}
						onRefresh={this.handleRefresh}

						renderItem={({item}) =>
							<TouchableOpacity
								onPress={()=> this.setState({
									postModal:true,
									currKey: item.key,
									currPhoto: item.photo,
									currName: item.name,
									currLocation: item.location,
									currEndTime: item.end_datetime,
									currDateTime: item.datetime,
									currRemarks: item.remarks
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
										<Text>{item.location.name}</Text>
										<Text>Ending in {this.getRemainingTime(item.end_datetime.valueOf())}</Text>
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