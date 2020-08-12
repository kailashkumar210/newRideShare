import React, { Component } from 'react';
import { StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';

export default class RequestCommunityScreen extends Component {
  state = {
    text: '',
  };

  
  render() {
    

    return (
      <WebView
        source={{
          uri: 'https://docs.google.com/forms/d/e/1FAIpQLScjKFHVlOv7fhJj-QIpHNOZQkCyoGpFAkpiyHjSz5ptyLJ6Lg/viewform?hl=en',
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});