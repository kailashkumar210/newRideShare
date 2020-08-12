import React, { useEffect } from 'react';
import {Alert,BackHandler } from 'react-native';
// import console.log from '../constant/console.log';
// import {AppName} from '../constant/Constant';

function useBackButton(action,props) {
    console.log("Back Button Handler Caalled!");

const backScreenHandler = () => {
  try{
    props.navigation.goBack();
    return true
  }
  catch(e)
  {
    console.log('Error in back ',e);
  }
}

const exitPopUp = () => {
  Alert.alert(
    `Ride Share `,
    `Do you want to exit from the app?`,
    [
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: "Yes", onPress: () => BackHandler.exitApp()
    }
    ],
    { cancelable: false }
  );
return true
}
    
if(action == 'backScreen')
{
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backScreenHandler);
  
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        backScreenHandler
      );
    };
  },[]);
}

if(action == 'exit')
{
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", exitPopUp);
  
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        exitPopUp
      );
    };
  },[]);
}


}

export default useBackButton;