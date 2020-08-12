import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';

const Help : React.FC = (props: any) => {

  const  navigation = useNavigation();

      let url = '';

    if (props.preferences.isDriver) {
      url = 'https://indd.adobe.com/view/62b0f0ce-673d-49bf-b604-49403a66e62a';
    } else {
      url = 'https://indd.adobe.com/view/7773f1cd-91f7-4898-9ef5-621843ec91ef';
    }


  return (
    <View style={styles.container}>
    <Header
        headerText={'Help'}
        leftIcon={'arrow-back'}
        onBackPress={() => navigation.navigate('Home')}
    />
    <WebView
      androidHardwareAccelerationDisabled={true} 
      source={{
              uri: url,
             }}
      />
  </View>
);
    // let url = '';

    // if (this.props.preferences.isDriver) {
    //   url = 'https://indd.adobe.com/view/62b0f0ce-673d-49bf-b604-49403a66e62a';
    // } else {
    //   url = 'https://indd.adobe.com/view/7773f1cd-91f7-4898-9ef5-621843ec91ef';
    // }

    // return <WebView 
    // androidHardwareAccelerationDisabled={true}          
    // source={{ uri: url }} />;

}

function mapStateToProps(state: any) {
    return {
        preferences: state.preferences,
    };
}
//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, null)(Help)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
