// DashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
    const [responseData, setResponseData] = useState([]);
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [payFor, setPayFor] = useState([]);
    const route = useRoute();
    const { updateSelected, clearSelected } = route.params;
    const [biodata, SetBioData] = useState([]);

    useEffect(() => {
        checkLoginStatus();
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


    const checkLoginStatus = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            setLoggedIn(!!userToken);

            try {
                const apiUrl = 'https://portal.comradeskenya.com/api/api/event/readon';
                const params = { token: userToken };

                const response = await axios.get(apiUrl, { params });
                setResponseData(response.data);

                const expired = 'https://portal.comradeskenya.com/api/api/event/readoff';
                const response2 = await axios.get(expired, { params });
                setResponseData(response.data.concat(response2.data));
            } catch (error) {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('comradeid');
                navigation.replace('Login');
            }
        } catch (error) {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('comradeid');
            navigation.replace('Login');
        }
    };

    const addpayFor = (event) => {
        updateSelected(event);
        setPayFor(prevPayFor => {
            if (prevPayFor.includes(event)) {
                return prevPayFor.filter(item => item !== event);
            } else {
                return [...prevPayFor, event];
            }
        });
    }

    const handleSearch = async () => {
        setResponseData([]);
        if (searchText.length >= 1) {

            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const apiUrl = 'https://portal.comradeskenya.com/api/api/event/readon';
                const params = { token: userToken };
                const response = await axios.get(apiUrl, { params });
                const expired = 'https://portal.comradeskenya.com/api/api/event/readoff';
                const response2 = await axios.get(expired, { params });

                const data = [...response.data, ...response2.data];

                const filteredData = data.filter(event =>
                    event.description.toLowerCase().includes(searchText.toLowerCase())
                );

                setResponseData(filteredData);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately, e.g., show a message to the user
            }
        }
        else {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const apiUrl = 'https://portal.comradeskenya.com/api/api/event/readon';
                const params = { token: userToken };
                const response = await axios.get(apiUrl, { params });
                const expired = 'https://portal.comradeskenya.com/api/api/event/readoff';
                const response2 = await axios.get(expired, { params });
                const data = [...response.data, ...response2.data];

                setResponseData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately, e.g., show a message to the user
            }
        }
    };


    const getEventParticipants = async (eventid) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const apiUrl = 'https://portal.comradeskenya.com/api/api/event/paidfor';
            const params = { token: userToken, eventid };

            const response = await axios.get(apiUrl, { params });
            const participantsData = response.data;

            setParticipants((prevParticipants) => ({
                ...prevParticipants,
                [eventid]: participantsData,
            }));
        } catch (error) {
            navigation.replace('Login');
        }
    };

    const handleLogout = () => {
        navigation.navigate('Login');
    };

    useEffect(() => {
        try {
            
            const fetchParticipantsPromises = responseData.map((event) => getEventParticipants(event.id));
    
            Promise.all(fetchParticipantsPromises)
                .then(() => {
                    console.log('All participants data fetched:', participants);
                })
                .catch((error) => {
                    console.error('Error fetching participants:', error);
                    navigation.replace('Login');
                });
        } catch (error) {
            navigation.replace('Login');
        }
    }, [responseData]);

    const handleEventPress = (event) => {
        navigation.navigate('Event Participants', { event: event });
    };

    return (
        <>
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

                {responseData.length == 0 ? (
                    <ActivityIndicator style={{ marginTop: 50 }} size="large" color="green" />
                ) : (
                    <>
                        <View style={styles.container}>
                            <Text style={styles.welcomeText}>Comrades Dashboard!</Text>
                            {responseData.map((event) => (
                                <Card key={event.id} containerStyle={styles.cardContainer}>
                                    <View>
                                        <Card.Title>{event.description}</Card.Title>
                                        {event.status == 'on' ? (
                                            <Text style={styles.statusActive}>Active</Text>
                                        ) : (
                                            <Text style={styles.statusExpired}>Expired</Text>
                                        )}
                                    </View>
                                    <Card.Divider />
                                    <Text style={styles.field}>Date: {event.date}</Text>
                                    {Object.entries(participants).map(([eventid, participantsData]) => (
                                        event.id === eventid && (
                                            <TouchableOpacity key={event.id}>
                                                <Text key={eventid} style={styles.field}>
                                                    Participants: {participantsData.length}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    ))}
                                    <Text style={styles.field}>Amount Required: {event.amount} UGX</Text>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.reportButton}
                                            onPress={() => handleEventPress(event)}
                                        >
                                            <Text style={styles.buttonText}>Paid List</Text>
                                        </TouchableOpacity>
                                        {event.status == 'on' && !participants[event.id]?.some(participant => (participant.firstname+participant.lastname) === (biodata.firstname+biodata.lastname)) ? (
                                            <TouchableOpacity style={styles.payButton} onPress={() => addpayFor(event)}>
                                                <Text style={styles.buttonText}>Pay {payFor.includes(event) && <>✔</>}</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <Text></Text>
                                        )}
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </>
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
