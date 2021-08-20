import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, ActivityIndicator} from 'react-native';
import UserDrawerScreen from './UserDrawerScreen';
import GymDrawerScreen from './GymDrawerScreen';

const DispatchScreen = () => {
  const [state, setState] = useState({
    id: null,
    userType: '',
    isLoding: true,
  });
  useEffect(async () => {
    let id = null;
    let userType = null;
    try {
      id = await AsyncStorage.getItem('id', parseInt(id));
      userType = await AsyncStorage.getItem('userType', userType);
      //console.warn(userType);
    } catch (e) {
      console.warn(e);
    }
    //console.warn(id);
    setState({
      id: id,
      userType: userType,
      isLoding: false,
    });
  }, []);

  if (state.isLoding) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // <View>
    //   <Text>
    //     {state.id} + {state.userType}
    //   </Text>
    // </View>
    <>
      {state.userType == 'Player' ? <UserDrawerScreen /> : <GymDrawerScreen />}
    </>
  );
};

export default DispatchScreen;
