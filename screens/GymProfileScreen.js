import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Button, Avatar } from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimePicker from '../components/TimePicker';
import ImageList from '../components/ImageList';
import GymServices from '../components/GymServices';
import RNRestart from 'react-native-restart';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
export const { width: width, height: height } = Dimensions.get('window');
const ProfileScreen = () => {
  const [visiterData, setVisiterData] = useState([]);
  const [refresh, setRefrech] = useState(false);
  const [rate, setRate] = useState(0);
  const [data, setData] = useState({
    GymName: '',
    editedGymName: '',
    id: null,
    userType: '',
    viewGenderPicker: false,
    viewUserModal: false,
    dateOfBirth: '',
    image: null,
    ImagePath:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  });
  const [viewImageModal, setImageModal] = useState(false);
  useEffect(async () => {
    try {
      var id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'get_all_vist_by_id',
          gym_id: id
        })
      });
      let res = await response.json();
      setVisiterData(res)
    } catch (e) {
      console.warn(e);
    }
  }, [][refresh])
  useEffect(async () => {
    try {
      var id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'getGymRateById',
          gym_id: 25
        })
      });
      let res = await response.json();
      setRate(parseFloat(res[0]['rate']) / parseFloat(res[0]['count']))
    } catch (e) {
      console.warn(e);
    }
  }, [])
  useEffect(() => {
    setTimeout(async () => {
      let id = null;
      let userType = null;
      try {
        id = await AsyncStorage.getItem('id', id);
        userType = await AsyncStorage.getItem('userType', userType);
        axios
          .get(
            `http://10.0.2.2:80/graduationProject/index.php?type=get_gym&gym_id=\'${id}\'`,
          )
          .then(response => {
            if (response.data[0].gym_img != null) {
              setData({
                ...data,
                ImagePath: response.data[0].gym_img,
                base64Image: response.data[0].gym_img,
                mime: 'png',
                userType: userType,
                id: id,
                GymName: response.data[0].gym_name,
              });
            } else {
              setData({
                ...data,
                userType: userType,
                id: id,
                GymName: response.data[0].gym_name,
              });
            }
            // console.warn(response.data);
          });
      } catch (e) {
        console.warn(e);
      }
    }, 1000);
  }, []);

  const setNewImage = () => {
    setImageModal(!viewImageModal);
  };
  async function updateStatus(userId, gymId, status) {
    try {
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: status == 1 ? 'delete_visit' : 'status',
          gym_id: gymId,
          user_id: userId,
        })
      });
      let res = await response.json();
      setRefrech(!refresh)
    } catch (e) {
      console.warn(e);
    }
  }
  const uploadImage = async (image) => {
    try {
      var id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'add_edit_img',
          gym_img: `\'${image}\'`,
          gym_id: id,
        })
      });
      let res = await response.json();
      // axios
      //   .post(
      //     `http://10.0.2.2:80/graduationProject/index.php?type=add_edit_img&gym_id=\'${id}\'&gym_img=\'${image}\'`,
      //   )
      //   .then(response => console.log(response));
    } catch (e) {
      console.warn(e);
    }
  }
  let imageData = new FormData();
  const TakeImage = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      // console.log(image);
      setData({
        ...data,
        image: image,
        ImagePath: image.path,
        base64Image: image.data,
        mime: image.mime,
      });
      setImageModal(!viewImageModal);
      imageData.append('profileImage', image);
      imageData.append('name', 'profile');
      uploadImage(image.data)
      // axios.patch('http://10.0.2.2:3000/Gyms/' + data.id, {
      //   image: imageData,
      // });
    });
  };

  const UseGalary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      setData({
        ...data,
        ImagePath: image.path,
        base64Image: image.data,
        mime: image.mime,
      });
      setImageModal(!viewImageModal);
      imageData.append('profileImage', image);
      imageData.append('name', 'profile');
      uploadImage(image.data)
      // axios.patch('http://10.0.2.2:3000/Gyms/' + data.id, {
      //   image: imageData,
      // });
    });
  };

  const setFirstName = text => {
    setData({
      ...data,
      editedGymName: text,
    });
  };
  function signOutFun() {
    AsyncStorage.clear();
    RNRestart.Restart();
  }
  return (
    // <ScrollView>
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            onPress={() => {
              setNewImage();
            }}>
            <ImageBackground
              style={{ width: '100%', height: '100%' }}
              source={{ uri: `data:${data.mime};base64,${data.base64Image}` }}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.text_userNsme}>{data.GymName}</Text>
        <View style={{
          flexDirection: 'row',
          right: 20,
          position: 'absolute',
          bottom: 10,
          alignItems: 'center',
          alignContent: 'center'
        }}>
          <Text style={[{
            color: '#05375a',
            fontSize: 22,
            fontWeight: 'bold',
          }]}>{rate}</Text>
          <FontAwesome
            name={'star'}
            size={20} style={{ marginLeft: 5 }}
            color={'#FFBB00'} />
        </View>
      </View>
      <View style={styles.footer}>
        <ScrollView>
          {/* opening and closing times*/}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <TimePicker id={data.id} text={'Opening time'} />
            </View>
            <View style={{ flex: 1 }}>
              <TimePicker id={data.id} text={'Closing time'} />
            </View>
          </View>

          {/* add photos of the gym*/}
          <View style={{ marginTop: 10 }}>
            <ImageList />
          </View>

          {/* services */}
          <View style={{ marginTop: 10 }}>
            <GymServices />
          </View>
          <View style={{ marginBottom: 50 }}>
            <Text style={[styles.text_footer, { marginTop: 20, marginBottom: 10, alignSelf: 'center' }]}>Subscribers </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, paddingBottom: 5, borderBottomColor: '#7e7e7e', borderBottomWidth: 1 }}>
              <Text style={[styles.text_footer, { fontWeight: 'bold', width: 100 }]}>Player </Text>
              <Text style={[styles.text_footer, { fontWeight: 'bold', marginHorizontal: 10 }]}>Action </Text>
            </View>
            {visiterData.map((data, index) => {
              return (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, paddingBottom: 5, borderBottomColor: '#7e7e7e', borderBottomWidth: 1 }}>
                  <Text style={[styles.text_footer, { width: 100 }]}>{data.user_name} </Text>
                  <TouchableOpacity onPress={() => updateStatus(data.user_id, data.gym_id, data.status)} style={[{ backgroundColor: data.status == 1 ? '#FF5959' : '#59FF64', borderRadius: 7, alignContent: 'center', justifyContent: 'center' }]}>
                    <Text style={[styles.text_footer, { margin: 5, fontSize: 16, }]}>{data.status == 1 ? 'Finished' : 'Started'} </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={[{ position: 'absolute', bottom: 15, width: width * 0.9, alignSelf: 'center', }]}>
        <TouchableOpacity style={[styles.signIn, { backgroundColor: '#fff', borderWidth: 3, borderColor: '#009387', borderRadius: 7 }]} onPress={() => signOutFun()}>
          <Text style={[styles.textSign, { color: '#009387' }]}>SignOut</Text>
        </TouchableOpacity>
      </View>
      {/* {Change the photo modal} */}
      <Modal visible={viewImageModal}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setImageModal(!viewImageModal)}>
          <View
            style={{
              backgroundColor: '#fff',
              marginTop: '50%',
              alignItems: 'center',
            }}>
            <View>
              <Button style={styles.button} onPress={() => TakeImage()}>
                <Text style={styles.text_header}>Use Camera</Text>
              </Button>
              <Button style={styles.button} onPress={() => UseGalary()}>
                <Text style={styles.text_header}>Select form galary</Text>
              </Button>
              <Button
                style={styles.button}
                onPress={() => setImageModal(!viewImageModal)}>
                <Text style={styles.text_header}>cancel</Text>
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View >
    // </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontSize: 15,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  text_userNsme: {
    position: 'absolute',
    bottom: 10,
    paddingLeft: 20,
    color: '#05375a',
    fontSize: 22,
    fontWeight: 'bold',
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
    backgroundColor: '#009387',
    alignItems: 'center',
    marginTop: 2,
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
  redBorder: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ff0000',
    borderStyle: 'solid',
  },
  avatar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
  },
  textInput: {
    marginTop: 0,
    paddingLeft: 10,
    color: '#05375a',
  },
});
