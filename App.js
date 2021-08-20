import 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {createAppContainer} from 'react-navigation';
import {NavigationContainer} from '@react-navigation/native';
import React, {useState, useMemo, useEffect, useReducer} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-native/Libraries/NewAppScreen';

import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import SplashScreen from './screens/SplashScreen';
import UserDrawerScreen from './screens/UserDrawerScreen';
import DispatchScreen from './screens/DispatchScreen';
import {AuthContext} from './components/context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const stack = createStackNavigator();

const App = () => {
  const initialState = {
    isLoding: true,
    userName: null,
    id: null,
    email: null,
    userType: '',
  };

  const logInReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          id: action.id,
          isLoding: false,
          userType: action.userType,
        };
      case 'LOGIN':
        return {
          ...prevState,
          id: action.id,
          isLoding: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userName: null,
          id: null,
          isLoding: false,
        };
      case 'REGESTER':
        return {
          ...prevState,
          userName: action.id,
          id: action.token,
          isLoding: false,
          email: action.email,
          userType: action.userType,
        };
    }
  };

  const [loginState, dispatch] = useReducer(logInReducer, initialState);

  const authContext = useMemo(
    () => ({
      signIn: async (foundUser, userType) => {
        // console.warn(foundUser[0].gym_id);
        let res = null;
        if (userType == 'Player') {
          //console.warn(foundUser);
          dispatch({type: 'LOGIN', id: foundUser[0].user_id});
          res = foundUser[0].user_id.toString();
        } else {
          dispatch({type: 'LOGIN', id: foundUser[0].gym_id});
          res = foundUser[0].gym_id.toString();
        }
        try {
          await AsyncStorage.setItem('id', res);
          await AsyncStorage.setItem('userType', userType);
        } catch (e) {
          console.log(e);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('id');
          await AsyncStorage.removeItem('userType');
        } catch (e) {
          console.warn(e);
        }
        dispatch({type: 'LOGOUT'});
      },
      signUp: async (user, userType) => {
        dispatch({
          type: 'REGESTER',
          id: user,
          userType: userType,
        });
        try {
          await AsyncStorage.setItem('id', user.toString());
          await AsyncStorage.setItem('userType', userType);
        } catch (e) {
          console.log(e);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    setTimeout(async () => {
      let id = null;
      let userType = null;
      try {
        id = await AsyncStorage.getItem('id', parseInt(id));
        userType = await AsyncStorage.getItem('userType', userType);
      } catch (e) {
        console.warn(e);
      }
      //console.warn(id);
      dispatch({type: 'RETRIEVE_TOKEN', id: id, userType: userType});
    }, 1000);
  }, []);

  if (loginState.isLoding) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {loginState.id === null ? (
          <stack.Navigator screenOptions={{headerShown: false}}>
            <>
              <stack.Screen name="SplashScreen" component={SplashScreen} />
              <stack.Screen name="SignInScreen" component={SignInScreen} />
              <stack.Screen name="SignUpScreen" component={SignUpScreen} />
            </>
          </stack.Navigator>
        ) : (
          //if userType==player => show PlayerApp
          //if userType==Gym => show GymApp
          // <UserDrawerScreen userData={(loginState.id, loginState.userType)} />
          <DispatchScreen />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
