// LoginComponent.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Text, Image } from 'react-native-elements';

const ResetPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const enterCode = () => {
    navigation.navigate('Change Password');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://portal.comradeskenya.com/assets/cond/comrade.png' }}
        style={styles.image}
      />
      <Text style={styles.textcenter}>Reset Password</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.btn} onPress={enterCode}>
        <Text style={styles.textwhite}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center'
  },
  textright: {
    marginTop: 10,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    color: 'red'
  },
  textcenter: {
    fontSize: 25,
    color: 'green',
    fontWeight: 'bold',
    paddingBottom: 10
  },
  btn: {
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 5,
  },
  textwhite: {
    color: 'white'
  },
  image: {
    width: 150,
    height: 150
  }
});

export default ResetPassword;
