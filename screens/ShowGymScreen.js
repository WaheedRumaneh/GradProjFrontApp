import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Image
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ImageList from '../components/ImageList';
import { set } from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const ShowGymScreen = ({ route }) => {
  const [ratingCount, setRatingCount] = useState(0)
  const [visited, setVisited] = useState(false)
  const [canVisited, setCanVisited] = useState(true)
  const [data, setData] = useState({
    GymId: route.params.GymId,
    rate: 0,
    GymName: '',
    gym_num: '',
    location: {
      lng: null,
      lat: null,
    },
    url: '',
  });
  const [ImagePath, setImagePath] = useState(
    route.params.gymData.ImagePath == '' || route.params.gymData.ImagePath == undefined || route.params.gymData.ImagePath == null || route.params.gymData.ImagePath == 'undefined' ?
      'https://i.pinimg.com/originals/a9/68/4b/a9684b8fd91436f9b33d78d5a68a13eb.jpg'
      :
      `data:png;base64,${route.params.gymData.ImagePath}`
  );
  const [images, setImages] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [refresh, setRefresh] = useState(false)
  const [services, setServices] = useState({
    jacuzzi: false,
    steam: false,
    sauna: false,
    pool: false,
  });
  const [OpeningTime, setOpeningTime] = useState(
    new Date('2021-04-29T03:30:53.580Z'),
  );
  const [ClosingTime, setClosingTime] = useState(
    new Date('2021-04-29T03:30:53.580Z'),
  );
  useEffect(async () => {
    let id = null;
    try {
      id = route.params.GymId;
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'getImageList',
          gym_id: id,
        })
      });
      let res = await response.json();
      var imageListNew = [];
      if (res[0] != undefined && res[0] != null && res[0] != '') {
        imageListNew.push(res[0]['img_1'])
        imageListNew.push(res[0]['img_2'])
        imageListNew.push(res[0]['img_3'])
        imageListNew.push(res[0]['img_4'])
      }
      setImageList(imageListNew);
    } catch (e) {
      console.warn(e);
    }
  }, [route.params.GymId]);
  useEffect(async () => {
    let id = route.params.GymId;
    var userId = await AsyncStorage.getItem('id');
    try {
      axios
        .get(
          `http://10.0.2.2:80/graduationProject/index.php?type=get_gym&gym_id=\'${id}\'&user_id=\'${userId}\'`,
        )
        .then(response => {
          setData({
            ...data,
            rate: response.data[0].rate,
            gym_num: response.data[0].gym_num,
            GymName: response.data[0].gym_name,
            location: {
              lat: parseFloat(response.data[0].lat),
              lng: parseFloat(response.data[0].lng),
            },
            url: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(
              response.data[0].lat,
            )
              }% 2c${parseFloat(response.data[0].lng)} `,
          });
          setRatingCount(response.data[0].rate)
          if ('GymImages' in response.data) {
            setImages([response.data.GymImage._parts[0][1].path]);
          } else {
            setImages([]);
          }
          if (response.data[0].sauna != null) {
            setServices({
              jacuzzi: response.data[0].jacuzzi == 1,
              steam: response.data[0].steem == 1,
              sauna: response.data[0].sauna == 1,
              pool: response.data[0].pool == 1,
            });
          } else {
            setServices({
              jacuzzi: false,
              steam: false,
              sauna: false,
              pool: false,
            });
          }
          if ('image' in response.data) {
            setImagePath(response.data.image._parts[0][1].path);
          } else {
            setImagePath(
              'https://i.pinimg.com/originals/a9/68/4b/a9684b8fd91436f9b33d78d5a68a13eb.jpg',
            );
          }
          if ('openingTime' in response.data) {
            setOpeningTime(new Date(response.data.openingTime));
          }
          if ('closingTime' in response.data) {
            setClosingTime(new Date(response.data.closingTime));
          }
        });
      await AsyncStorage.removeItem('GymId');
    } catch { }
  }, [route.params.GymId]);
  function getParsedDate(date) {
    // console.warn(date);
    date = String(date).split(' ')[4].split(':');
    let edetedDate = date[0] + ' : ' + date[1];
    return edetedDate;
  }

  const goToMaps = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(data.url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(data.url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${data.url}`);
    }
  }, [data.url]);
  async function rateChange(num) {
    var ratingCount = ratingCount
    var userId = await AsyncStorage.getItem('id');
    ratingCount = num;
    try {
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'add_rate',
          gym_id: route.params.GymId,
          user_id: userId,
          rate: num,
        })
      });
      let res = await response.json();
      setRefresh(!refresh)
    } catch (e) {
      console.warn(e);
    }
    setRatingCount(ratingCount)
  }
  function getRating() {
    return (
      <View style={[styles.flexDirectionRow, { alignSelf: 'center' }]}>
        <TouchableWithoutFeedback onPress={() => { rateChange(1) }}>
          <FontAwesome
            name={ratingCount >= 1 ? 'star' : 'star-o'}
            size={40} style={{ marginRight: 10 }}
            color={ratingCount >= 1 ? '#FFBB00' : '#B9B9B9'} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => { rateChange(2) }}>
          <FontAwesome
            name={ratingCount >= 2 ? 'star' : 'star-o'}
            size={40} style={{ marginRight: 10 }}
            color={ratingCount >= 2 ? '#FFBB00' : '#B9B9B9'} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => { rateChange(3) }}>
          <FontAwesome
            name={ratingCount >= 3 ? 'star' : 'star-o'}
            size={40} style={{ marginRight: 10 }}
            color={ratingCount >= 3 ? '#FFBB00' : '#B9B9B9'} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => { rateChange(4) }}>
          <FontAwesome
            name={ratingCount >= 4 ? 'star' : 'star-o'}
            size={40} style={{ marginRight: 10 }}
            color={ratingCount >= 4 ? '#FFBB00' : '#B9B9B9'} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => { rateChange(5) }}>
          <FontAwesome
            name={ratingCount >= 5 ? 'star' : 'star-o'}
            size={40} style={{ marginRight: 10 }}
            color={ratingCount >= 5 ? '#FFBB00' : '#B9B9B9'} />
        </TouchableWithoutFeedback>
      </View>
    );
  }
  useEffect(async () => {
    setCanVisited(true)
    try {
      var id = await AsyncStorage.getItem('id', id);
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: 'get_all_vist_by_user_id',
          user_id: id
        })
      });
      let res = await response.json();
      var visited = res.find(({ status }) => status == 1);
      if (visited?.status == 1 && visited?.gym_id == route.params.GymId) {
        setVisited(true)
      } else {
        setVisited(false)
        if (visited == undefined || visited == null || visited == '') {
          setCanVisited(true)
        } else {
          if (visited.gym_id == route.params.GymId) {
            setCanVisited(true)
          } else {
            setCanVisited(false)
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, [route.params.GymId])
  async function updateStatus(status) {
    var id = await AsyncStorage.getItem('id', id);
    try {
      let response = await fetch('http://10.0.2.2:80/graduationProject/index.php', {
        method: 'POST',
        body: JSON.stringify({
          type: status == 1 ? 'status' : 'delete_visit',
          gym_id: route.params.GymId,
          user_id: id,
        })
      });
      let res = await response.json();
      setCanVisited(true)
      setVisited(status == 1 ? true : false)
    } catch (e) {
      console.warn(e);
    }
  }
  return (
    <View style={styles.container}>
      {/* gym Image */}
      <View style={styles.header}>
        <View>
          <ImageBackground
            style={{ width: '100%', height: '100%' }}
            source={{
              uri:
                route.params.gymData.ImagePath == '' || route.params.gymData.ImagePath == undefined || route.params.gymData.ImagePath == null || route.params.gymData.ImagePath == 'undefined' ?
                  ImagePath :
                  `data:png;base64,${route.params.gymData.ImagePath}`
            }}
          />
        </View>
        <Text style={styles.text_userNsme}>{data.GymName}</Text>
      </View>

      <View style={styles.footer}>
        {/* Gym Photos */}
        <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/' + data.gym_num)} style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center', marginTop: -15, marginBottom: 10 }}>
          <Image style={{ width: 35, height: 35, resizeMode: 'cover' }} source={{ uri: 'https://www.clipartmax.com/png/middle/25-256308_whatsapp-social-media-icons-whatsapp.png' }} />
          <Text style={[styles.text_footer, { fontWeight: 'bold', marginHorizontal: 7 }]}>Contact Gym On Whatsapp</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.text_footer}>Gym Photos </Text>
          {imageList.length != 0 && (
            <FlatList
              horizontal={true}
              data={imageList}
              keyExtractor={(item, index) => 'key' + index}
              renderItem={({ item }) => (
                item != '' && item != null && item != undefined && item != 'undefined' &&
                <View
                  style={{
                    height: 70,
                    width: 70,
                    borderRadius: 10,
                    margin: 10,
                  }}>
                  <ImageBackground
                    style={{ width: 70, height: 70 }}
                    source={{ uri: `data:png;base64,${item}` }}
                    imageStyle={{ borderRadius: 7 }}
                  />
                </View>
              )}
            />
          )}
        </View>
        {/* opening and closing times*/}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ paddingRight: 20, flex: 1 }}>
            <Text style={styles.text_footer}>Opening Time</Text>
            <View style={styles.action}>
              <Text style={styles.text_footer}>
                {getParsedDate(OpeningTime)}
              </Text>
            </View>
          </View>
          {/* closing time */}
          <View style={{ paddingRight: 20, flex: 1 }}>
            <Text style={styles.text_footer}>Closing Time</Text>
            <View style={styles.action}>
              <Text style={styles.text_footer}>
                {getParsedDate(ClosingTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* services */}
        <View style={styles.S_container}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.serviceText}>jacuzzi</Text>
                <CheckBox
                  style={{ flex: 1 }}
                  value={services.jacuzzi}
                  disabled={true}
                />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.serviceText}>pool</Text>
                <CheckBox
                  style={{ flex: 1 }}
                  value={services.pool}
                  disabled={true}
                />
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.serviceText}>steam</Text>
                <CheckBox
                  style={{ flex: 1 }}
                  value={services.steam}
                  disabled={true}
                />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.serviceText}>sauna</Text>
                <CheckBox
                  style={{ flex: 1 }}
                  value={services.sauna}
                  disabled={true}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 20, marginBottom: 10 }}>
          {getRating()}
        </View>
        {/* go to maps button */}
        {canVisited &&
          <View style={[styles.button, { backgroundColor: '#59FF64' }]}>
            <TouchableOpacity style={[styles.signIn, { backgroundColor: visited ? '#FF5959' : '#59FF64' }]} onPress={() => updateStatus(visited ? 0 : 1)}>
              <Text style={[styles.textSign, { color: '#000' }]}>{visited ? 'Finished' : 'Join Now'}</Text>
            </TouchableOpacity>
          </View>
        }
        <View style={styles.button}>
          <TouchableOpacity style={styles.signIn} onPress={() => goToMaps()}>
            <Text style={styles.textSign}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* end */}
      </View>
    </View>
  );
};

export default ShowGymScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  flexDirectionRow: {
    flexDirection: 'row'
  },
  S_container: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
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
  serviceText: { flex: 1, paddingTop: 5 },
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
