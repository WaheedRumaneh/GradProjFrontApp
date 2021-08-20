import React, {useState, useEffect, useContext} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Button} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/context';

const ProfileScreen = () => {
  const [data, setData] = useState({
    userName: '',
    id: null,
    userType: '',
    viewDatePicker: false,
    Gender: 'Male',
    viewImageModal: false,
    dateOfBirth: '',
    image: null,
    ImagePath:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  });
  const [viewGenderPicker, setVewGenderPicker] = useState(false);
  const {getToken} = useContext(AuthContext);

  const [dateOfBirth, setDateOfBirth] = useState(
    new Date('2021-04-29T03:30:53.580Z'),
  );

  useEffect(() => {
    setTimeout(async () => {
      let id = null;
      let userType = null;
      let res = null;
      try {
        id = await AsyncStorage.getItem('id', id);
        userType = await AsyncStorage.getItem('userType', userType);
        axios
          .get(
            `http://10.0.2.2:80/graduationProject/index.php?type=get_user&id=\'${id}\'`,
          )
          .then(response => {
            if (response.data[0].image != null) {
              setData({
                ...data,
                //ImagePath: response.data.image._parts[0][1].path,
                userType: userType,
                userName: response.data.username,
                id: id,
              });
            } else {
              setData({
                ...data,
                userType: userType,
                id: id,
              });
            }
            if (response.data[0].birth_date != null) {
              //console.warn(response.data[0].birth_date);
              setDateOfBirth(new Date(eval(response.data[0].birth_date)));
            }
            // console.warn(response.data[0]);
          });
      } catch (e) {
        console.warn(e);
      }
    }, 1000);
  }, []);

  function getParsedDate(date) {
    // console.warn(date);
    date = String(date).split(' ');
    let edetedDate = date[1] + '\\' + date[2] + '\\' + date[3];
    return edetedDate;
  }

  const changedDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    if (currentDate != undefined || currentDate != null) {
      setDateOfBirth(currentDate);
      setData({
        ...data,
        viewDatePicker: !data.viewDatePicker,
      });
      //sendToServer(currentDate);
    } else {
      // console.warn('nothing to display');
    }
  };

  const setNewImage = () => {
    setData({
      ...data,
      viewImageModal: !data.viewImageModal,
    });
    // console.warn(imageData);
    // console.warn(data.id);
  };

  let imageData = new FormData();
  const TakeImage = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setData({
        ...data,
        image: image,
        ImagePath: image.path,
        viewImageModal: !data.viewImageModal,
      });
      imageData.append('profileImage', image);
      imageData.append('name', 'profile');
      axios.patch('http://10.0.2.2:3000/Users/' + data.id, {
        image: imageData,
      });
    });
  };

  const UseGalary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setData({
        ...data,
        ImagePath: image.path,
        viewImageModal: !data.viewImageModal,
      });
      imageData.append('profileImage', image);
      imageData.append('name', 'profile');
      axios.patch('http://10.0.2.2:3000/Users/' + data.id, {
        image: imageData,
      });
    });
  };

  const onPressedDate = () => {
    setData({
      ...data,
      viewDatePicker: !data.viewDatePicker,
    });
  };
  const onPressedGender = item => {
    setData({
      ...data,
      Gender: item,
    });
    setVewGenderPicker(!viewGenderPicker);
  };

  const submit = async () => {
    try {
      let time = JSON.stringify(dateOfBirth);

      await axios
        .patch(
          `http://10.0.2.2:80/graduationProject/index.php?type=edit_gender_birthadte&id=\'${data.id}\'&gender=\'${data.Gender}\'&birth_date=\'${time}\'`,
        )
        // .then(response => console.warn(response))
        .catch(e => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            onPress={() => {
              setNewImage();
            }}>
            <ImageBackground
              style={{width: '100%', height: '100%'}}
              source={{uri: data.ImagePath}}
              imageStyle={{borderRadius: 5}}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.text_userNsme}>{data.userName}</Text>
      </View>
      <Modal visible={data.viewImageModal}>
        <TouchableOpacity
          style={{flex: 1}}
          onPress={() =>
            setData({...data, viewImageModal: !data.viewImageModal})
          }>
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
                onPress={() =>
                  setData({
                    ...data,
                    viewImageModal: !data.viewImageModal,
                  })
                }>
                <Text style={styles.text_header}>cancel</Text>
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.footer}>
        {/* birthDate */}
        <View>
          <Text style={styles.text_footer}>Date of birth</Text>
        </View>
        <View style={styles.action}>
          <TouchableOpacity
            style={styles.text_footer}
            onPress={() => onPressedDate()}>
            <Text>{getParsedDate(dateOfBirth)}</Text>
          </TouchableOpacity>
        </View>
        {data.viewDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode={'date'}
            locale={'en'}
            onChange={changedDate}
          />
        )}

        {/* gender */}
        <View style={{marginTop: 10}}>
          <Text style={styles.text_footer}>Gender</Text>
        </View>
        <View style={styles.action}>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setVewGenderPicker(!viewGenderPicker)}>
            <Text>{data.Gender}</Text>
          </TouchableOpacity>
        </View>
        <Modal transparent={false} visible={viewGenderPicker}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => setVewGenderPicker(!viewGenderPicker)}>
            <View
              style={{
                backgroundColor: '#fff',
                marginTop: '50%',
                alignItems: 'center',
              }}>
              <View>
                <Button
                  style={styles.button}
                  onPress={() => onPressedGender('Male')}>
                  <Text style={styles.text_header}>Male</Text>
                </Button>
                <Button
                  style={styles.button}
                  onPress={() => onPressedGender('Female')}>
                  <Text style={styles.text_header}>Female</Text>
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        {/* credit card  *** could not be implemented yet*/}

        {/* submit button */}
        <View style={(styles.button, {marginTop: 20})}>
          <TouchableOpacity style={styles.signIn} onPress={() => submit()}>
            <Text
              style={[
                styles.textSign,
                {
                  color: '#fff',
                },
              ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
