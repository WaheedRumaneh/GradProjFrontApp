import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from 'react-native-paper';
import {
  black,
  green100,
  green500,
} from 'react-native-paper/lib/typescript/styles/colors';
import { AuthContext } from '../components/context';
import axios from 'axios';
import { ScrollView } from 'react-native';

//import Users from '../model/users';

const SignInScreen = ({ navigation }) => {
  const [data, setData] = React.useState({
    email: '',
    password: '',
    check_textInputChange: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
    userType: '',
    modalVisible: true,
  });

  const { colors } = useTheme();

  const { signIn } = React.useContext(AuthContext);

  const textInputChange = val => {
    if (val.trim().length >= 5) {
      setData({
        ...data,
        email: val,
        check_textInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        email: val,
        check_textInputChange: false,
        isValidUser: false,
      });
    }
  };

  const handlePasswordChange = val => {
    if (val.trim().length >= 8) {
      setData({
        ...data,
        password: val,
        isValidPassword: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false,
      });
    }
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const handleValidUser = val => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };

  const loginHandle = async (email, password) => {
    let Users = null;
    try {
      if (data.userType == 'Player') {
        await axios
          .get(
            `http://10.0.2.2:80/graduationProject/index.php?type=sign_in&email=\'${email}\'&pass=\'${password}\'`,
          )
          .then(response => (Users = response.data));
        // .then(response => console.warn(response));
      } else {
        await axios
          .get(
            `http://10.0.2.2:80/graduationProject/index.php?type=gym_sign_in&email=\'${email}\'&pass=\'${password}\'`,
          )
          .then(response => (Users = response.data));
        // .then(response => console.warn(response.data));
      }
    } catch (e) {
      console.warn(e);
    }

    const foundUser = Users.filter(item => {
      // console.warn(item);
      if (data.userType == 'Player') {
        return email == item.E_mail && password == item.pass;
      } else {
        return email == item.gym_email && password == item.pass;
      }
    });

    if (data.email.length == 0 || data.password.length == 0) {
      Alert.alert('Wrong Input!', 'email or password field cannot be empty.', [
        { text: 'Okay' },
      ]);
      return;
    }

    if (foundUser.length == 0) {
      Alert.alert('Invalid User!', 'email or password is incorrect.', [
        { text: 'Okay' },
      ]);
      return;
    }
    signIn(foundUser, data.userType);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#009387', position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#009387" barStyle="light-content" />
        {/* modal view */}
        <View style={styles.header}>
          <Text style={[styles.text_header, { marginTop: '43%' }]}>Welcome!</Text>
        </View>
        <Modal visible={data.modalVisible}>
          <View
            style={{
              backgroundColor: '#fff',
              marginTop: '50%',
              alignItems: 'center',
            }}>
            <View style={styles.button}>
              <TouchableOpacity
                style={styles.text_header}
                onPress={() =>
                  setData({
                    ...data,
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
                    ...data,
                    userType: 'Gym',
                    modalVisible: false,
                  })
                }>
                <Text style={styles.textSign}>Gym</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Animatable.View
          animation="fadeInUpBig"
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
            },
          ]}>
          {/* email */}
          <Text
            style={[
              styles.text_footer,
              {
                color: colors.text,
              },
            ]}>
            email
        </Text>
          <View style={styles.action}>
            <FontAwesome name="user-o" color={colors.text} size={20} />
            <TextInput
              placeholder="Your email"
              placeholderTextColor="#666666"
              style={[
                styles.textInput,
                {
                  color: colors.text,
                },
              ]}
              autoCapitalize="none"
              onChangeText={val => textInputChange(val.toLowerCase())}
              onEndEditing={e =>
                handleValidUser(e.nativeEvent.text.toLowerCase())
              }
            />
            {data.check_textInputChange ? (
              <Animatable.View animation="bounceIn">
                <Feather name="check-circle" color="green" size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {data.isValidUser ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                email must be 4 characters long.
            </Text>
            </Animatable.View>
          )}
          {/* Password */}
          <Text
            style={[
              styles.text_footer,
              {
                color: colors.text,
                marginTop: 35,
              },
            ]}>
            Password
        </Text>
          <View style={styles.action}>
            <Feather name="lock" color={colors.text} size={20} />
            <TextInput
              placeholder="Your Password"
              placeholderTextColor="#666666"
              secureTextEntry={data.secureTextEntry ? true : false}
              style={[
                styles.textInput,
                {
                  color: colors.text,
                },
              ]}
              autoCapitalize="none"
              onChangeText={val => handlePasswordChange(val)}
            />
            <TouchableOpacity onPress={updateSecureTextEntry}>
              {data.secureTextEntry ? (
                <Feather name="eye-off" color="grey" size={20} />
              ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
            </TouchableOpacity>
          </View>
          {data.isValidPassword ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Password must be 8 characters long.
            </Text>
            </Animatable.View>
          )}

          {/*<TouchableOpacity>
          <Text style={{color: '#009387', marginTop: 15}}>
            Forgot password?
          </Text>
        </TouchableOpacity>*/}

          {/*SignIn Button */}
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => loginHandle(data.email, data.password)}>
              <Text
                style={[
                  styles.textSign,
                  {
                    color: '#fff',
                  },
                ]}>
                Sign In
            </Text>
            </TouchableOpacity>
            {/*Sign Up Button*/}
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUpScreen')}
              style={[
                styles.signIn,
                {
                  borderColor: '#fff',
                  borderWidth: 1,
                  marginTop: 15,
                },
              ]}>
              <Text
                style={[
                  styles.textSign,
                  {
                    color: '#fff',
                  },
                ]}>
                Sign Up
            </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;

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
    backgroundColor: '#009387',
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
