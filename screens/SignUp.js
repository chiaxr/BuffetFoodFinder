// SignUp.js
import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, Image, TouchableOpacity } from 'react-native'
import * as firebase from 'firebase'

export default class SignUp extends React.Component {

  state = { email: '', password: '', errorMessage: null }
    handleSignUp = () => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(() => this.props.navigation.navigate('Home'))
        .catch(error => this.setState({ errorMessage: error.message }))
  }
  render() {
    return (
      <View style={styles.container}>

        <Text>Register with BuffetFoodFinder now!</Text>

        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}

        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Name"
          value={ this.state.nameInput }
        />
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />

        <TouchableOpacity
        style={styles.signUpButton}
        onPress={this.handleSignUp}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.loginText}
        onPress={() => this.props.navigation.navigate('SignIn')}
        >
          <Text>Already have an account? Login here!</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#b0cad6',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  signUpButton: {
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
  loginText: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
