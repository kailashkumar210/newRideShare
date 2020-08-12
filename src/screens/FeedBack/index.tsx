import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useGlobalize } from 'react-native-globalize';


const FeedBack : React.FC = (props: any) => {
    const  navigation = useNavigation();
    // const {formatMessage} = useGlobalize();
    const [userEmail, setUserEmail] = useState(props.user.email);
    
    useEffect(() => {    
      console.log(userEmail);
    }, []);

    return (
        <View style={styles.container}>
        <Header
            headerText={'Send Feedback'}
            leftIcon={'arrow-back'}
            onBackPress={() => navigation.navigate('Home')}
        />
        {userEmail !== undefined ?
        <WebView
          androidHardwareAccelerationDisabled={true} 
          source={{
                  uri: 'https://docs.google.com/forms/d/e/1FAIpQLSeIYemdSK7tgAW7PYgNs3EckgBWvnPJ5LBFN9yYEOFAAAr6Yw/viewform?hl=en&entry.1292872398=' + userEmail + '&entry.490915151',
                 }}
          />: null
        }
      </View>
    );
  }

function mapStateToProps(state: any) {
    return {
        user: state.authReducer.current,
    };
}
//same as dispatchmapto props in eS6
const actions = {};

export default connect(mapStateToProps, null)(FeedBack)

const styles = StyleSheet.create({
  container: {flex:1},
  container_old: {
    margin: 20,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});