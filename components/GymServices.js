import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  FlatList,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GymServices = () => {
  const [data, setData] = useState({
    services: {
      jacuzzi: false,
      steam: false,
      sauna: false,
      pool: false,
    },
    showSaveButton: false,
  });
  const [id, setId] = useState(null);

  useEffect(async () => {
    let id = null;
    try {
      id = await AsyncStorage.getItem('id', id);
      axios
        .get(
          `http://10.0.2.2:80/graduationProject/index.php?type=get_gym&gym_id=\'${id}\'`,
        )
        .then(response => {
          // console.warn(response.data[0]);
          if (response.data[0].steem != null) {
            setData({
              ...data,
              services: {
                steam: response.data[0].steem == '1',
                sauna: response.data[0].sauna == '1',
                pool: response.data[0].pool == '1',
                jacuzzi: response.data[0].jacuzzi == '1',
              },
            });
          }
          setId(id);
        });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const submit = async () => {
    try {
      await axios
        .patch(
          `http://10.0.2.2:80/graduationProject/index.php?type=edit_services&gym_id=${id}&sauna=${data.services.sauna}&jacuzzi=${data.services.jacuzzi}&pool=${data.services.pool}&steem=${data.services.steam}`,
        )
        .catch(e => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
    setData({
      ...data,
      showSaveButton: false,
    });
  };

  return (
    <View style={styles.S_container}>
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.serviceText}>jacuzzi</Text>
            <CheckBox
              style={{flex: 1}}
              value={data.services.jacuzzi}
              onValueChange={() =>
                setData({
                  ...data,
                  services: {
                    ...data.services,
                    jacuzzi: !data.services.jacuzzi,
                  },
                  showSaveButton: true,
                })
              }
            />
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.serviceText}>pool</Text>
            <CheckBox
              style={{flex: 1}}
              value={data.services.pool}
              onValueChange={() =>
                setData({
                  ...data,
                  services: {
                    ...data.services,
                    pool: !data.services.pool,
                  },
                  showSaveButton: true,
                })
              }
            />
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.serviceText}>steam</Text>
            <CheckBox
              style={{flex: 1}}
              value={data.services.steam}
              onValueChange={() =>
                setData({
                  ...data,
                  services: {
                    ...data.services,
                    steam: !data.services.steam,
                  },
                  showSaveButton: true,
                })
              }
            />
          </View>
          <View style={styles.service}>
            <Text style={styles.serviceText}>sauna</Text>
            <CheckBox
              style={{flex: 1}}
              value={data.services.sauna}
              onValueChange={() =>
                setData({
                  ...data,
                  services: {
                    ...data.services,
                    sauna: !data.services.sauna,
                  },
                  showSaveButton: true,
                })
              }
            />
          </View>
        </View>
      </View>
      {data.showSaveButton && (
        <View style={styles.button}>
          <TouchableOpacity style={styles.signIn} onPress={() => submit()}>
            <Text style={styles.textSign}>Save changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GymServices;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  S_container: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  service: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceText: {flex: 1, paddingTop: 5},
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
    fontSize: 17,
    color: '#fff',
    fontWeight: 'bold',
  },
});
