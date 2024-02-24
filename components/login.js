// LoginComponent.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Input, Text, Image } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const LoginComponent = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    checkLoginStatus();
    const requestPermission = async () => {
      const { granted } = await Notifications.getPermissionsAsync();
      if (!granted) {
        await Notifications.requestPermissionsAsync();
      }
    };

    requestPermission();
  }, []);

  const showNotification = async () => {
    // Define the notification content
    const notificationContent = {
      title: 'Logged in successfully',
      body: 'Welcome back comrade!',
      data: { key: 'value' },
    };

    // Set the notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Present the immediate notification
    await Notifications.presentNotificationAsync(notificationContent);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log(userToken);
      setLoggedIn(!!userToken);
      if (userToken) {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Replace 'your-api-endpoint' with the actual endpoint you want to send the POST request to
      const apiUrl = 'https://portal.comradeskenya.com/api/api/auth/login';

      // Replace 'your-data' with the data you want to send in the POST request
      const postData = {
        email: email,
        password: password,
      };

      // Make the POST request using Axios
      const response = await axios.post(apiUrl, postData);

      // Handle the response data
      setResponseData(response.data);
      const userToken = response.data.api_key;

      // Save the user token in AsyncStorage
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('comradeid', response.data.comradeid);

      // Update the state to reflect the logged-in status
      setLoggedIn(true);
      showNotification();
      navigation.replace('Dashboard');
    } catch (error) {
      setIsLoading(false);
      console.log('Error making POST request:' + error);
      toggleVisibility();
    }
  };

  const resetPassword = () => {
    navigation.navigate('Reset Password');
  };

  return (
    <View style={styles.container}>
      {isLoading ? (<ActivityIndicator size="large" color="green" />) : (
        <>
          <Image
            source={{ uri: 'https://portal.comradeskenya.com/assets/cond/comrade.png' }}
            style={styles.image}
          />
          <Text>Powered by Waesta Enterprises</Text>
          <Text style={styles.textcenter}>Let's get started</Text>

          {isVisible && <Text style={styles.warning}>Wrong Email or Password</Text>}
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.textwhite}>Login</Text>
          </TouchableOpacity>
          <Text onPress={resetPassword} style={styles.textright}>Forgot password</Text>
        </>
      )}
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
  },
  warning: {
    backgroundColor: 'red',
    color: 'white',
    padding: 5,
    borderRadius: 5
  }
});

export default LoginComponent;
