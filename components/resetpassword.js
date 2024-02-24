// LoginComponent.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Text, Image } from 'react-native-elements';

const EnterCode = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Implement your login logic here
    console.log('Email:', email);
    // You can add authentication logic here
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://portal.comradeskenya.com/assets/cond/comrade.png' }}
        style={styles.image}
      />
      <Text style={styles.textcenter}>Change Password</Text>
      <Input
        placeholder="Code sent via email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <Input
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        placeholder="Confirm Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.textwhite}>Submit</Text>
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
    fontStyle: 'bold',
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

export default EnterCode;
