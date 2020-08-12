import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import constants from '../constants';
import { Avatar, Icon } from 'react-native-elements';
import User from '../models/User';

export interface IPropsPendingRequest {
    user: User;
    _showPicker: boolean;
}


export default class PendingRequestAvatar extends React.Component<IPropsPendingRequest> {
  render() {
    //  console.log('This should be the photo : ', this.props.user.photo)
    return (
      <View>
        {this.props.user.photo ?
          <Avatar
          size={60}
          rounded
          titleStyle={{ color: constants.Colors.whiteColor }}
          containerStyle={{ marginRight: 10, backgroundColor: constants.Colors.strokeGrayColor }}
          //onPress={() => this.props.onPress}
          activeOpacity={0.7}
          source={{ uri: (__DEV__ ? constants.Network.DEV_Network.API_URL : constants.Network.PRD_Network.API_URL) + '/photo?filename=' + this.props.user.photo }}
      />:
      <Avatar
          size={60}
          rounded
          title={constants.Utils._getInitials(this.props.user.name)}
          titleStyle={{ color: constants.Colors.whiteColor }}
          containerStyle={{ backgroundColor: constants.Colors.strokeGrayColor, marginRight: 10 }}
          //onPress={this.props.onPress}
          activeOpacity={0.7}
      />
        }
        {this.props._showPicker ? (<Icon
          type="font-awesome"
          //onPress={this._showPicker}
          size={7}
          raised
          name="circle"
          color="red"
          containerStyle={{ position: 'absolute', right: 0, top: 0, backgroundColor: 'red' }}
        />): null}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
