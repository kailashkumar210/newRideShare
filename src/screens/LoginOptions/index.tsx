import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import RoundedButton from '../../components/RoundedButton';
import constants from '../../constants';
import { useNavigation } from '@react-navigation/native';

import { useGlobalize } from 'react-native-globalize';

const LoginOptions: React.FC = (props) => {
    const navigation = useNavigation()

    const { formatMessage } = useGlobalize();

    return (
        <View style={styles.container}>

            <Image style={styles.logo} source={constants.Images.LOGO} />
            <Image style={styles.promo} source={constants.Images.PROMO} />

            {/* <Text style={styles.copyright}>{I18n.t('copyright_text')}</Text> */}

            <RoundedButton
                containerViewStyle={{
                    marginTop: 30,
                    width: '90%',
                    borderColor: constants.Colors.green,
                    backgroundColor: constants.Colors.green,
                }}
                textColor={constants.Colors.whiteColor}
                onPress={() => navigation.navigate('Login')}
                title={formatMessage('button/login')}
            />

            <RoundedButton
                containerViewStyle={{
                    marginBottom: 10,
                    marginTop: 20,
                    width: '90%',
                    borderColor: constants.Colors.green,
                    backgroundColor: constants.Colors.whiteColor,
                }}
                textColor={constants.Colors.green}
                onPress={() => navigation.navigate('SelectCommunity')}
                title={formatMessage('button/register')}
            />

            <View style={styles.sdgLogoContainer}>
                <Image style={styles.sdgLogo} source={constants.Images.LOGO_SDG} />
                <Image style={styles.sdg13Logo} source={constants.Images.LOGO_SDG13} />
            </View>

            <Text style={[styles.sdg13Slogan, { width: '60%' }]}>{formatMessage('sdg_slogan_text')}</Text>
        </View>
    );
};



export default LoginOptions;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: constants.Colors.whiteColor
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },
    promo: {
        marginTop: 30,
        marginBottom: 30,
        width: 220,
        height: 67,
        alignSelf: 'center',
    },
    copyright: {
        textAlign: 'center',
        color: constants.Colors.green,
        fontStyle: 'italic',
    },
    sdgLogoContainer: {
        width: '100%',
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sdgLogo: {
        marginTop: 10,
        marginRight: 15,
        width: 210,
        height: 22,
        alignSelf: 'center',
    },
    sdg13Logo: {
        marginTop: 10,
        width: 60,
        height: 60,
        alignSelf: 'center',
    },
    sdg13Slogan: {
        textAlign: 'center',
        color: constants.Colors.green,
        fontStyle: 'italic',
    },
});