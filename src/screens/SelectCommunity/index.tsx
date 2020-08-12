import React, { useState, useEffect } from 'react';
import { Button } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-community/picker';
import { Text, View, StyleSheet, ActivityIndicator,Dimensions } from 'react-native';
import Header from '../../components/Header';
import constants from '../../constants';
import { api_organizations_Get } from '../../api/tripApi'
const _ = require('lodash');
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
import { useGlobalize } from 'react-native-globalize';

interface SelectCommunityProps { }

const SelectCommunity: React.FC = (props: SelectCommunityProps) => {

    let navigation = useNavigation()
    const {formatMessage} = useGlobalize();

    const [selectedCommunityName, setselectedCommunityName] = useState('');
    const [selectedCode, setselectedCode] = useState('');
    const [data, setdata] = useState([]);
    const [loading, setLoading] = useState(false);

    const populateList = React.useMemo(() => {
        api_organizations_Get().then(response => {
            if (data.toString() === '') {
                let responseJson: any = response.data;
                if (!responseJson.message) {
                    let filteredData = _.orderBy(responseJson, ['name'], ['asc']);
                    console.log(filteredData);
                    setLoading(false);
                    setdata(filteredData);
                    setselectedCode(filteredData[0].code);
                    setselectedCommunityName(filteredData[0].name);                    
                }
        } else {
                setLoading(false)
            }
        })
        .catch(error => {
            console.log('Error getting vehicles from server')
            console.log(error);
            navigation.navigate('LoginOptions')
            /*
            this.props.navigator.popToRoot({
            animated: true,
            animationType: 'fade',
            });
            */
        });
    },[data]);

    useFocusEffect(()=>{
        if (selectedCommunityName === null || selectedCommunityName.length === 0 ){
            setLoading(true);
            populateList;
        }
    });


    return (
        <View style={styles.container}>
            <Header
                headerText={'Select Community'}
                leftIcon={'arrow-back'}
                onBackPress={() => navigation.navigate('LoginOptions')}
            />
            <View style={styles.mainContainer}>
                <Text style={styles.title}>{formatMessage('select_community/select_community')}</Text>
                <Text style={styles.hint}>{formatMessage('select_community/communities_data')}</Text>

                <Picker
                    mode={'dropdown'}
                    selectedValue={selectedCode}
                    onValueChange={(selectedCode: any, itemIndex) => {
                        setselectedCode(selectedCode);
                        setselectedCommunityName(data[itemIndex].name); 
                    }}
                >
                     {
                     data.map((item:any, index) => <Picker.Item key={item.id} label={item.name} value={item.code} />)
                    }
              
                </Picker>

                <Button
                    containerStyle={styles.btnContainer}
                    buttonStyle={[styles.btn, { backgroundColor: constants.Colors.green400Color }]}
                    title={'Select Community'}
                    onPress={() => navigation.navigate('Registration', { selectedCode: selectedCode})}
                />

                <Text style={styles.anotherTxt}>{formatMessage('select_community/or')}</Text>
                <Text style={styles.title}>{formatMessage('select_community/request_community')}</Text>
                <Text style={styles.hint}>{formatMessage('select_community/support')}</Text>

                <Button
                    containerStyle={[styles.btnContainer, { marginTop: 10 }]}
                    buttonStyle={[styles.btn, { backgroundColor: constants.Colors.primaryColor }]}
                    title={'New Community'}
                    onPress={() => navigation.navigate('RequestCommunity')}
                />
            </View>
            {
                loading ?(
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={constants.Colors.backgroundColor} />
                </View>
                ) : null
            }
        </View>
    );
};

export default SelectCommunity;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        padding: 15
    },
    btnContainer: {
        margin: 5,
        width: '96%',
        alignSelf: 'center'
    },
    btn: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        color: constants.Colors.strokeGrayColor,
        fontWeight: 'bold',
        paddingLeft: 10,
        paddingTop: 10
    },
    hint: {
        fontSize: 15,
        paddingLeft: 10,
        padding: 5,
        color: constants.Colors.strokeGrayColor,
    },
    anotherTxt: {
        color: constants.Colors.strokeGrayColor,
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 10,
        fontSize: 20
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: constants.Colors.backgroundTranslucentDarkColor,
        alignItems: 'center',
        justifyContent: 'center',
      },
});
