import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import constants from '../constants';
import { Icon } from 'react-native-elements';

export default class Header extends Component {
    
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" hidden={false} backgroundColor={constants.Colors.primaryColor} />

                <View
                    onStartShouldSetResponder={() => this.props.onBackPress()}
                    style={styles.leftBtn}>
                    <Icon
                        name={this.props.leftIcon}
                        size={24}
                        color={constants.Colors.whiteColor}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
                <View>
                    <Text allowFontScaling={false} style={styles.headerTxt}> 
                    {this.props.headerText} </Text>
                </View>
                { this.props.rightActionVisible ? 
                    <View onStartShouldSetResponder={() => this.props.rightButtonAction()}
                        style={styles.rightBtn}
                        styles={{ //left: this.props.width - 0,
                        backgroundColor:'red'
                        }}>
                        <Icon
                            name={this.props.rightIcon}
                            size={24}
                            color={constants.Colors.whiteColor}
                            style={{ alignSelf: 'center' }}
                        />
                    </View>
                 :null 
                 }
                
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: constants.Colors.primaryColor
    },
    headerTxt: {
        color: constants.Colors.whiteColor,
        fontSize: 18,
        fontWeight: '400',           
    },
    leftBtn: {
        // flex: 1,
        padding: 10,
        position: 'absolute',
        left: 5,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        top: 5,
        
    },
    rightBtn: {
        padding: 10,
        position: 'absolute',
        right: 5,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        top: 5
    }
})
