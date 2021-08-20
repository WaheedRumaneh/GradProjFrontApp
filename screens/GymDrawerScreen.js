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
import GymProfileScreen from './GymProfileScreen';
import mainScreen from './mainScreen';

const GymDrawerScreen = ({navigation, id, userType}) => {
  const {signOut, getToken} = useContext(AuthContext);
  const Drawer = createDrawerNavigator();

  function DrawerScreen(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItem label="LogOut" onPress={() => signOut()}></DrawerItem>
      </DrawerContentScrollView>
    );
  }
  return (
    // <NavigationContainer>
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <DrawerScreen {...props} />}>
      {/* <Drawer.Screen name={'mainScreen'} component={mainScreen} /> */}
      <Drawer.Screen name={'GymProfileScreen'} component={GymProfileScreen} />
    </Drawer.Navigator>
    // </NavigationContainer> */}
  );
};

export default GymDrawerScreen;
