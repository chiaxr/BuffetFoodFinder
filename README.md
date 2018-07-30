# BuffetFoodFinder
Quick and easy way to find buffet leftovers in your area!  
Built using React Native and Firebase as a NUS Orbital 2018 project.

## Features
- User authentication
- Sort posts by proximity or time-of-completion
- Map view to find nearby buffets quickly
- Standardised post format to ensure relevant details are present

## Getting Started
Install all dependencies using:
```sh
yarn install
```
### Dependencies used:
- [react-navigation](https://reactnavigation.org/)
- [native-base](https://nativebase.io/)
- [firebase](https://firebase.google.com/docs/web/setup)
- [react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)
- [rn-fetch-blob](https://github.com/joltup/rn-fetch-blob)
- [react-native-google-place-picker](https://github.com/zhangtaii/react-native-google-place-picker)
	- In \node_modules\react-native-google-place-picker\android\src\main\java\com\reactlibraryRNGooglePlacePickerPackage.java:
		- Remove `@Override` on line 20
- [react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker)
- [react-native-maps](https://github.com/react-community/react-native-maps)
	- In \node_modules\react-native-maps/lib/android/build.gradle:
		- Change `compileOnly` --> `provided`
		- Change `implementation` --> `compile`