import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import Constants from '../constants';

export default class RoundedButton extends React.Component {
  render() {
    const textColor = this.props.textColor;
    let defaultStyle = this.props.buttonRegular ? styles.buttonRegular : styles.button;
    let textStyle = this.props.textStyle ? this.props.textStyle : styles.buttonText;
    return (
      <TouchableHighlight style={[defaultStyle, this.props.containerViewStyle]} onPress={() => this.props.onPress()} underlayColor="#fff">
        <Text style={[textStyle, { color: textColor }]}>{this.props.title}</Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 2,
  },
  buttonRegular: {
    padding: 10,
  },
  buttonText: {
    color: Constants.Colors.green,
    textAlign: 'center',
  },
});
