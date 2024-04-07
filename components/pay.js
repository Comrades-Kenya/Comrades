import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Text, Alert, NativeModules, ScrollView } from 'react-native';
import { Input, Image, Button } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import FormData from 'form-data';
import * as Notifications from 'expo-notifications';
import { useRoute } from '@react-navigation/native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { encode, decode } from 'base-64';

const Tab = createBottomTabNavigator();

const PaymentMethod1 = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  let [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const events = route.params?.events;
  const [biodata, SetBioData] = useState({});
  const [valid, setValid] = useState(true);
  const [members, setMembers] = useState([]);

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
    getmembers();
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

  const getmembers = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      try {
        const apiUrl = 'https://portal.comradeskenya.com/api/api/event/members';
        const params = {
          token: userToken,
        };
        const response = await axios.get(apiUrl, { params });
        let memberset = response.data.map(member => ({ label: `${member.firstname} ${member.lastname}`, value: member.id }));
        setMembers(memberset);
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

  const handlePaymentProcess = async () => {
    const comradeid = await AsyncStorage.getItem('comradeid');
    setLoading(true);
    let paymentData = new FormData();
    paymentData.append('comidyo', encode(comradeid));
    paymentData.append('cur', 'UGX');
    paymentData.append('telNumber', phoneNumber);
    paymentData.append('source', 'mobile');
    amounts.forEach((amount, index) => {
      paymentData.append(`event_amounts[${index}]`, amount);
    });
    events.forEach((event, index) => {
      paymentData.append(`event_ids[${index}]`, encode(event.id));
    });
    paymentData.append('email_address', biodata.email_address);
    paymentData.append('firstname', biodata.firstname);
    paymentData.append('lastname', biodata.lastname);
    try {
      const response = await axios.post(
        'https://portal.comradeskenya.com/api/api/pay/yo',
        paymentData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );


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
    if (sumofNew >= sumofAmounts) {
      setValid(true);
    }
    else {
      setValid(false);
    }
  }

  const names = ['John', 'Alice', 'Bob', 'Emma', 'Michael', 'Olivia', 'William', 'Sophia'];

  const [suggestedValue, setSuggestedValue] = useState('');
  const handleSuggestionChange = (text) => {
    // Implement logic to handle suggestions based on text input
    // For example, you can fetch suggestions from an API and set them in the state
    setSuggestedValue(text);
  };

  const setPayer = async (memberid) => {

  }

  return (
    <View style={styles.container}>
      <Text style={styles.paywith}>PAY WITH MTN & AIRTEL</Text>
      {/* Text Input with suggestions */}
      <TextInput
        style={styles.input}
        placeholder="Search a member."
        onChangeText={handleSuggestionChange}
        value={suggestedValue}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
        {names.map((name, index) => (
          <Text key={index} style={styles.name}>{name}</Text>
        ))}
      </ScrollView>
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
            style={{ ...styles.input, borderColor: valid ? '#ccc' : 'red' }}
            placeholder="Enter amount"
            keyboardType="number-pad"
            onChangeText={(amount) => changeAmounts(event, amount)}
          />
        </React.Fragment>
      ))}
      {valid &&
        <TouchableOpacity style={styles.process} onPress={handlePaymentProcess}>
          <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
        </TouchableOpacity>
      }
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
  const [biodata, SetBioData] = useState({});
  const [valid, setValid] = useState(true);
  const [mpesaset, setMpesa] = useState(true);

  useEffect(() => {
    let amts = events.map(event => event.amount);
    setAmounts(amts);
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
        console.log(response.data[0]);
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

  const changeAmounts = async (event, amount) => {
    const index = events.indexOf(event);
    let updatedAmounts = [...amounts];
    updatedAmounts[index] = parseInt(amount);
    setAmounts(updatedAmounts);
    const sumofNew = updatedAmounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let amts = events.map(event => event.amount);
    const sumofAmounts = amts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    if (sumofNew >= sumofAmounts) {
      setValid(true);
    }
    else {
      setValid(false);
    }
  }


  const handlePaymentProcess = async () => {
    setLoading(true);
    const total_amount = amounts.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue), 0);
    const paymentData = {
      tx_ref: "comrades " + Date.now(),
      amount: total_amount,
      currency: "UGX",
      redirect_url: "https://portal.comradeskenya.com/multipletest",
      payment_options: "mobile_money",
      targeturl: "https://api.flutterwave.com/v3/payments/",
      method: "POST",
      key: "FLWSECK-f9739c6e759369e4b432a1005f32ffb0-18c26582fb6vt-X",
      customer: {
        email: biodata.email_address,
        phonenumber: biodata.whatsapp,
        name: biodata.firstname + ' ' + biodata.lastname
      },
      customizations: {
        title: `Pay for ${events.length} Comrades Events`,
        logo: "https://portal.comradeskenya.com/assets/cond/comrade.png"
      },
      meta: {
        price: total_amount,
        comrade_id: encode(biodata.admin_id),
        event_ids: events.map(event => encode(event.id)).join(","),
        event_amounts: amounts.join(","),
        memberid: encode(biodata.admin_id),
        source: "mobile"
      }
    };

    try {
      const response = await axios.post('https://portal.comradeskenya.com/api/api/pay/forward', paymentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const flutter = response.data;
      setLoading(false);
      navigation.navigate('FlutterWave & Mpesa', { url: flutter.data.link });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };




  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.paywith}>Pay with FlutterWave</Text>
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <Text style={{ alignSelf: 'flex-start' }}>Allocate amount for {event.description}</Text>
          <TextInput
            style={styles.input}
            placeholder={'Amount for ' + event.description}
            keyboardType="number-pad"
            value={amounts[events.indexOf(event)] || ''}
            onChangeText={(text) => changeAmounts(event, text)}
          />
        </ React.Fragment>
      ))}
      {valid &&
        <TouchableOpacity style={styles.process} onPress={handlePaymentProcess}>
          <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
        </TouchableOpacity>
      }

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="green" />}
    </View>
  );
};

