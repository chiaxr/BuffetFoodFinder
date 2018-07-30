import React, { Component } from 'react';
import { Navigation, StyleSheet, Platform, Image, Text, View, TouchableOpacity } from 'react-native'
import { Container, Header, Title, Button, Left, Right, Body, Icon, Root } from 'native-base';
import * as firebase from 'firebase'
import SignIn from './Login'

export default class ProfileScreen extends Component {
  state = { currentUser: null }


  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
  }

  signOutUser = () => {
    firebase.auth().signOut();
    this.props.navigation.navigate('SignIn');
  }

  render() {
    const { currentUser } = this.state
    return (
      <View style={styles.container}>
          <Header
            style={{ backgroundColor: "#567a8d", borderBottomWidth: 0}}>
            <Left>
              <Button transparent onPress={()=>this.props.navigation.openDrawer()}>
                <Icon name='menu' style={{ color: 'white'}}/>
              </Button>
            </Left>
            <Body>
              <Title>My Profile</Title>
            </Body>
            <Right />
          </Header>

          <View style={styles.header}></View>
          <Image style={styles.avatar} source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}/>

          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.email}> {currentUser && currentUser.email} </Text>

              <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() =>  this.props.navigation.navigate('MyPost') }
              >
              <Text
                style={styles.buttonText}>View my post</Text>
              </TouchableOpacity>

              <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() =>  this.signOutUser() }
              >
                <Text
                  style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
   header:{
    backgroundColor: "#567a8d",
    height:200,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
    alignSelf:'center',
    position: 'absolute',
    marginTop: 95
  },
  nameInput: {
    fontSize:30,
    color: 'black',
    marginTop:80,
    textAlign: 'center'
  },
  email: {
    fontSize:16,
    color: 'black',
    marginTop:80,
    textAlign: 'center'
  },
  buttonContainer: {
    marginTop:25,
    height:45,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center',
    width:250,
    borderRadius:30,
    backgroundColor: "#1c313a",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center'
  }
})
