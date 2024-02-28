// App.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginComponent from './components/login';
import DashboardScreen from './components/dashboard';
import PayComponent from './components/pay';
import ResetPassword from './components/forgotpassword';
import EnterCode from './components/resetpassword';
import Menu from './components/menu';
import ParticipantsScreen from './components/partcipants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FloatingButton from './components/float';
import FlutterView from './components/flutter';
import MenuIcon from './components/menuicon';
import { set } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  const [notification, setNotifications] = useState([]);
  const [payFor, setPayFor] = useState([]);
  const [floatvisible, setFloatvisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(fetchData, 5000);
  }, []);


  const updateSelected = (event) => {
    setPayFor(prevPayFor => {
      if (prevPayFor.includes(event)) {
        return prevPayFor.filter(item => item !== event);
      } else {
        return [...prevPayFor, event];
      }
    });
    setFloatvisible(true);
  }


  const clearSelected = () => {
    setFloatvisible(false);
  }


  const fetchData = async () => {
    try {
      const comradeid = await AsyncStorage.getItem('comradeid');
      const response = await axios.get('https://notifications.edu-metrics.com/api/fetch/?user_id=' + comradeid);

      const notifications = response.data;

      setNotifications(notifications.notifications);

      notifications.notifications.forEach(notification => {
        showNotification(notification);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const showNotification = async (notification) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    await Notifications.presentNotificationAsync(notification);
  };

  const handleProfileSettings = () => {
    console.log('Profile Settings pressed');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginComponent} />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              headerRight: () => (
                <MenuIcon />
              ),
            }}
            initialParams={{ updateSelected: updateSelected, payFor: clearSelected }}
          />
          <Stack.Screen name="Pay" component={PayComponent} />
          <Stack.Screen name="Reset Password" component={ResetPassword} />
          <Stack.Screen name="Change Password" component={EnterCode} />
          <Stack.Screen name="Event Participants" component={ParticipantsScreen} />
          <Stack.Screen name="FlutterWave" component={FlutterView} />
          <Stack.Screen name="Menu">
            {() => <Menu onProfileSettings={handleProfileSettings} />}
          </Stack.Screen>
        </Stack.Navigator>
        {/* Floating Button */}
        {payFor.length > 0 && floatvisible && <FloatingButton payFor={payFor} clearSelected={clearSelected} />}
      </NavigationContainer>
    </GestureHandlerRootView>

  );
}