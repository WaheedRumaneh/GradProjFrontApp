import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
  Modal,
  Platform,
  Alert,
  ScrollView,
  PermissionsAndroid
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../components/context';
import axios from 'axios';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS } from 'react-native-permissions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geocoder from 'react-native-geocoder';
import geocoder from 'react-native-geocoder/js/geocoder';
import { add } from 'react-native-reanimated';

const SignUpScreen = () => {
  const [userData, setData] = useState({
    userName: '',
    gym_num: '',
    visit_price: '',
    isGymNumValid: null,
    isVisitPricevalid: null,
    isValidUser: true,
    checkEditingUser: false,
    Email: '',
    isValidEmail: true,
    checkEditingEmail: false,
    password: '',
    isValidPassword: true,
    confirmPassword: '',
    isValidConfirmPassword: true,
    secureText: true,
    secureText2: true,
    UserType: '',
    modalVisible: true,
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
  const [viewMapModal, setViewMapModal] = useState(false);

  const { signUp } = React.useContext(AuthContext);

  //check user name vlidation
  //regex /^([a-z]){3,8}(\s)?([a-z]){0,10}/i this RegEx is not good enugh
  //if not as this show validation message and dont save in state

  //username editing functions
  let validUserRGX = /^([a-z]){3,8}\s?([a-z]{0,10})$/i;
  const onUsernameChange = text => {
    // console.warn(validUserRGX.test(text));
    if (validUserRGX.test(text))
      setData({
        ...userData,
        userName: text,
        checkEditingUser: true,
        isValidUser: true,
      });
    else {
      setData({
        ...userData,
        userName: '',
        isValidUser: false,
      });
    }
  };
  const updateValidUser = text => {
    if (validUserRGX.test(text))
      setData({
        ...userData,
        userName: text,
        isValidUser: true,
      });
  };
  let validPhoneReg = /([0-9]*)$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const updatePhone = text => {
    if (validPhoneReg.test(text) && text.toString().length >= 9 && text.toString().length <= 14)
      setData({
        ...userData,
        gym_num: text,
        isGymNumValid: true,
      });
    else {
      setData({
        ...userData,
        gym_num: text,
        isGymNumValid: false,
      });
    }
  };
  let validPriceReg = /^[0-9]+(\.[0-9]+)?$/;
  const updateVisitPrice = text => {
    if (validPriceReg.test(text))
      setData({
        ...userData,
        visit_price: text,
        isVisitPricevalid: true,
      });
    else {
      setData({
        ...userData,
        visit_price: text,
        isVisitPricevalid: false,
      });
    }
  };

  // email validation and editing
  let validEmailRGX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])+)$/i;
  const onEmailChange = text => {
    if (validEmailRGX.test(text))
      setData({
        ...userData,
        Email: text,
        checkEditingEmail: true,
        isValidEmail: true,
      });
    else {
      setData({
        ...userData,
        Email: '',
        isValidEmail: false,
      });
    }
  };
  const updateValidEmail = text => {
    if (validEmailRGX.test(text))
      setData({
        ...userData,
        Email: text,
        isValidEmail: true,
      });
  };

  // password configration
  let validPassRGX = /(\S{8,}){1}/;
  const onPasswordChange = text => {
    if (validPassRGX.test(text))
      setData({
        ...userData,
        password: text,
        isValidPassword: true,
      });
    else {
      setData({
        ...userData,
        password: '',
        isValidPassword: false,
      });
    }
  };
  const updateSecureText = () => {
    setData({
      ...userData,
      secureText: !userData.secureText,
    });
  };

  const onConfirmPasswordChange = text => {
    if (validPassRGX.test(text))
      setData({
        ...userData,
        confirmPassword: text,
        isValidConfirmPassword: true,
      });
    else {
      setData({
        ...userData,
        confirmPassword: '',
        isValidConfirmPassword: false,
      });
    }
  };
  const updateConfirmSecureText = () => {
    setData({
      ...userData,
      secureText2: !userData.secureText2,
    });
  };

  const requestLocationPermision = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then(granted => {
          setViewMapModal(true);
          getPosition();
        });
    } else {
      setViewMapModal(true);
      getPosition();
    }
  };
  const getPosition = () => {
    Geolocation.getCurrentPosition(position => {
      const myPosition = position.coords;
      setData({
        ...userData,
        region: {
          ...userData.region,
          longitude: myPosition.longitude,
          latitude: myPosition.latitude,
        },
      });
      setViewMapModal(true);
    }, error => { console.log(error) }, { enableHighAccuracy: false, timeout: 900000 });
  };
  const getAdress = async (lat, lng) => {
    await Geocoder.fallbackToGoogle('AIzaSyB4sayabMpZ0J2ACJ2PNAb_4Id85A_C9Ug');
    let res = await geocoder.geocodePosition({ lat, lng });
    let address = res[0].formattedAddress;
    setData({
      ...userData,
      markerRegion: {
        longitude: lng,
        latitude: lat,
      },
      address: address,
    });
    setViewMapModal(false);
  };

  //check evrything before submitting
  const checkBeforeSubmitting = e => {
    if (
      userData.Email.length == 0 ||
      userData.password.length == 0 ||
      userData.confirmPassword.length == 0 ||
      userData.userName.length == 0
    ) {
      Alert.alert('Wrong Input!', 'All fields should be filled correctly.', [
        { text: 'Okay' },
      ]);
      return;
    } else if (
      userData.isValidUser &&
      userData.isValidEmail &&
      userData.isValidPassword &&
      userData.password === userData.confirmPassword
    ) {
      try {
        if (userData.userType == 'Player') {
          axios
            .post(
              `http://10.0.2.2:80/graduationProject/index.php?type=register&name=\'${userData.userName}\'&email=\'${userData.Email}\'&pass=\'${userData.password}\'`,
              // {
              //   username: userData.userName,
              //   email: userData.Email,
              //   password: userData.password,
              // },
            )
            // .then(response => console.warn(response));
            .then(response =>
              signUp(response.data[0].user_id, userData.userType),
            );
        } else {
          if (userData.isGymNumValid &&
            userData.isVisitPricevalid) {
            axios
              .post(
                `http://10.0.2.2:80/graduationProject/index.php?type=register_gym&name=
                \'${userData.userName}\'&email=
                \'${userData.Email}\'&pass=
                \'${userData.password}\'&lat=
                \'${userData.markerRegion.latitude}\'&lng=
                \'${userData.markerRegion.longitude}\'&gym_num=
                \'${userData.gym_num}\'&visit_price=
                \'${userData.visit_price}\'`,
              )
              .then(response => {
                if (response.data == 'already exests') {
                  Alert('Email not Valid');
                } else {
                  signUp(response.data[0].gym_id, userData.userType);
                }
              });
          } else {
            Alert.alert('Wrong Input!', 'All fields should be filled correctly.', [
              { text: 'Okay' },
            ]);
            return;
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#009387', position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.text_header, { marginTop: userData.userType == 'Gym' ? '2%' : '43%', marginBottom: userData.userType == 'Gym' ? -35 : 0 }]}>Gyms are our space</Text>
        </View>
        <Modal visible={userData.modalVisible}>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() =>
                setData({
                  ...userData,
                  userType: 'Player',
                  modalVisible: false,
                })
              }>
              <Text style={styles.textSign}>Player</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() =>
                setData({
                  ...userData,
                  userType: 'Gym',
                  modalVisible: false,
                })
              }>
              <Text style={styles.textSign}>Gym</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View style={styles.footer}>
          {/* username text field*/}
          <Text style={styles.text_footer}>Username</Text>
          <View style={styles.action}>
            <View style={[styles.textInput]}>
              {/* should be an icon */}
              <TextInput
                onEndEditing={text =>
                  updateValidUser(text?.toString().toLowerCase())
                }
                onChangeText={text =>
                  onUsernameChange(text?.toString().toLowerCase())
                }
                placeholder={'User Name'}
              />
              {userData.isValidUser && userData.checkEditingUser ? (
                <Animatable.View
                  animation="bounceIn"
                  style={{ alignSelf: 'center' }}>
                  <Feather name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>
            {!userData.isValidUser ? (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>Username is not valid.</Text>
              </Animatable.View>
            ) : null}
          </View>

          {/* Email field*/}
          <View style={{ marginTop: 5 }}>
            <Text style={styles.text_footer}>Email</Text>
            <View style={styles.action}>
              <View style={styles.textInput}>
                {/* should be an icon */}
                <TextInput
                  onEndEditing={text =>
                    updateValidEmail(text?.toString().toLowerCase())
                  }
                  onChangeText={text =>
                    onEmailChange(text?.toString().toLowerCase())
                  }
                  placeholder={'Email'}
                />
                {userData.isValidEmail && userData.checkEditingEmail ? (
                  <Animatable.View
                    animation="bounceIn"
                    style={{ alignSelf: 'center' }}>
                    <Feather name="check-circle" color="green" size={20} />
                  </Animatable.View>
                ) : null}
              </View>
              {!userData.isValidEmail ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>Email is not valid.</Text>
                </Animatable.View>
              ) : null}
            </View>
          </View>

          {/* location field */}

          {userData.userType == 'Gym' && (
            <View style={{ marginTop: 5 }}>
              <Text style={styles.text_footer}>Phone</Text>
              <View style={styles.action}>
                <View style={[styles.textInput]}>
                  {/* should be an icon */}
                  <TextInput
                    onChangeText={text =>
                      updatePhone(text)
                    }
                    keyboardType={'phone-pad'}
                    placeholder={'Phone'}
                  />
                  {userData.isGymNumValid ? (
                    <Animatable.View
                      animation="bounceIn"
                      style={{ alignSelf: 'center' }}>
                      <Feather name="check-circle" color="green" size={20} />
                    </Animatable.View>
                  ) : null}
                </View>
                {userData.isGymNumValid === false ? (
                  <Animatable.View animation="fadeInLeft" duration={500}>
                    <Text style={styles.errorMsg}>Phone is not valid.</Text>
                  </Animatable.View>
                ) : null}
              </View>
              <Text style={styles.text_footer}>Visit Price</Text>
              <View style={styles.action}>
                <View style={[styles.textInput]}>
                  {/* should be an icon */}
                  <TextInput
                    onChangeText={text =>
                      updateVisitPrice(text)
                    }
                    keyboardType={'phone-pad'}
                    placeholder={'Visit Price'}
                  />
                  {userData.isVisitPricevalid ? (
                    <Animatable.View
                      animation="bounceIn"
                      style={{ alignSelf: 'center' }}>
                      <Feather name="check-circle" color="green" size={20} />
                    </Animatable.View>
                  ) : null}
                </View>
                {userData.isVisitPricevalid === false ? (
                  <Animatable.View animation="fadeInLeft" duration={500}>
                    <Text style={styles.errorMsg}>Price is not valid.</Text>
                  </Animatable.View>
                ) : null}
              </View>
              <Text style={styles.text_footer}>location</Text>
              <View style={styles.action}>
                <Feather name="map-pin" size={20} />
                <TouchableOpacity onPress={() => requestLocationPermision()}>
                  <Text style={styles.textInput_l}>{userData.address}</Text>
                </TouchableOpacity>
              </View>
              <Modal visible={viewMapModal} style={{ flex: 1 }}>
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                  <MapView
                    initialRegion={userData.region}
                    showsUserLocation={true}
                    provider={PROVIDER_GOOGLE}
                    mapType={'standard'}
                    showsMyLocationButton={true}
                    style={{
                      marginBottom: userData.marginBottom,
                      flex: userData.flex,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
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
                </View>
                <View
                  style={{
                    flex: 1,
                    position: 'absolute',
                    bottom: 0,
                    width: '100%'
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 2,
                      paddingTop: 2,
                      backgroundColor: '#009387',
                    }}>
                    <Button
                      title={'use current location'}
                      onPress={() =>
                        getAdress(
                          userData.region.latitude,
                          userData.region.longitude,
                        )
                      }></Button>
                  </View>
                  <View style={{ borderBottomWidth: 2, paddingTop: 2 }}>
                    <Button
                      title={'chose location manually'}
                      onPress={() =>
                        getAdress(
                          userData.markerRegion.latitude,
                          userData.markerRegion.longitude,
                        )
                      }></Button>
                  </View>
                  <View style={{ borderBottomWidth: 2, paddingTop: 2 }}>
                    <Button
                      title={'cancle'}
                      onPress={() => {
                        setViewMapModal(!viewMapModal);
                      }}></Button>
                  </View>
                </View>
              </Modal>
            </View>
          )}

          {/* password input field */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.text_footer}>Password</Text>
            <View style={styles.action}>
              <Feather name="lock" size={20} />
              <TextInput
                placeholder="Your Password"
                placeholderTextColor="#666666"
                secureTextEntry={userData.secureText ? true : false}
                style={styles.textInput}
                autoCapitalize="none"
                onChangeText={text => onPasswordChange(text)}
              />
              <TouchableOpacity onPress={updateSecureText}>
                {userData.secureText ? (
                  <Feather name="eye-off" color="grey" size={20} />
                ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>
            {userData.isValidPassword ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Password must be 8 characters long.
                </Text>
              </Animatable.View>
            )}
          </View>

          {/* confirm password input field */}
          <View style={{ marginTop: 5 }}>
            <Text style={styles.text_footer}>Confirm Password</Text>
            <View style={styles.action}>
              <Feather name="lock" size={20} />
              <TextInput
                placeholder="Your Password"
                placeholderTextColor="#666666"
                secureTextEntry={userData.secureText2 ? true : false}
                style={[styles.textInput]}
                autoCapitalize="none"
                onChangeText={text => onConfirmPasswordChange(text)}
              />
              <TouchableOpacity onPress={updateConfirmSecureText}>
                {userData.secureText2 ? (
                  <Feather name="eye-off" color="grey" size={20} />
                ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>
            {userData.isValidConfirmPassword ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Password must be 8 characters long.
                </Text>
              </Animatable.View>
            )}
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signIn}
              onPress={e => checkBeforeSubmitting(e)}>
              <Text
                style={[
                  styles.textSign,
                  {
                    color: '#fff',
                  },
                ]}>
                sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView >
  );
};

export default SignUpScreen;

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
    marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 3,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textInput_l: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -3,
    paddingLeft: 10,
    color: '#05375a',
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  },
  button: {
    alignItems: 'center',
    marginTop: 20,
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
