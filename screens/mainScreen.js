import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { List } from 'react-native-paper';
import { View } from 'react-native-animatable';
import Location from '../components/Location';
import GymCard from '../components/GymCard';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
export const { width: width, height: height } = Dimensions.get('window');
import RNRestart from 'react-native-restart';
const mainScreen = ({ navigation }) => {
  const [userData, setData] = useState({
    id: null,
    gymIDs: [],
  });

  useEffect(async () => {
    await axios
      .get(`http://10.0.2.2:80/graduationProject/index.php?type=get_all_gyms`)
      .then(response => {
        //console.warn(response.data[1]);
        let gyms = response.data.map(gym => gym.gym_id);
        setData({
          ...userData,
          gymIDs: gyms,
        });
        // console.warn(response.data);
      })
      .catch(e => console.warn(e));
  }, []);

  const getGymsOnLocation = async (lat, lng) => {
    await axios
      .get(`http://10.0.2.2:80/graduationProject/index.php?type=get_all_gyms`)
      .then(response => {
        let gyms = response.data.map(gym => gym.gym_id);
        setData({
          ...userData,
          gymIDs: gyms,
        });
      })
      .catch(e => console.warn(e));
  };
  function signOutFun() {
    AsyncStorage.clear();
    RNRestart.Restart();
  }
  const CardList = ({ item }) => {
    // console.warn(userData.gymIDs);
    return (
      <View style={styles.card}>
        <GymCard id={item} navigation={navigation} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={[{ width: width * 0.96, alignSelf: 'center', }]}>
        <TouchableOpacity style={[styles.signIn, { backgroundColor: '#fff', borderWidth: 3, borderColor: '#009387', borderRadius: 7 }]} onPress={() => signOutFun()}>
          <Text style={[styles.textSign, { color: '#009387' }]}>SignOut</Text>
        </TouchableOpacity>
      </View>
      <View style={[{ width: width * 0.96, alignSelf: 'center', marginTop: 15 }]}>
        <View style={[styles.signIn, { backgroundColor: '#fff', borderWidth: 3, borderColor: '#009387', borderRadius: 7 }]}>
          {/* <View style={styles.locationBtn}> */}
          <Location getGymsOnLocation={getGymsOnLocation} />
        </View>
      </View>
      <FlatList
        style={{ paddingBottom: 25 }}
        contentContainerStyle={styles.cards}
        data={userData.gymIDs}
        keyExtractor={(item, index) => 'key' + index}
        renderItem={CardList}
      />
    </View>
  );
};

export default mainScreen;

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  locationBtn: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  card: {
    marginVertical: 10,
  },
  cards: {
    marginVertical: 10,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#009387',
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