const PaymentMethod3 = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const route = useRoute();
  const events = route.params?.events;
  const [amounts, setAmounts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [biodata, SetBioData] = useState({});
  const [valid, setValid] = useState(true);
  const [mpesaset, setMpesa] = useState(true);

  useEffect(() => {
    let amts = events.map(event => event.kes);
    setAmounts(amts);
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
        console.log(response.data[0]);
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

  const changeAmounts = async (event, amount) => {
    const index = events.indexOf(event);
    let updatedAmounts = [...amounts];
    updatedAmounts[index] = parseInt(amount);
    setAmounts(updatedAmounts);
    const sumofNew = updatedAmounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let sumofAmounts = 0;
    if (events[0].kes == undefined) {
      let amts = events.map(event => 500);
      sumofAmounts = amts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }
    else {
      let amts = events.map(event => event.kes);
      sumofAmounts = amts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }
    if (sumofNew >= sumofAmounts) {
      setValid(true);
    }
    else {
      setValid(false);
    }
  }


  const handlePaymentProcess = async () => {
    setLoading(true);
    const total_amount = amounts.reduce((accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue), 0);
    const paymentData = {
      tx_ref: "comrades " + Date.now(),
      amount: total_amount,
      currency: "KES",
      redirect_url: "https://portal.comradeskenya.com/multipletest",
      payment_options: "mpesa",
      targeturl: "https://api.flutterwave.com/v3/payments/",
      method: "POST",
      key: "FLWSECK-f9739c6e759369e4b432a1005f32ffb0-18c26582fb6vt-X",
      customer: {
        email: biodata.email_address,
        phonenumber: biodata.whatsapp,
        name: biodata.firstname + ' ' + biodata.lastname
      },
      customizations: {
        title: `Pay for ${events.length} Comrades Events`,
        logo: "https://portal.comradeskenya.com/assets/cond/comrade.png"
      },
      meta: {
        price: total_amount,
        comrade_id: encode(biodata.admin_id),
        event_ids: events.map(event => encode(event.id)).join(","),
        event_amounts: amounts.join(","),
        memberid: encode(biodata.admin_id),
        source: "mobile"
      }
    };

    try {
      const response = await axios.post('https://portal.comradeskenya.com/api/api/pay/forward', paymentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const flutter = response.data;
      setLoading(false);
      navigation.navigate('FlutterWave & Mpesa', { url: flutter.data.link });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };




  const handleOptionChange = (itemValue) => {
    setSelectedOption(itemValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.paywith}>Pay with MPESA</Text>
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <Text style={{ alignSelf: 'flex-start' }}>Allocate amount for {event.description}</Text>
          <TextInput
            style={styles.input}
            placeholder={'Amount for ' + event.description}
            keyboardType="number-pad"
            value={amounts[events.indexOf(event)] || ''}
            onChangeText={(text) => changeAmounts(event, text)}
          />
        </ React.Fragment>
      ))}
      {valid &&
        <TouchableOpacity style={styles.process} onPress={handlePaymentProcess}>
          <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Process Payment </Text>
        </TouchableOpacity>
      }

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="green" />}
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
  const [pesa, setPesa] = useState([]);

  useEffect(() => {
    const filteredEvents = events.filter(event => event.kes !== null && event.kes !== "0");
    console.log(filteredEvents);
    setPesa(filteredEvents);
  }, []);

  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="MTN & AIRTEL" component={PaymentMethod1} options={{ headerShown: false }} initialParams={{ events: events }} />
      <Tab.Screen name="FLUTTER WAVE" component={PaymentMethod2} options={{ headerShown: false }} initialParams={{ events: events }} />
      {pesa.length > 0 &&
        <Tab.Screen name="MPESA" component={PaymentMethod3} options={{ headerShown: false }} initialParams={{ events: pesa }} />
      }
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
    fontWeight: 'bold',
    marginBottom: 10
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
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  scrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  name: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'gray',
    borderRadius: 20,
    marginRight: 10,
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