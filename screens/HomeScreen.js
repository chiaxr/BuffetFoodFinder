import React, { Component } from 'react';
import { Container, Header, Content, Footer, Title,
		Button, Text, Left, Right, Body, Icon, Card, CardItem,
		Form, Item, Label, Input } from 'native-base';
import { FlatList, Modal, Image, View, Dimensions, TouchableOpacity, Platform } from 'react-native';

import ImagePicker from 'react-native-image-crop-picker'
import RNFetchBlob from 'rn-fetch-blob'

import * as firebase from 'firebase'

export default class Home extends React.Component {
	constructor(props) {
	    super(props);

	    this.state = {
	    	addModal: false,
	    	postModal: false,

	    	posts: [],
	    	refreshing: false,

	    	currUser: null,
	    	currKey: 0,
	    	currPhoto: '',
	    	currName: '',
	    	currLocation: '',
	    	currTime: '',
	    	currDate: '',

	    	addLocation: '',
	    	addPhotoPath: '',
	    	addPhotoURL: '',
	    	addPhotoMime:''
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
					date: datetime.getDate() + "/" + (datetime.getMonth()+1) + "/" + datetime.getFullYear(),
					time: datetime.getHours() + ":" + ("00"+datetime.getMinutes()).slice(-2)
				})
	        })
	        .catch((error) => {
	          	console.log(error)
	        })
	}

	makeRemoteRequest = () => {
	    firebase.database().ref('posts').on('value',(snap) => {
	        var items = [];
	        this.getItems(snap, items);
	        items = items.reverse();
        	this.setState({
        		posts: items,
        		refreshing: false,
	        }
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
                date: child.val().date,
            });
        });
    }

    handleRefresh = () => {
    	this.setState({refreshing:true});
    }

	componentDidMount() {
		const user = firebase.auth().currentUser;
		this.setState({currUser:user.email});
		this.makeRemoteRequest();
	}

	render() {
		return (
			<Container>
				<Modal
				animationType='slide'
				transparent={false}
				visible={this.state.addModal}
				onRequestClose={()=>this.setState({
					addLocation:'',
					addPhotoPath: '',
			    	addPhotoURL: '',
			    	addPhotoMime:'',
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
							<Item stackedLabel>
				            	<Label>Location</Label>
				            	<Input onChangeText={(text) => this.setState({addLocation:text})} />
				            </Item>
				            <Item stackedLabel>
				            	<Label>Photo</Label>
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
				            </Item>
						</Form>

						<Button full onPress={()=> {
							this.submitPost();

							this.setState({
								addLocation:'',
								addPhotoPath: '',
						    	addPhotoURL: '',
						    	addPhotoMime:'',
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
							<Text>Loc: {this.state.currLocation}</Text>
							<Text>Posted by: {this.state.currName}</Text>
							<Text>Time: {this.state.currTime}</Text>
							<Text>Date: {this.state.currDate}</Text>
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
								addLocation:'',
								addPhotoPath: '',
						    	addPhotoURL: '',
						    	addPhotoMime:'',
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
							<TouchableOpacity onPress={()=> this.setState({
								postModal:true,
								currKey: item.key,
								currPhoto: item.photo,
								currName: item.name,
								currLocation: item.location,
								currTime: item.time,
								currDate: item.date,
							})}>
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