import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		Button, Text, Left, Right, Body, Icon, Card, CardItem,
		Form, Item, Label, Input, Textarea, Fab, Spinner, Toast } from 'native-base';
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
	    	refreshing: true,

	    	toggleSort: true,
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

	    	addLocation: null,
	    	addEndTime: null,
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
	    let endtime = this.state.addEndTime.valueOf()
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
		let diffHrs = Math.floor((diffMs % 86400000) / 3600000);
		let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
		return diffHrs + " hrs " + diffMins + " mins";
	}

	getHaversineDist (aLat, aLon, bLat, bLon) {
		const PI_360 = Math.PI / 360;
		const cLat = Math.cos((aLat + bLat) * PI_360);
		const dLat = (bLat - aLat) * PI_360;
		const dLon = (bLon - aLon) * PI_360;

		const f = dLat * dLat + cLat * cLat * dLon * dLon;
		const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));

		return 6378.137 * c; // dist in km
	}

	sortItems = (items, sortType) => {
    	if ( sortType === true ) { //sort by endtime
	    	items.sort(function(a,b) {
	    		return a.end_datetime - b.end_datetime;
	    	});
	    } else {
        	items.sort(function(a,b) { // sort by proximity
				return a.distance - b.distance;
        	});
        }
	}

	makeRemoteRequest = () => {
      	firebase.database().ref('posts').once('value').then((snap) => {
	        var items = [];
	        this.getItems(snap, items);

	        this.sortItems(items, this.state.toggleSort);

        	this.setState({
        		posts: items
	        });
	    });
	}

	getItems = (snap, items) => {
        snap.forEach((child) => {
            if (this.state.currServerTime < child.val().end_datetime) {
            	let h_dist = this.getHaversineDist(this.state.latitude, this.state.longitude,
            								  child.val().location.latitude, child.val().location.longitude);
	            items.push({
	                key: child.key,
	                photo: child.val().photo,
	                name: child.val().name,
	                location: child.val().location,
	                end_datetime: new Date(child.val().end_datetime),
	                datetime: new Date(child.val().datetime),
	                remarks: child.val().remarks,
	                distance: h_dist
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
    		user: this.state.currUser,
    		message: this.state.currNewComment,
    		datetime: firebase.database.ServerValue.TIMESTAMP
    	});
    }

    handleRefresh = () => {
    	this.setState({refreshing:true});
    	
    	// Get current user
		const user = firebase.auth().currentUser;
		this.setState({
			currUser:user.email,
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
				});
	    	},
			(error) => console.log(error),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		).then( () => {
			this.makeRemoteRequest();
			this.setState({refreshing: false});
		});
    }

	componentDidMount() {
		this.handleRefresh();
	}

	render() {
		return (
			<Container>
				<DateTimePicker
        			isVisible={this.state.DateTimePickerModal}
        			mode='time'
        			is24Hour={false}
        			onConfirm= {(time) => {
        				if (time.valueOf() < this.state.currServerTime) {
	        				time.setDate(time.getDate() + 1); // increment day by 1 if time selected is before current time
	        			}
        				this.setState({addEndTime:time});
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
					addEndTime: null,
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
			            	{this.state.addLocation &&
			            		<Text>{this.state.addLocation.name}</Text>
			            	}
			            	<Text></Text>
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
			            	{this.state.addPhotoPath !== '' &&
			            		<Text>Image selected</Text>
			            	}
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
			            	
			            	<Text></Text>

			            	<Label>End-Time</Label>
			            	{this.state.addEndTime &&
			            		<Text>{this.state.addEndTime.toLocaleString()}</Text>
			            	}
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

						{ (this.state.addLocation === null || this.state.addEndTime === null || this.state.addPhotoPath === '') ? (
						<Button full disabled>
							<Text>Submit</Text>
						</Button>
						) : (
						<Button full onPress={()=> {
							this.submitPost();

							this.setState({
								addLocation: null,
								addEndTime: null,
								addPhotoPath: '',
						    	addPhotoURL: '',
						    	addPhotoMime:'',
						    	addRemarks: '',
								addModal:false
							});

							this.handleRefresh();

							Toast.show({
								type: 'success',
								text: 'Post submitted',
								duration: 2500,
								buttonText: 'OK'
							});
						}}>
							<Text>Submit</Text>
						</Button>
						)}
					</Content>
				</Modal>

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
				        	<Text style={{fontWeight: 'bold'}}>Location:</Text>
							<Text onPress={() => {
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
									Toast.show({
										type: 'success',
										text: 'Comment submitted',
										duration: 2500,
										buttonText: 'OK'
									});
								}
							}}>
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
						<Button transparent onPress={()=> {
							this.handleRefresh();
						}}>
							<Icon type='Entypo' name='cw' />
						</Button>

						<Button transparent onPress={()=> {
							this.setState({toggleSort: !this.state.toggleSort});
							this.makeRemoteRequest();
						}}>
							{this.state.toggleSort ? (
								<Icon type='Entypo' name='time-slot' />
							) : (
								<Icon type='Entypo' name='location' />								
							)}
						</Button>
					</Right>
				</Header>

				<Container>
				<Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
				{ this.state.refreshing ? (
					<Spinner color='blue' />
				) : (
					<FlatList
						data = {this.state.posts}

						refreshing = {this.state.refreshing}
						onRefresh={() => this.handleRefresh()}

						renderItem={({item}) =>
							<TouchableOpacity
								onPress={()=> {
									this.setState({
										postModal:true,
										currKey: item.key,
										currPhoto: item.photo,
										currName: item.name,
										currLocation: item.location,
										currEndTime: item.end_datetime,
										currDateTime: item.datetime,
										currRemarks: item.remarks
									});

									this.getComments(item.key);
								}}
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
										<Text>{item.distance.toFixed(2)} km away</Text>
									</Body>
								</CardItem>
							</Card>
							</TouchableOpacity>
						}
					/>
				)
				}
				</Content>
				<Fab
					active={true}
					direction="up"
					containerStyle={{}}
					position='bottomRight'
					onPress={() => this.setState({
						addLocation: null,
						addEndTime: null,
						addPhotoPath: '',
						addPhotoURL: '',
						addPhotoMime:'',
						addRemarks: '',
						addModal:true
					})}
				>
					<Icon type='Entypo' name='plus' />
				</Fab>
				</Container>
			</Container>
		);
	}
}