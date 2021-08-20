import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

const ImageList = () => {
  const [refresh, setRefresh] = useState(false)
  const [data, setData] = useState({
    id: null,
    viewImageModal: false,
    deleteModalView: false,
    Images: [],
    dataToDelete: '',
    ImagePath:
      'https://cdn4.iconfinder.com/data/icons/basic-ui-elements-27/512/1034_Add_new_plus_sign-512.png',
  });

  useEffect(async () => {
    let id = null;
    try {
      id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'getImageList',
          gym_id: id,
        })
      });
      let res = await response.json();
      var imageList = [];
      if (res[0] != undefined && res[0] != null && res[0] != '') {
        imageList.push(res[0]['img_1'])
        imageList.push(res[0]['img_2'])
        imageList.push(res[0]['img_3'])
        imageList.push(res[0]['img_4'])
      }
      setData({
        ...data,
        Images: imageList,
        id: id,
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const setNewImage = () => {
    setData({
      ...data,
      viewImageModal: !data.viewImageModal,
    });
    // console.warn(data.id);
    console.warn(data.Images);
  };

  const TryToDelete = item => {
    setData({
      ...data,
      dataToDelete: item,
      deleteModalView: !data.deleteModalView,
    });
  };

  // this function should send a path to the
  // backend and it can delete the image from the database
  //
  //   const deletePhoto = async () => {
  //     console.warn(data.dataToDelete);
  //     await axios.delete(
  //       'http://10.0.2.2:3000/Gyms/' + data.id + '/GymImages/_parts',
  //       {
  //         path: '',
  //       },
  //     );
  //   };
  useEffect(async () => {
    let id = null;
    try {
      id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'getImageList',
          gym_id: id,
        })
      });
      let res = await response.json();
      var imageList = [];
      if (res[0] != undefined && res[0] != null && res[0] != '') {
        imageList.push(res[0]['img_1'])
        imageList.push(res[0]['img_2'])
        imageList.push(res[0]['img_3'])
        imageList.push(res[0]['img_4'])
      }
      setData({
        ...data,
        Images: imageList,
        id: id,
      });
    } catch (e) {
      console.warn(e);
    }
  }, [refresh])
  const uploadImage = async (image) => {
    try {
      var id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'add_imge_gym',
          gym_imge: `\'${image}\'`,
          gym_id: id,
        })
      });
      let res = await response.json();
      setRefresh(!refresh)
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
      setData({
        ...data,
        image: image,
        // ImagePath: image.path,
        base64Image: image.data,
        mime: image.mime,
        viewImageModal: !data.viewImageModal,
      });
      imageData.append('GymImage', image);
      uploadImage(image.data)
      // axios.patch('http://10.0.2.2:3000/Gyms/' + data.id, {
      //   GymImages: imageData,
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
        // ImagePath: image.path,
        image: image,
        base64Image: image.data,
        mime: image.mime,
        viewImageModal: !data.viewImageModal,
      });
      imageData.append('GymImage', image);
      uploadImage(image.data)
      // axios.patch('http://10.0.2.2:3000/Gyms/' + data.id, {
      //   GymImages: imageData,
      // });
    });
  };

  return (
    <View>
      <Text style={styles.text_footer}>Gym Photos </Text>
      {data.Images.length != 0 && (
        <FlatList
          horizontal={true}
          data={data.Images}
          keyExtractor={(item, index) => 'key' + index}
          renderItem={({ item, index }) => (
            item != '' && item != null && item != undefined && item != 'undefined' &&
            <View
              key={index}
              style={{
                height: 70,
                width: 70,
                borderRadius: 10,
                // flexDirection: 'row',
                margin: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  // TryToDelete(item);
                  console.warn(item);
                }}>
                <ImageBackground
                  style={{ width: 70, height: 70 }}
                  source={{ uri: `data:png;base64,${item}` }}
                  imageStyle={{ borderRadius: 10 }}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {data.Images.length < 8 && (
        <View style={styles.button}>
          <TouchableOpacity style={styles.signIn} onPress={() => setNewImage()}>
            <Text style={styles.textSign}>add new image</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* add Image Modal */}
      <Modal visible={data.viewImageModal}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            setData({ ...data, viewImageModal: !data.viewImageModal })
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

      {/* delete Modal */}
      <Modal visible={data.deleteModalView}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            setData({ ...data, deleteModalView: !data.deleteModalView })
          }>
          <View
            style={{
              backgroundColor: '#ff0000',
              margin: 30,
              alignItems: 'center',
            }}>
            <View>
              <Button onPress={() => console.warn('deletePhoto()')}>
                <Text>delete photo</Text>
              </Button>
              <Button
                onPress={() =>
                  setData({
                    ...data,
                    deleteModalView: !data.deleteModalView,
                  })
                }>
                <Text>cancel</Text>
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ImageList;

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
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
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
    color: '#fff',
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
