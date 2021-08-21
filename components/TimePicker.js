import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
var date = new Date('2021-04-29T03:30:53.580Z');
var Hours = date.getHours();
var Minutes = date.getMinutes();
if (Hours < 10) {
  Hours = '0' + Hours.toString();
}
if (Minutes < 10) {
  Minutes = '0' + Minutes.toString();
}
var defaultDate = Hours + ' : ' + Minutes;
const TimePicker = ({ text, id }) => {
  const [dataa, setDataa] = useState({
    check: 'found',
    id,
  });
  const [ViewDatePicker, setViewDatePicker] = useState(false);
  const [Time, setTime] = useState(defaultDate);

  useEffect(async () => {
    let id = null;
    id = await AsyncStorage.getItem('id', id);
    await axios
      .get(
        `http://10.0.2.2:80/graduationProject/index.php?type=get_gym&gym_id=\'${id}\'`,
      )
      .then(response => {
        if (response.data[0].open_time != null) {
          if (text == 'Opening time') {
            setTime(response.data[0].open_time);
            setDataa({
              ...dataa,
              id: id,
            });
          } else if (response.data[0].close_time != null) {
            setTime(response.data[0].close_time);
            setDataa({
              ...dataa,
              id: id,
            });
          }
        } else {
          setDataa({
            ...dataa,
            id: id,
          });
        }
      })
      .catch(e => console.warn(e));
    //console.warn(Time);
  }, []);

  function getParsedDate(date) {
    date = String(date);
    return date;
  }

  const changedDate = (selectedDate) => {
    let Hours = selectedDate.getHours();
    let Minutes = selectedDate.getMinutes();
    if (Hours < 10) {
      Hours = '0' + Hours.toString();
    }
    if (Minutes < 10) {
      Minutes = '0' + Minutes.toString();
    }
    const currentDate = Hours + ':' + Minutes;
    console.log(currentDate);
    if (currentDate != undefined || currentDate != null) {
      setTime(currentDate);
      setViewDatePicker(!ViewDatePicker);
      sendToServer(currentDate);
    } else {
      // console.warn('nothing to display');
    }
  };

  const onPressedDate = () => {
    setViewDatePicker(!ViewDatePicker);
  };

  const sendToServer = async Time => {
    try {
      let time = Time;
      {
        text == 'Opening time'
          ? await axios
            .patch(
              `http://10.0.2.2:80/graduationProject/index.php?type=edit_opentime&gym_id=\'${dataa.id}\'&open_time=\'${time}\'`,
            )
            .catch(e => console.warn(e))
          : await axios
            .patch(
              `http://10.0.2.2:80/graduationProject/index.php?type=edit_closetime&gym_id=\'${dataa.id}\'&close_time=\'${time}\'`,
            )
            .catch(e => console.warn(e));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <>
      <View style={{ paddingRight: 20 }}>
        <Text style={styles.text_footer}>{text}</Text>
        <TouchableOpacity style={styles.action} onPress={() => onPressedDate()}>
          {text == 'Opening time' ? (
            <Text style={styles.text_footer}>{getParsedDate(Time)}</Text>
          ) : (
            <Text style={styles.text_footer}>{getParsedDate(Time)}</Text>
          )}
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        mode="time"
        display="clock"
        value={Time}
        iconSource={null}
        isVisible={ViewDatePicker}
        onConfirm={(date) => changedDate(date)}
        onCancel={() => onPressedDate}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        is24Hour={false}
      />
    </>
  );
};

export default TimePicker;

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
});
