import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Text, Alert, NativeModules } from 'react-native';
import { Input, Image, Button } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import FormData from 'form-data';
import * as Notifications from 'expo-notifications';
import { useRoute } from '@react-navigation/native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import CryptoJS from 'crypto-js';
import { event } from 'react-native-reanimated';




const Tab = createBottomTabNavigator();

const PaymentMethod1 = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  let [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const events = route.params?.events;
  const encrypt_data = route.params?.encrypt_data;
  const [biodata, SetBioData] = useState({});

  useEffect(() => {
    let amts = events.map(event => event.amount);
    setAmounts(amts);
    const requestPermission = async () => {
      const { granted } = await Notifications.getPermissionsAsync();
      if (!granted) {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermission();
    GetBioData();
  }, []);

  const GetBioData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const comradeid = await AsyncStorage.getItem('comradeid');
      try {
        // Replace 'your-api-endpoint' with the actual endpoint
        const apiUrl = 'https://portal.comradeskenya.com/api/api/event/biodata';

        // Define parameters (replace with your actual parameter names and values)
        const params = {
          token: userToken,
          comradeid: comradeid
        };

        // Make the GET request with parameters using Axios
        const response = await axios.get(apiUrl, { params });
        SetBioData(response.data[0]);
        console.log(biodata);
      } catch (error) {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
      }
    } catch (error) {
      console.log(error);
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    }
  }


  const showNotification = async (notification) => {

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Present the immediate notification
    await Notifications.presentNotificationAsync(notification);
  };

  const handlePaymentProcess = async () => {
    const comradeid = await AsyncStorage.getItem('comradeid');
    setLoading(true);
    let paymentData = new FormData();
    paymentData.append('comidyo', encrypt_data(comradeid));
    paymentData.append('cur', 'UGX');
    paymentData.append('telNumber', phoneNumber);
    paymentData.append('source', 'mobile');
    amounts.forEach((amount, index) => {
      paymentData.append(`event_amounts[${index}]`, amount);
    });
    events.forEach((event, index) => {
      paymentData.append(`event_ids[${index}]`, encrypt_data(event.id));
    });
    paymentData.append('email_address', biodata.email_address);
    paymentData.append('firstname', biodata.firstname);
    paymentData.append('lastname', biodata.lastname);
    try {
      const response = await axios.post('https://portal.comradeskenya.com/api/api/pay/yo', paymentData);

      if (!response.status === 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = response.data;
      if (responseData.toString().includes('failed')) {
        let notification = {
          title: 'Payment Failed',
          body: 'Funds could be insufficient'
        }
        showNotification(notification);
      } else if (responseData.toString().includes('Telephone')) {
        let notification = {
          title: 'Telephone Required',
          body: 'We cant process payment without your telephone'
        }
        showNotification(notification);
      } else {
        let notification = {
          title: 'Waiting For Payment',
          body: 'We shall soon notify you when approved.'
        }
        showNotification(notification);
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const changeAmounts = async (event, amount) => {
    const index = events.indexOf(event);
    let updatedAmounts = [...amounts];
    updatedAmounts[index] = parseInt(amount);
    setAmounts(updatedAmounts);
    const sumofNew = updatedAmounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let amts = events.map(event => event.amount);
    const sumofAmounts = amts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    console.log(sumofNew => sumofAmounts);
}



  return (
    <View style={styles.container}>
      <Text style={styles.paywith}>PAY WITH MTN & AIRTEL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        keyboardType="number-pad"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
      />
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <Text style={{ alignSelf: 'flex-start' }}>Allocate amount for {event.description}</Text>
          <TextInput
            style={styles.input}
            placeholder={'Amount allocated for event'}
            keyboardType="number-pad"
            value={amounts[events.indexOf(event)] || ''}
            onChangeText={(text) => changeAmounts(event, text)}
          />
        </ React.Fragment>
      ))}

      <TouchableOpacity style={styles.process} onPress={handlePaymentProcess}>
        <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="green" />}
    </View>
  );
};

const PaymentMethod2 = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const route = useRoute();
  const events = route.params?.events;
  const [amounts, setAmounts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    let amts = events.map(event => event.amount);
    setAmounts(amts);
  }, []);


  const showNotification = async (notification) => {

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Present the immediate notification
    await Notifications.presentNotificationAsync(notification);
  };

  const changeAmounts = async (event, amount) => {
    const index = events.indexOf(event);
    let amts = amounts[index] = parseInt(amount);
    setAmounts(amts);
  }


  const handlePaymentProcess = async () => {
    let data = JSON.stringify({
      "tx_ref": "hooli-tx-1920bbtytty",
      "amount": "500",
      "currency": "UGX",
      "redirect_url": "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
      "meta": {
        "consumer_id": 23,
        "consumer_mac": "92a3-912ba-1192a"
      },
      "customer": {
        "email": "user@gmail.com",
        "phonenumber": "080****4528",
        "name": "Yemi Desola"
      },
      "customizations": {
        "title": "Pied Piper Payments",
        "logo": "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
      }
    });

    try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer FLWSECK_TEST-0442d8579a90467c9e866d42494c58b9-X'
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      alert(JSON.stringify(responseData));
    } catch (error) {
      console.error(error);
    }
  };



  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.paywith}>Pay with FlutterWave</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        keyboardType="number-pad"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
      />
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <Text style={{ alignSelf: 'flex-start' }}>Allocate amount for {event.description}</Text>
          <TextInput
            style={styles.input}
            placeholder={'Amount for ' + event.description}
            keyboardType="number-pad"
            value={amounts[events.indexOf(event)] || event.amount}
            onChangeText={(text) => changeAmounts(event, text)}
          />
        </ React.Fragment>
      ))}
      <TouchableOpacity style={styles.process} onPress={handlePaymentProcess}>
        <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="green" />}
    </View>
  );
};

const PaymentMethod3 = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const [events, setEvents] = useState([]);

  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/mpesa.png')}
        style={styles.pesa}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        keyboardType='number-pad'
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.process}>
        <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
      </TouchableOpacity>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabButton}
          >
            <Text style={styles.tabButtonText}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PayComponent = ({ route, navigation }) => {
  const { events, clearSelected } = route.params;
  const [encrypted_eventid, setEncEventIds] = useState([]);
  const [encomidid, setEncomidid] = useState('')

  const encrypt_data = (data) => {
    const secretKey = 'TheComrade67prototype';

    const plainText = data.toString();

    // Encrypt the data
    const encryptedData = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    return (encryptedData);
  }

  useEffect(() => {
    clearSelected();
  }, []);

  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="MTN & AIRTEL" component={PaymentMethod1} options={{ headerShown: false }} initialParams={{ events: events, encrypt_data: encrypt_data }} />
      <Tab.Screen name="FLUTTER WAVE" component={PaymentMethod2} options={{ headerShown: false }} initialParams={{ events: events, encrypt_data: encrypt_data }} />
      <Tab.Screen name="MPESA" component={PaymentMethod3} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'green',
    padding: 10,
  },
  tabButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  paywith: {
    fontSize: 20,
    marginTop: 5,
    color: 'green',
    fontWeight: 'bold'
  },
  image: {
    width: 300,
    height: 50,
    marginTop: 10
  },
  pesa: {
    width: 200,
    height: 80
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    marginTop: 10,
    borderRadius: 5,
    color: 'black',
  },
  process: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: 'green',
    color: 'white',
    borderRadius: 50,
    flexDirection: 'row'
  },
});

export default PayComponent;