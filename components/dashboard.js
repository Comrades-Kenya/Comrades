import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CheckBox } from '@rneui/themed';
import { Card, Icon } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
    const [responseData, setResponseData] = useState([]);
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [payFor, setPayFor] = useState([]);
    const route = useRoute();
    const { updateSelected } = route.params;
    const [biodata, setBioData] = useState({});

    useEffect(() => {
        checkLoginStatus();
        getBioData();
    }, []);

    const getBioData = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const comradeid = await AsyncStorage.getItem('comradeid');
            const apiUrl = 'https://portal.comradeskenya.com/api/api/event/biodata';
            const params = { token: userToken, comradeid: comradeid };
            const response = await axios.get(apiUrl, { params });
            setBioData(response.data[0]);
        } catch (error) {
            handleLogout();
        }
    }

    const checkLoginStatus = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            setLoggedIn(!!userToken);
            const apiUrl = 'https://portal.comradeskenya.com/api/api/event/readon';
            const params = { token: userToken };
            const response = await axios.get(apiUrl, { params });
            setResponseData(response.data);
        } catch (error) {
            handleLogout();
        }
    };

    const handleSearch = async () => {
        setResponseData([]);
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const apiUrl = 'https://portal.comradeskenya.com/api/api/event/readon';
            const params = { token: userToken };
            const response = await axios.get(apiUrl, { params });
            const data = [...response.data];
            const filteredData = data.filter(event =>
                event.description.toLowerCase().includes(searchText.toLowerCase())
            );
            setResponseData(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addPayFor = (event) => {
        updateSelected(event);
        setPayFor(prevPayFor => {
            if (prevPayFor.some(item => item.id === event.id)) {
                return prevPayFor.filter(item => item.id !== event.id);
            } else {
                return [...prevPayFor, event];
            }
        });
        
    }

    const isChecked = (event) => {
        if (payFor.some(item => item.id === event.id)) {
            return true;
        } else {
            return false;
        }
    }
    

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('comradeid');
        navigation.replace('Login');
    };

    const handleEventPress = (event) => {
        navigation.navigate('Event Participants', { event });
    };

    return (
        <ScrollView>
            <View style={styles.searchwrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                />
                <TouchableOpacity onPress={handleSearch}>
                    <Icon
                        name="search"
                        type="font-awesome"
                        size={25}
                        color="green"
                        containerStyle={{ marginLeft: 10 }}
                    />
                </TouchableOpacity>
            </View>

            {responseData.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="green" />
            ) : (
                <View style={styles.container}>
                    <Text style={styles.welcomeText}>Comrades Dashboard!</Text>
                    {responseData.map((event) => (
                        <Card key={event.id} containerStyle={styles.cardContainer}>
                            <View>
                                <Card.Title>{event.description}</Card.Title>
                                <Text style={event.status === 'on' ? styles.statusActive : styles.statusExpired}>
                                    {event.status === 'on' ? 'Active' : 'Expired'}
                                </Text>
                            </View>
                            <Card.Divider />
                            <Text style={styles.field}>Date: {event.date}</Text>
                            <Text style={styles.field}>Participants: {event.participants.length}</Text>
                            <Text style={styles.field}>Amount Required: {event.amount} UGX</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={() => handleEventPress(event)}
                                >
                                    <Text style={styles.buttonText}>Paid List</Text>
                                </TouchableOpacity>
                                {event.status === 'on' && !event.participants.some(participant => (participant.firstname + participant.lastname) === (biodata.firstname + biodata.lastname)) && (
                                    <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
                                        <CheckBox
                                            checked={isChecked(event)}
                                            onPress={() => addPayFor(event)}
                                            containerStyle={{ margin: 0, padding: 0 }} // Adjusting the CheckBox container style
                                        />
                                    </View>
                                )}
                            </View>

                        </Card>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        flex: 1,
    },
    searchwrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: 'green',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginRight: 10,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'green',
    },
    cardContainer: {
        width: '100%',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-around',
    },
    reportButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    payButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlignVertical: 'center'
    },
    statusActive: {
        backgroundColor: 'green',
        padding: 5,
        borderRadius: 5,
        color: 'white',
    },
    statusExpired: {
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
        color: 'white',
    },
    field: {
        fontWeight: 'bold',
        padding: 5,
        borderRadius: 5,
        backgroundColor: 'black',
        color: 'white',
        marginBottom: 5,
    },
});

export default DashboardScreen;
