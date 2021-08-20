import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Button } from 'react-native-paper';
import Feather from 'react-native-vector-icons';
import MapView, { Callout, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geocoder from 'react-native-geocoder';
import geocoder from 'react-native-geocoder/js/geocoder';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Location = ({ getGymsOnLocation }) => {
  const [userData, setData] = useState({
    id: null,
    modalVisible: true,
    viewMapModal: false,
    region: {
      latitude: 31.9539,
      longitude: 35.9106,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markerRegion: {
      latitude: 31.9539,
      longitude: 35.9106,
    },
    flex: 0,
    createMarker: false,
    address: 'Location',
  });

  useEffect(async () => {
    let id = null;
    let userType = null;
    try {
      id = await AsyncStorage.getItem('id', id);
    } catch (e) {
      console.warn(e);
    }
    setData({
      ...userData,
      id: id,
    });
  }, []);

  const requestLocationPermision = () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then(async data => {
        let response;
        if (Platform.OS === 'android') {
          response = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          if (response === 'granted') {
            setData({
              ...userData,
              viewMapModal: true,
            });
            getPosition();
          } else {
            setData({ ...userData, viewMapModal: true });
          }
        }
      })
      .catch(err => {
        // The user has not accepted to enable the location services or something went wrong during the process
        // "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
        // codes :
        //  - ERR00 : The user has clicked on Cancel button in the popup
        //  - ERR01 : If the Settings change are unavailable
        //  - ERR02 : If the popup has failed to open
        //  - ERR03 : Internal error
      });
  };

  const getPosition = () => {
    Geolocation.getCurrentPosition(position => {
      //   console.warn(JSON.stringify(position));
      setData({
        ...userData,
        region: {
          ...userData.region,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        },
        viewMapModal: true,
      });
    });
  };

  const getAdress = async (lat, lng) => {
    await Geocoder.fallbackToGoogle('AIzaSyBa4HTzhCaqsgREnWNeaz5CCTGEJVPZj64');
    let res = await geocoder.geocodePosition({ lat, lng });
    let address = res[0].formattedAddress;
    setData({
      ...userData,
      markerRegion: {
        longitude: lng,
        latitude: lat,
      },
      viewMapModal: false,
      address: address,
    });
    getGymsOnLocation(lat, lng);
  };

  return (
    <View>
      <View>
        <Button
          mode="outlined"
          icon={'map-marker'}
          style={{ borderWidth: 0 }}
          onPress={() => requestLocationPermision()}>
          {userData.address}
        </Button>
      </View>
      <View>
        <Modal visible={userData.viewMapModal} style={{ flex: 1 }}>
          <MapView
            initialRegion={userData.region}
            showsUserLocation={true}
            provider={'google'}
            style={{
              marginBottom: userData.marginBottom,
              flex: userData.flex,
            }}
            showsMyLocationButton={true}
            onMapReady={() =>
              setData({
                ...userData,
                flex: 3,
              })
            }
            onLongPress={e =>
              setData({
                ...userData,
                createMarker: true,
                markerRegion: {
                  ...userData.markerRegion,
                  longitude: e.nativeEvent.coordinate.longitude,
                  latitude: e.nativeEvent.coordinate.latitude,
                },
              })
            }
            onRegionChangeComplete={e =>
              setData({
                ...userData,
                region: e,
              })
            }>
            {userData.createMarker && (
              <Marker
                coordinate={{
                  latitude: userData.markerRegion.latitude,
                  longitude: userData.markerRegion.longitude,
                }}></Marker>
            )}
          </MapView>
          <View
            style={{
              flex: 1,
            }}>
            <View style={{ paddingBottom: 3, paddingTop: 3 }}>
              <Button
                mode={'contained'}
                onPress={() =>
                  getAdress(userData.region.latitude, userData.region.longitude)
                }>
                use current location
              </Button>
            </View>
            <View style={{ paddingBottom: 3 }}>
              <Button
                mode={'contained'}
                onPress={() =>
                  getAdress(
                    userData.markerRegion.latitude,
                    userData.markerRegion.longitude,
                  )
                }>
                chose location manually
              </Button>
            </View>
            <View style={{ paddingBottom: 3 }}>
              <Button
                mode={'contained'}
                onPress={() =>
                  setData({
                    ...userData,
                    viewMapModal: false,
                  })
                }>
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default Location;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'green',
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
