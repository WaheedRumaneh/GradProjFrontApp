import React from 'react';
import {useContext} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {AuthContext} from '../components/context';

import ProfileScreen from './ProfileScreen';
import mainScreen from './mainScreen';
import ShowGymScreen from './ShowGymScreen';

const UserDrawerScreen = ({navigation, id, userType}) => {
  const {signOut, getToken} = useContext(AuthContext);
  const Drawer = createDrawerNavigator();

  function DrawerScreen(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Home"
          onPress={() => props.navigation.navigate('mainScreen')}></DrawerItem>
        <DrawerItem
          label="profile Screen"
          onPress={() =>
            props.navigation.navigate('ProfileScreen')
          }></DrawerItem>
        <DrawerItem label="Log Out" onPress={() => signOut()}></DrawerItem>
      </DrawerContentScrollView>
    );
  }
  return (
    // <NavigationContainer>
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <DrawerScreen {...props} />}>
      <Drawer.Screen name={'mainScreen'} component={mainScreen} />
      <Drawer.Screen name={'ProfileScreen'} component={ProfileScreen} />
      <Drawer.Screen name={'ShowGymScreen'} component={ShowGymScreen} />
    </Drawer.Navigator>
    // </NavigationContainer> */}
  );
};

export default UserDrawerScreen;
