import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Button, TextInput} from 'react-native';

const LoginForm = ({setShowLoginForm}) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const onChangeUser = textVlaue => setUserName(textVlaue);
  const onChangePass = textVlaue => setPassword(textVlaue);

  return (
    <View style={{border: 1, borderColor: 'gray', padding: 15}}>
      <Text>login form</Text>
      <TextInput onChangeText={onChangeUser} placeholder={'username'} />
      <TextInput onChangeText={onChangePass} placeholder={'password'} />
      <Button title={'login'} />
      <Text onPress={() => setShowLoginForm(false)}>dont have an account?</Text>
    </View>
  );
};

export default LoginForm;
