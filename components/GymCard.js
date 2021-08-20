import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import Feather from 'react-native-vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoder';
import geocoder from 'react-native-geocoder/js/geocoder';
import { set } from 'react-native-reanimated';

const GymCard = ({ id, navigation }) => {
  const [userData, setData] = useState({
    id: id,
    ImagePath:
      'https://i.pinimg.com/originals/a9/68/4b/a9684b8fd91436f9b33d78d5a68a13eb.jpg',
    GymName: '',
    location: {
      lng: null,
      lat: null,
    },
  });
  const [Adress, setAdress] = useState('');

  useEffect(async () => {
    try {
      axios
        .get(
          `http://10.0.2.2:80/graduationProject/index.php?type=get_gym&gym_id=\'${id}\'`,
        )
        .then(response => {
          setData({
            ...userData,
            ImagePath: response.data[0].gym_img,
            id: id,
            GymName: response.data[0].gym_name,
            location: {
              ...userData.location,
              lng: parseFloat(response.data[0].lng),
              lat: parseFloat(response.data[0].lat),
            },
          });
          //console.warn(response.data);
          getAdress(
            parseFloat(response.data[0].lat),
            parseFloat(response.data[0].lng),
          );
        })
        .catch(e => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const getAdress = async (lat, lng) => {
    //console.warn(userData);
    try {
      await Geocoder.fallbackToGoogle(
        'AIzaSyBa4HTzhCaqsgREnWNeaz5CCTGEJVPZj64',
      );
      let res = await geocoder.geocodePosition({ lat, lng });
      let address = res[0].formattedAddress;
      setAdress(address);
    } catch (e) {
      console.warn(e);
    }
  };

  const goToGym = async () => {
    // let id = null;
    try {
      await AsyncStorage.setItem('GymId', userData.id.toString());
      navigation.navigate('ShowGymScreen', { GymId: userData.id, gymData: userData });
      // console.warn('should go');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <TouchableOpacity onPress={() => goToGym()}>
      <Card>
        <Card.Cover
          source={userData.ImagePath == '' || userData.ImagePath == null || userData.ImagePath == undefined || userData.ImagePath == 'undefined' ? {
            uri:
              'https://i.pinimg.com/originals/a9/68/4b/a9684b8fd91436f9b33d78d5a68a13eb.jpg',
          }
            :
            { uri: `data:png;base64,${userData.ImagePath}` }
          }
        />
        <Card.Content>
          <Card.Title title={userData.GymName} subtitle={Adress} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default GymCard;
