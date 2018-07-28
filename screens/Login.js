// Login.js
import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, Image, TouchableOpacity } from 'react-native'
import * as firebase from 'firebase'

export default class Login extends React.Component {
  state = { email: '', password: '', errorMessage: null }

  handleLogin = () => {
    const { email, password } = this.state
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.navigate('Home'))
      .catch(error => this.setState({ errorMessage: error.message }))
    console.log('handleLogin')
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.introText}> Welcome to BuffetFoodFinder </Text>
        <Image style={styles.bffLogo} source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}/>

        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}

        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}

        <TouchableOpacity
        style={styles.loginButton}
        onPress={this.handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.signUpText}
        onPress={() => this.props.navigation.navigate('Register')}
        >
          <Text>Dont have an account? Sign Up here!</Text>
        </TouchableOpacity>

      </View>
    )
  }
}
const styles = StyleSheet.create({
  bffLogo: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 0,
    marginBottom:10,
    alignSelf:'center',
    marginTop: 25,
    marginBottom: 70
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introText: {
    color:'black',
    alignSelf:'center',
  },

  textInput: {
    width: 300,
    backgroundColor: '#567a8d',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 14,
    color:'#ffffff',
    marginVertical: 10,
    paddingVertical:12
  },
  loginButton: {
    width:300,
    backgroundColor:'#1c313a',
    borderRadius:25,
    marginVertical:10,
    paddingVertical:12
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center'
  },
  signUpText: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
