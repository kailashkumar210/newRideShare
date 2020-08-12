import React, { Component } from 'react';
import { StyleSheet, Text, Dimensions, Platform, Animated, Easing } from 'react-native';
import { Icon } from 'react-native-elements';
import Constants from '../../constants';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default class Row extends Component {
  active: any;
  style: any;
  _onDelete: Function;

  constructor(props) {
    super(props);

    this.active = new Animated.Value(0);

    this.style = {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: this.active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            },
          ],
          shadowRadius: this.active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [
            {
              scale: this.active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: this.active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    };
  }

  componentDidUpdate(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this.active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const { data } = this.props;

    this._onDelete = this.props._onDelete;

    return (
      <Animated.View 
        key={data.key} 
        style={[styles.routeEntryContainerView, this.style]} 
        useNativeDriver={true}>
        <Icon containerStyle={{ marginRight: 5 }} size={25} color={Constants.Colors.positiveButtonColor} type="material-community" name="dots-vertical" />
        <Text width="100%" style={styles.routeEntryText}>
          {data.title}
        </Text>        
        <Icon
          containerStyle={{ marginLeft: 5, marginRight: 5 }}
          size={25}
          color={Constants.Colors.primaryColor}
          name="close"
          onPress={() => {
            this._onDelete(data);
          }}
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  routeEntryText: {
    fontWeight: '300',
    color: Constants.Colors.positiveButtonColor,
    width: '80%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 35,
    flex: 1,
    padding: 10,
    margin: 1,
    borderRadius: 5,
    backgroundColor: Constants.Colors.inputBackgroundColor,
  },

  searchContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 5,
    margin: 0,
    padding: 0,
  },
  searchbox: {
    marginLeft: 10,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeEntryContainerView: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 1,
    marginBottom: 1,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
