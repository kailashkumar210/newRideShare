import React, { useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Divider, Button } from "react-native-elements";
import { Text, View, StyleSheet, Dimensions, Platform, ScrollView, Linking } from 'react-native';
import constants from '../../constants';
import { useGlobalize } from 'react-native-globalize';
import { logout } from '../../redux/actions/user';
import { clear_locationHistory, set_preferences } from '../../redux/actions/preferences';
import { connect } from 'react-redux';
import { Picker } from '@react-native-community/picker';
import Toast from 'react-native-simple-toast';
import { IPreferencesState } from 'src/redux/reducers/preferencesReducer';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    
const Settings: React.FC = (props: any) => {
    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();
    let timeArray = ['30 Mins', '1 hour', '2 hour'];
    let timeValueArray = [1800, 3600, 7200];
    let distanceArray = ['500 m', '1 km', '2 km', '2.5 km'];
    let distanceValueArray = [500, 1000, 2000, 2500];
    const [preferences, setPreferences] = useState(props.preferences);

    useFocusEffect(()=>{
        //console.log('Check Redux Store here');
        //console.log(props);
    })

    const _onUpdateValueUpdate = (value:any, type:string)=>{
        let _update = false;
        switch (type)
        {
            case 'timerange':
                setPreferences({...preferences, timeRange: value});
                _update= true;
                break;
            case 'startrange':
                setPreferences({...preferences, startRange: value});
                _update= true;
                break;
            case 'destrange':
                _update= true;
                setPreferences({...preferences, destRange: value});
                break;
            default: 
            break;
        }
        if (_update){
            actions.set_preferences(preferences).then((m)=> {
                if (m.message ==='success') {
                    Toast.showWithGravity(formatMessage('settings/updated_preferences'), Toast.LONG, Toast.BOTTOM);
                }
            });
        }
    }


    const _updateLink = () => {
        console.log('updatelink')
        if (Platform.OS === 'ios') {
          Linking.openURL('https://dev-cleanair.azurewebsites.net/ios');
        } else {
          Linking.openURL('https://play.google.com/store/apps/details?id=org.un.oict.rideshare');
        }
      };

    return (
        <View style={styles.container}>
            <Header
                headerText={formatMessage('screen/SettingsScreen')}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.goBack()}
            />
             <ScrollView style={styles.containerInside} bounces={false}>
                <Button type={'outline'}
                raised={true}
                buttonStyle={{ backgroundColor:constants.Colors.positiveButtonColor}}
                titleStyle={{color: constants.Colors.whiteColor}}
                        title={formatMessage('settings/clear_history')}
                        containerStyle={{ marginLeft: 0, marginRight: 0, marginBottom: 10 }}
                        onPress={() => {
                            actions.clear_locationHistory().then(()=> Toast.showWithGravity(formatMessage('settings/clear_h_message'), Toast.LONG, Toast.BOTTOM));
                        }}
                />

                <Button title={formatMessage('settings/update')}
                    titleStyle={{color: constants.Colors.whiteColor}}
                    type={'outline'}
                    raised={true}
                    buttonStyle={{backgroundColor:constants.Colors.green400Color}}
                    onPress={() => { _updateLink() }}
                    containerStyle={{ marginLeft: 0, marginRight: 0, marginBottom: 10 }}
                />

            {props.app.authorized && (
            <Button 
                type={'outline'}
                raised={true}
                buttonStyle={{ backgroundColor:constants.Colors.pink400Color}}
                            title={formatMessage('settings/logout')}
                            titleStyle={{color: constants.Colors.whiteColor}}
                containerStyle={{ marginLeft: 0, marginRight: 0, marginBottom: 10 }}
                            onPress={() => {
                                actions.logout().then((m)=>{
                                    console.log('loged out, now navigate to LoginIptions');
                                    navigation.reset(
                                      { index:0,
                                      routes:[{name:'LoginOptions'}],
                                      });
                                }).catch((error)=>{ console.log(error)})                                
                            }}
                        />
            )}

        {!props.auth.isDriver && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.title}>{formatMessage('time_range')}</Text>
            <Text style={styles.hint}>{formatMessage('time_range_expl')}</Text>
            <View style={styles.block}>
              <Picker selectedValue={preferences.timeRange} 
                onValueChange={(itemValue, itemIndex) => _onUpdateValueUpdate(itemValue,'timerange')
                //(props.preferences.timeRange = itemValue)
                }>
                {timeArray.map((item, index) => <Picker.Item key={item} label={item} value={timeValueArray[index]} />)}
              </Picker>
              <Divider style={{ backgroundColor: constants.Colors.inputBackgroundColor, width: '90%', margin: 5, alignSelf: 'center' }} />
            </View>

            <Text style={styles.title}>{formatMessage('pickup_range')}</Text>
            <Text style={styles.hint}>{formatMessage('pickup_range_expl')}</Text>

            <View style={styles.block}>
              <Picker selectedValue={preferences.startRange} 
              onValueChange={(itemValue, itemIndex) => _onUpdateValueUpdate(itemValue,'startrange')
              //(props.preferences.startRange = itemValue)
            }>
                {distanceArray.map((item, index) => 
                    <Picker.Item key={item} label={item} value={distanceValueArray[index]} />)}
              </Picker>
              <Divider style={{ backgroundColor: constants.Colors.inputBackgroundColor, width: '90%', margin: 5, alignSelf: 'center' }} />
            </View>

            <Text style={styles.title}>{formatMessage('dropoff_range')}</Text>
            <Text style={styles.hint}>{formatMessage('dropoff_range_expl')}</Text>

            <View style={styles.block}>
              <Picker selectedValue={preferences.destRange} 
              onValueChange={(itemValue, itemIndex) => 
                _onUpdateValueUpdate(itemValue,'destrange')
                //(props.preferences.destRange = itemValue)
              }>
                {distanceArray.map((item, index) => <Picker.Item key={item} label={item} value={distanceValueArray[index]} />)}
              </Picker>
            </View>
          </View>
        )}
      </ScrollView>
    
        </View>
    );
};

function mapStateToProps(state: any) {
    return {
        // The "counter" field in this object becomes props.counter
        app : state.appReducer,
        auth: state.authReducer,    
        preferences: state.preferences,     
    };
}

//same as dispatchmapto props in eS6
const actions = {logout, clear_locationHistory, set_preferences};

export default connect(mapStateToProps, actions)(Settings);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerInside: {
      flex: 1,
      marginLeft: 10,
      marginRight: 10,
      backgroundColor: '#F5FCFF',
      padding: 10,
      ...Platform.select({
        ios: { paddingTop: 24 },
        default: { paddingTop: 24 },
      }),
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    hint: {
      fontSize: 15,
      marginBottom: 8,
    },
    block: {
      marginBottom: 16,
    },
    label: {
      fontWeight: 'bold',
      marginRight: 8,
    },
  });
